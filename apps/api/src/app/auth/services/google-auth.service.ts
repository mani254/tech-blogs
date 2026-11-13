import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { VerifiedGoogleUser } from '@org/shared';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

export type { VerifiedGoogleUser };

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private client: OAuth2Client;
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId =
      this.configService.get<string>('auth.googleClientId') ||
      process.env['GOOGLE_CLIENT_ID'] ||
      '';
    this.client = new OAuth2Client(this.clientId);
  }

  /**
   * Verifies Google ID token against Google's official public keys using OAuth2Client.
   *
   * Validates:
   * 1. Cryptographic RS256 signature against Google's certificates
   * 2. Audience matches our GOOGLE_CLIENT_ID
   * 3. Issuer is accounts.google.com or https://accounts.google.com
   * 4. Expiration timestamp
   * 5. email_verified is true
   */
  async verifyIdToken(idToken: string): Promise<VerifiedGoogleUser> {
    if (!idToken || typeof idToken !== 'string') {
      throw new BadRequestException('Google ID token is required');
    }

    if (!this.clientId) {
      this.logger.error('GOOGLE_CLIENT_ID is not configured in environment!');
      throw new UnauthorizedException(
        'Google authentication is not properly configured on server',
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload: TokenPayload | undefined = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new UnauthorizedException(
          'Google token does not contain required user identity claims',
        );
      }

      // Enforce verified Google email
      if (!payload.email_verified) {
        this.logger.warn(
          `Google Sign-In rejected for unverified email: ${payload.email}`,
        );
        throw new BadRequestException(
          'Your Google account email has not been verified by Google. Please verify your email with Google first.',
        );
      }

      const email = payload.email.toLowerCase().trim();
      const name =
        payload.name ||
        [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
        email.split('@')[0] ||
        'Google User';

      return {
        sub: payload.sub,
        email,
        emailVerified: true,
        name,
        picture: payload.picture,
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      const msg =
        err instanceof Error ? err.message : 'Unknown verification error';
      this.logger.warn(`Google token verification failed: ${msg}`);
      throw new UnauthorizedException(
        `Failed to verify Google credentials: ${msg}`,
      );
    }
  }
}
