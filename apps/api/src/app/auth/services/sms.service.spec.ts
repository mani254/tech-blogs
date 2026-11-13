import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';

describe('SmsService Phone Normalization', () => {
  const configService = {
    get: (_key: string) => 'test',
  } as unknown as ConfigService;

  const smsService = new SmsService(configService);

  it('should accept valid E.164 phone number', () => {
    const phone = '+14155552671';
    const normalized = smsService.normalizePhoneNumber(phone);
    assert.equal(normalized, '+14155552671');
  });

  it('should strip spaces, dashes, and parentheses from phone number', () => {
    const raw = '+1 (415) 555-2671';
    const normalized = smsService.normalizePhoneNumber(raw);
    assert.equal(normalized, '+14155552671');
  });

  it('should reject invalid phone numbers without leading plus', () => {
    assert.throws(
      () => smsService.normalizePhoneNumber('14155552671'),
      /Invalid phone number format/,
    );
  });

  it('should reject phone numbers with non-digits or invalid lengths', () => {
    assert.throws(
      () => smsService.normalizePhoneNumber('+123'),
      /Invalid phone number format/,
    );
  });
});
