import { Module } from '@nestjs/common';
import { OtpRepository, UserRepository } from '@org/dal';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BetterAuthController } from './better-auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { SmsService } from './services/sms.service';

@Module({
  imports: [MailModule],
  controllers: [AuthController, BetterAuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    SmsService,
    {
      provide: UserRepository,
      useFactory: () => new UserRepository(),
    },
    {
      provide: OtpRepository,
      useFactory: () => new OtpRepository(),
    },
  ],
  exports: [AuthService, GoogleAuthService],
})
export class AuthModule {}
