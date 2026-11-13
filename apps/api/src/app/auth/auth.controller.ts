import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UserEntity } from '@org/dal';
import type { FastifyRequest } from 'fastify';
import { ApiErrorResponseDto } from '../../common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
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

@ApiTags('Authentication & User')
@Controller({ path: 'auth', version: [VERSION_NEUTRAL, '1'] })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP code to user email' })
  @ApiResponse({
    status: 200,
    type: SendOtpResponseDto,
    description: 'OTP sent successfully to email',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description:
      'Invalid email, account exists/missing, or 60s cooldown active',
  })
  async sendOtp(@Body() dto: SendOtpRequestDto): Promise<SendOtpResponseDto> {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend 6-digit OTP code to user email' })
  @ApiResponse({
    status: 200,
    type: SendOtpResponseDto,
    description: 'OTP re-sent successfully to email',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description: 'Rate limit or cooldown active',
  })
  async resendOtp(
    @Body() dto: ResendOtpRequestDto,
  ): Promise<SendOtpResponseDto> {
    return this.authService.resendOtp(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code for email' })
  @ApiResponse({
    status: 200,
    type: VerifyOtpResponseDto,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description: 'Invalid code, expired code, or maximum attempts reached',
  })
  async verifyOtp(
    @Body() dto: VerifyOtpRequestDto,
  ): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account with verified OTP' })
  @ApiResponse({
    status: 201,
    type: AuthResponseDto,
    description: 'User account created successfully',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description: 'User already exists, unverified OTP, or invalid input',
  })
  async register(@Body() dto: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    description: 'Invalid email or password',
  })
  async login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current user and revoke session' })
  @ApiResponse({
    status: 200,
    type: MessageResponseDto,
    description: 'Logged out successfully',
  })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    description: 'Unauthorized - invalid or expired session token',
  })
  async logout(
    @Req() req: FastifyRequest,
    @CurrentUser() user?: UserEntity,
  ): Promise<MessageResponseDto> {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.append(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      }
    }
    return this.authService.logout(user?._id, headers);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate or link account via official Google OAuth ID token',
    description:
      'Validates the Google credential token with Google OAuth2Client, securely links the account, and mints a Better Auth session.',
  })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'Google authentication successful',
  })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    description: 'Invalid, expired, or unverified Google token',
  })
  async googleLogin(
    @Body() dto: GoogleLoginRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.googleLogin(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password with verified OTP' })
  @ApiResponse({
    status: 200,
    type: MessageResponseDto,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description: 'Unverified OTP code or invalid password format',
  })
  @ApiResponse({
    status: 404,
    type: ApiErrorResponseDto,
    description: 'Account not found for email address',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('send-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP code to phone number' })
  @ApiResponse({
    status: 200,
    type: SendPhoneOtpResponseDto,
    description: 'Phone OTP sent successfully',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description: 'Invalid phone format or cooldown period active',
  })
  async sendPhoneOtp(
    @Body() dto: SendPhoneOtpRequestDto,
  ): Promise<SendPhoneOtpResponseDto> {
    return this.authService.sendPhoneOtp(dto);
  }

  @ApiBearerAuth('access-token')
  @Post('verify-phone-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone OTP and mark phone number verified' })
  @ApiResponse({
    status: 200,
    type: VerifyPhoneOtpResponseDto,
    description: 'Phone number verified successfully',
  })
  @ApiResponse({
    status: 400,
    type: ApiErrorResponseDto,
    description:
      'Invalid OTP, expired OTP, or phone already verified on another account',
  })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    description: 'Unauthorized - invalid or expired session token',
  })
  async verifyPhoneOtp(
    @Body() dto: VerifyPhoneOtpRequestDto,
    @CurrentUser() user: UserEntity,
  ): Promise<VerifyPhoneOtpResponseDto> {
    return this.authService.verifyPhoneOtp(dto, user);
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    type: UserResponseDto,
    description: 'User profile returned successfully',
  })
  @ApiResponse({
    status: 401,
    type: ApiErrorResponseDto,
    description: 'Unauthorized - invalid or expired session token',
  })
  async getMe(@CurrentUser() user: UserEntity): Promise<UserResponseDto> {
    return this.authService.getMe(user);
  }
}
