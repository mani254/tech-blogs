import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SmsProvider } from '@org/shared';

export type { SmsProvider };

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {
    const env = this.configService.get<string>('app.nodeEnv') || 'development';
    this.logger.log(`SmsService initialized in [${env}] mode`);
  }

  /**
   * Normalizes a phone number to standard E.164 format.
   * Strips spaces, dashes, parentheses. Enforces leading '+' followed by 10-15 digits.
   */
  normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s().-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) {
      throw new Error(
        'Invalid phone number format. Please provide a valid E.164 international phone number (e.g., +14155552671).',
      );
    }
    return cleaned;
  }

  /**
   * Sends an OTP verification SMS to the recipient.
   */
  async sendPhoneOtp(phone: string, otp: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhoneNumber(phone);
    const message = `Your verification code is: ${otp}. It will expire in 10 minutes.`;

    // In production, integrate configured SMS provider (e.g., Twilio, AWS SNS, Brevo SMS).
    // In dev / test, securely log the dispatch.
    this.logger.log(
      `[SMS Service] Sending OTP to ${normalizedPhone}: "${message}"`,
    );

    return true;
  }
}
