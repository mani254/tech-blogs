import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validate } from 'class-validator';
import {
  LoginRequestDto,
  RegisterRequestDto,
  SendPhoneOtpRequestDto,
  VerifyPhoneOtpRequestDto,
} from './index';

describe('Auth DTO Validation', () => {
  it('should validate valid LoginRequestDto', async () => {
    const dto = new LoginRequestDto();
    dto.email = 'valid.user@example.com';
    dto.password = 'StrongP@ssw0rd!';

    const errors = await validate(dto);
    assert.equal(errors.length, 0);
  });

  it('should reject invalid email format in LoginRequestDto', async () => {
    const dto = new LoginRequestDto();
    dto.email = 'not-an-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.property === 'email'));
  });

  it('should validate valid RegisterRequestDto', async () => {
    const dto = new RegisterRequestDto();
    dto.name = 'Alice Smith';
    dto.email = 'alice@example.com';
    dto.password = 'SuperSecret123!';
    dto.otp = '123456';

    const errors = await validate(dto);
    assert.equal(errors.length, 0);
  });

  it('should reject short password in RegisterRequestDto', async () => {
    const dto = new RegisterRequestDto();
    dto.name = 'Alice';
    dto.email = 'alice@example.com';
    dto.password = '12345'; // less than 8 characters

    const errors = await validate(dto);
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.property === 'password'));
  });

  it('should validate valid SendPhoneOtpRequestDto', async () => {
    const dto = new SendPhoneOtpRequestDto();
    dto.phone = '+14155552671';

    const errors = await validate(dto);
    assert.equal(errors.length, 0);
  });

  it('should reject non-6-digit OTP in VerifyPhoneOtpRequestDto', async () => {
    const dto = new VerifyPhoneOtpRequestDto();
    dto.phone = '+14155552671';
    dto.otp = '123'; // invalid length

    const errors = await validate(dto);
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.property === 'otp'));
  });
});
