import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SendPhoneOtpRequestDto {
  @ApiProperty({
    description: 'Phone number in E.164 international format',
    example: '+14155552671',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone!: string;
}

export class VerifyPhoneOtpRequestDto {
  @ApiProperty({
    description: 'Phone number in E.164 international format',
    example: '+14155552671',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone!: string;

  @ApiProperty({
    description: '6-digit OTP verification code',
    example: '123456',
  })
  @IsString({ message: 'OTP code must be a string' })
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  otp!: string;
}

export class SendPhoneOtpResponseDto {
  @ApiProperty({
    description: 'Status message',
    example: 'OTP code sent successfully to your phone',
  })
  message!: string;

  @ApiProperty({
    description: 'Validity duration of the OTP code in seconds',
    example: 600,
  })
  expiresInSeconds!: number;

  @ApiProperty({
    description: 'Recipient phone number',
    example: '+14155552671',
  })
  phone!: string;
}

export class VerifyPhoneOtpResponseDto {
  @ApiProperty({
    description: 'Whether the phone number was successfully verified',
    example: true,
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Status message',
    example: 'Phone number verified successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Verified phone number',
    example: '+14155552671',
  })
  phone!: string;
}
