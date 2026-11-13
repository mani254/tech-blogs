import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserEntity } from '@org/dal';
import {
  generateAccessibleColor,
  OtpRepository,
  UserRepository,
} from '@org/dal';
import { hashPassword } from 'better-auth/crypto';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { RedisPresenceService } from '../redis/redis-presence.service';
import { auth } from './better-auth.config';
import {
  AuthResponseDto,
  ForgotPasswordRequestDto,
  GoogleLoginRequestDto,
  LoginRequestDto,
  MessageResponseDto,
  RegisterRequestDto,
  ResendOtpRequestDto,
  SendOtpRequestDto,
  SendOtpResponseDto,
  SendPhoneOtpRequestDto,
  SendPhoneOtpResponseDto,
  UserResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
  VerifyPhoneOtpRequestDto,
  VerifyPhoneOtpResponseDto,
} from './dto';
import { GoogleAuthService } from './services/google-auth.service';
import { SmsService } from './services/sms.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly redisPresenceService: RedisPresenceService,
  ) {}

  /**
   * Helper: Map DAL UserEntity to API UserResponseDto
   */
  private toUserResponseDto(user: UserEntity): UserResponseDto {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      gender: user.gender ?? undefined,
      birthday: user.birthday
        ? user.birthday instanceof Date
          ? user.birthday.toISOString()
          : String(user.birthday)
        : undefined,
      avatar: user.avatar,
      status: user.status,
      isOnline: user.isOnline,
      provider:
        (user.provider as 'credentials' | 'google' | 'both') || 'credentials',
      phone: user.phone ?? undefined,
      phoneVerified: user.phoneVerified ?? false,
      emailVerified: user.emailVerified,
      color: user.color ?? undefined,
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : String(user.createdAt),
      updatedAt:
        user.updatedAt instanceof Date
          ? user.updatedAt.toISOString()
          : String(user.updatedAt),
    };
  }

  /**
   * Helper: Create a persistent server session in Better Auth sessions collection.
   */
  private async createBetterAuthSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const db = mongoose.connection.db;

    if (db) {
      await db.collection('sessions').insertOne({
        userId,
        token: sessionToken,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      });
    }

    return sessionToken;
  }

  /**
   * 1. Send Email OTP
   */
  async sendOtp(dto: SendOtpRequestDto): Promise<SendOtpResponseDto> {
    const email = dto.email.toLowerCase().trim();

    // Enforce 60-second cooldown on the server
    const cooldown = await this.otpRepository.checkCooldown(
      email,
      dto.purpose,
      60,
    );
    if (cooldown.inCooldown) {
      throw new BadRequestException(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting a new OTP code.`,
      );
    }

    if (dto.purpose === 'register') {
      const userExists = await this.userRepository.findByEmail(email);
      if (userExists) {
        throw new BadRequestException(
          'An account with this email is already registered',
        );
      }
    } else if (dto.purpose === 'forgot_password') {
      const userExists = await this.userRepository.findByEmail(email);
      if (!userExists) {
        throw new NotFoundException('No account found with this email address');
      }
    }

    // Generate cryptographically secure 6-digit code
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpRepository.createOtp({
      target: email,
      email,
      targetType: 'email',
      otp: otpCode,
      purpose: dto.purpose,
      expiresAt,
    });

    // Always log OTP in development so developers can see it in terminal logs
    if (process.env['NODE_ENV'] !== 'production') {
      this.logger.log(
        `[DEV OTP LOG] Generated OTP for ${email} (${dto.purpose}): ${otpCode}`,
      );
    }

    const sent = await this.mailService.sendOtpEmail(
      email,
      otpCode,
      dto.purpose === 'verify_email'
        ? 'register'
        : (dto.purpose as 'register' | 'forgot_password'),
    );

    if (!sent) {
      this.logger.warn(`Email delivery failed for ${email}`);
      if (process.env['NODE_ENV'] === 'production') {
        throw new BadRequestException(
          'Failed to send OTP email. Please try again later.',
        );
      }
    }

    return {
      message: 'OTP sent successfully to your email address',
      expiresInSeconds: 600,
      email,
    };
  }

  /**
   * 2. Resend Email OTP
   */
  async resendOtp(dto: ResendOtpRequestDto): Promise<SendOtpResponseDto> {
    return this.sendOtp(dto);
  }

  /**
   * 3. Verify Email OTP
   */
  async verifyOtp(dto: VerifyOtpRequestDto): Promise<VerifyOtpResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const result = await this.otpRepository.verifyOtpCode({
      target: email,
      email,
      otp: dto.otp,
      purpose: dto.purpose,
    });

    if (!result.valid) {
      if (result.reason === 'TOO_MANY_ATTEMPTS') {
        throw new BadRequestException(
          'Too many invalid verification attempts. For your security, this OTP code has been invalidated. Please request a new one.',
        );
      }
      if (result.reason === 'EXPIRED') {
        throw new BadRequestException(
          'OTP code has expired. Please request a new code.',
        );
      }
      if (result.reason === 'NOT_FOUND') {
        throw new BadRequestException(
          'No active OTP request found. Please request a new verification code.',
        );
      }
      const attemptsMsg =
        result.remainingAttempts !== undefined
          ? ` (${result.remainingAttempts} attempts remaining)`
          : '';
      throw new BadRequestException(
        `Invalid OTP code. Please check and try again${attemptsMsg}.`,
      );
    }

    return {
      message: 'OTP verified successfully',
      email,
      purpose: dto.purpose,
      verified: true,
    };
  }

  /**
   * 4. Registration via Better Auth Engine
   */
  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const otpRecord = await this.otpRepository.findLatestValidOtp(
      email,
      'register',
    );
    if (!otpRecord || !otpRecord.isVerified) {
      throw new BadRequestException(
        'Please verify your OTP code before submitting registration',
      );
    }

    let token: string;
    try {
      const authRes = await auth.api.signUpEmail({
        body: {
          email,
          password: dto.password,
          name: dto.name,
        },
      });
      token = (authRes as { token?: string })?.token ?? '';
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Registration failed';
      this.logger.error(
        `Better Auth signUpEmail failed for ${email}: ${errorMsg}`,
      );
      throw new BadRequestException(errorMsg);
    }

    // Atomically consume used OTP record to prevent replay
    await this.otpRepository.consumeOtp(otpRecord._id);
    await this.otpRepository.deleteOtpsByEmailAndPurpose(email, 'register');

    // Fetch user entity from unified 'users' collection
    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) {
      throw new BadRequestException('User registration failed');
    }

    // If token wasn't returned by Better Auth, mint a secure session
    if (!token) {
      token = await this.createBetterAuthSession(userEntity._id);
    }

    // Ensure custom user profile fields are set
    const userColor = userEntity.color || generateAccessibleColor();
    const updatedUser =
      (await this.userRepository.updateById(userEntity._id, {
        provider: 'credentials',
        color: userColor,
        status: userEntity.status || 'Hey there! Welcome to my blog profile.',
        emailVerified: true,
        isOnline: true,
        role: userEntity.role || 'user',
      })) ?? userEntity;

    // Track online presence in Redis
    await this.redisPresenceService.setUserOnline(userEntity._id);

    return {
      user: this.toUserResponseDto(updatedUser),
      token,
      message: 'Registration successful',
    };
  }

  /**
   * 5. Login via Better Auth Engine
   */
  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();

    let token: string;
    try {
      const authRes = await auth.api.signInEmail({
        body: {
          email,
          password: dto.password,
        },
      });
      token = (authRes as { token?: string })?.token ?? '';
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Invalid email or password';
      this.logger.warn(
        `Better Auth signInEmail failed for ${email}: ${errorMsg}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) {
      throw new UnauthorizedException('User account not found');
    }

    if (!token) {
      token = await this.createBetterAuthSession(userEntity._id);
    }

    // Ensure credentials provider and accessible color are present
    const userColor = userEntity.color || generateAccessibleColor();
    const updatedUser =
      (await this.userRepository.updateById(userEntity._id, {
        provider: userEntity.provider || 'credentials',
        color: userColor,
        isOnline: true,
        role: userEntity.role || 'user',
      })) ?? userEntity;

    // Track online presence in Redis
    await this.redisPresenceService.setUserOnline(userEntity._id);

    return {
      user: this.toUserResponseDto(updatedUser),
      token,
      message: 'Login successful',
    };
  }

  /**
   * 6. Logout / Revoke Session
   */
  async logout(
    userId?: string,
    headers?: Headers,
  ): Promise<MessageResponseDto> {
    try {
      if (headers) {
        await auth.api.signOut({ headers });
      }
    } catch (err: unknown) {
      this.logger.warn(
        `Better Auth signOut error: ${err instanceof Error ? err.message : 'unknown'}`,
      );
    }

    if (userId) {
      // Set offline in Redis & MongoDB
      await this.redisPresenceService.setUserOffline(userId);
      await this.userRepository.setOnlineStatus(userId, false);
    }

    return {
      message: 'Logged out successfully',
      success: true,
    };
  }

  /**
   * 7. Google Sign-In with Official Validation & Account Linking
   */
  async googleLogin(dto: GoogleLoginRequestDto): Promise<AuthResponseDto> {
    // 1. Cryptographically verify Google ID token with Google's official keys
    const verified = await this.googleAuthService.verifyIdToken(dto.idToken);
    const email = verified.email;
    const db = mongoose.connection.db;

    this.logger.log(`Google authentication verified for: ${email}`);

    // 2. Check if a user with this email already exists
    let userEntity = await this.userRepository.findByEmail(email);

    if (userEntity) {
      // SCENARIO: Existing user
      if (!userEntity.emailVerified) {
        // Prevent Account Takeover: If an existing account had an unverified email,
        // Google's cryptographic verification proves genuine ownership.
        // We purge unverified password credentials to prevent an unauthorized takeover
        // by whoever previously attempted unverified registration.
        this.logger.warn(
          `Upgrading unverified account ${email} to verified via Google Sign-In. Purging unverified credentials.`,
        );
        if (db) {
          await db.collection('accounts').deleteMany({
            userId: userEntity._id.toString(),
            providerId: 'credential',
          });
        }
      }

      // Link Google provider in accounts collection if not already present
      if (db) {
        const existingGoogleAccount = await db.collection('accounts').findOne({
          userId: userEntity._id.toString(),
          providerId: 'google',
        });

        if (!existingGoogleAccount) {
          await db.collection('accounts').insertOne({
            userId: userEntity._id.toString(),
            accountId: verified.sub,
            providerId: 'google',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          this.logger.log(`Linked Google account for user: ${email}`);
        }
      }

      // Preserve credentials status: if user already had credentials, provider is now 'both'
      const updatedProvider =
        userEntity.provider === 'credentials' ? 'both' : userEntity.provider;

      userEntity =
        (await this.userRepository.updateById(userEntity._id, {
          provider: updatedProvider,
          emailVerified: true,
          isOnline: true,
          avatar: userEntity.avatar || verified.picture || '',
          role: userEntity.role || 'user',
        })) ?? userEntity;
    } else {
      // SCENARIO: New user registration via Google
      userEntity = await this.userRepository.create({
        name: verified.name,
        email,
        avatar: verified.picture || '',
        provider: 'google',
        providerId: verified.sub,
        emailVerified: true,
        color: generateAccessibleColor(),
        isOnline: true,
        role: 'user',
      });

      // Insert account record in accounts collection
      if (db) {
        await db.collection('accounts').insertOne({
          userId: userEntity._id.toString(),
          accountId: verified.sub,
          providerId: 'google',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // 3. Mint a valid Better Auth session token
    const token = await this.createBetterAuthSession(userEntity._id);

    // Track online presence in Redis
    await this.redisPresenceService.setUserOnline(userEntity._id);

    return {
      user: this.toUserResponseDto(userEntity),
      token,
      message: 'Google login successful',
    };
  }

  /**
   * 8. Forgot Password & Credential Management
   *
   * Securely resets password in Better Auth 'accounts' collection with Better Auth's password hash,
   * invalidates active sessions to prevent hijacked sessions, and consumes the OTP.
   */
  async forgotPassword(
    dto: ForgotPasswordRequestDto,
  ): Promise<MessageResponseDto> {
    const email = dto.email.toLowerCase().trim();

    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) {
      throw new NotFoundException('No account found with this email address');
    }

    const otpRecord = await this.otpRepository.findLatestValidOtp(
      email,
      'forgot_password',
    );
    if (!otpRecord || !otpRecord.isVerified) {
      throw new BadRequestException(
        'Please verify your OTP code before resetting your password',
      );
    }

    // Hash password using Better Auth's official password hashing engine
    const hashedPassword = await hashPassword(dto.newPassword);
    const db = mongoose.connection.db;

    if (db) {
      const existingAccount = await db.collection('accounts').findOne({
        userId: userEntity._id.toString(),
        providerId: 'credential',
      });

      if (existingAccount) {
        await db
          .collection('accounts')
          .updateOne(
            { _id: existingAccount._id },
            { $set: { password: hashedPassword, updatedAt: new Date() } },
          );
      } else {
        // User had Google-only account and is now establishing a password credential (account linking)
        await db.collection('accounts').insertOne({
          userId: userEntity._id.toString(),
          accountId: userEntity._id.toString(),
          providerId: 'credential',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.userRepository.updateById(userEntity._id, {
          provider: 'both',
        });
      }

      // Security: Revoke all existing sessions on password reset
      await db.collection('sessions').deleteMany({
        userId: userEntity._id.toString(),
      });
      this.logger.log(
        `Revoked all active sessions for ${email} following password reset`,
      );
    }

    // Atomically consume and delete OTP
    await this.otpRepository.consumeOtp(otpRecord._id);
    await this.otpRepository.deleteOtpsByEmailAndPurpose(
      email,
      'forgot_password',
    );

    return {
      message:
        'Password reset successfully. You can now login with your new password.',
      success: true,
    };
  }

  /**
   * 9. Send Phone OTP
   */
  async sendPhoneOtp(
    dto: SendPhoneOtpRequestDto,
  ): Promise<SendPhoneOtpResponseDto> {
    const normalizedPhone = this.smsService.normalizePhoneNumber(dto.phone);

    // Enforce 60-second cooldown
    const cooldown = await this.otpRepository.checkCooldown(
      normalizedPhone,
      'verify_phone',
      60,
    );
    if (cooldown.inCooldown) {
      throw new BadRequestException(
        `Please wait ${cooldown.remainingSeconds} seconds before requesting a new phone OTP.`,
      );
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpRepository.createOtp({
      target: normalizedPhone,
      targetType: 'phone',
      otp: otpCode,
      purpose: 'verify_phone',
      expiresAt,
    });

    if (process.env['NODE_ENV'] !== 'production') {
      this.logger.log(
        `[DEV OTP LOG] Generated Phone OTP for ${normalizedPhone}: ${otpCode}`,
      );
    }

    await this.smsService.sendPhoneOtp(normalizedPhone, otpCode);

    return {
      message: 'OTP sent successfully to your phone number',
      expiresInSeconds: 600,
      phone: normalizedPhone,
    };
  }

  /**
   * 10. Verify Phone OTP
   */
  async verifyPhoneOtp(
    dto: VerifyPhoneOtpRequestDto,
    currentUser: UserEntity,
  ): Promise<VerifyPhoneOtpResponseDto> {
    const normalizedPhone = this.smsService.normalizePhoneNumber(dto.phone);

    const result = await this.otpRepository.verifyOtpCode({
      target: normalizedPhone,
      otp: dto.otp,
      purpose: 'verify_phone',
    });

    if (!result.valid) {
      if (result.reason === 'TOO_MANY_ATTEMPTS') {
        throw new BadRequestException(
          'Too many invalid verification attempts. This code has been invalidated for security. Please request a new code.',
        );
      }
      if (result.reason === 'EXPIRED') {
        throw new BadRequestException(
          'Phone OTP code has expired. Please request a new code.',
        );
      }
      if (result.reason === 'NOT_FOUND') {
        throw new BadRequestException(
          'No active phone OTP found. Please request a new code.',
        );
      }
      const attemptsMsg =
        result.remainingAttempts !== undefined
          ? ` (${result.remainingAttempts} attempts remaining)`
          : '';
      throw new BadRequestException(`Invalid OTP code${attemptsMsg}.`);
    }

    // Check if phone number is already verified by another user
    const existingWithPhone =
      await this.userRepository.findByPhone(normalizedPhone);
    if (
      existingWithPhone &&
      existingWithPhone._id !== currentUser._id &&
      existingWithPhone.phoneVerified
    ) {
      throw new BadRequestException(
        'This phone number is already verified on another account.',
      );
    }

    // Update user record with verified phone number
    await this.userRepository.updatePhone(
      currentUser._id,
      normalizedPhone,
      true,
    );

    // Atomically consume OTP
    if (result.record?._id) {
      await this.otpRepository.consumeOtp(result.record._id);
    }

    return {
      verified: true,
      message: 'Phone number verified successfully',
      phone: normalizedPhone,
    };
  }

  /**
   * 11. Get Authenticated User Details
   */
  getMe(user: UserEntity): UserResponseDto {
    return this.toUserResponseDto(user);
  }
}
