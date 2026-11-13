import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashOtp, compareOtp } from './otp.repository.js';

describe('OTP Security Utilities', () => {
  it('should hash an OTP string with SHA-256 and return hex string', () => {
    const code = '123456';
    const hash1 = hashOtp(code);
    const hash2 = hashOtp(code);

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64);
    assert.equal(hash1, hash2, 'Hash should be deterministic');
  });

  it('should verify matching OTP with compareOtp using timing-safe comparison', () => {
    const code = '654321';
    const hash = hashOtp(code);

    const isMatch = compareOtp('654321', hash);
    assert.equal(isMatch, true);
  });

  it('should reject non-matching OTP with compareOtp', () => {
    const code = '654321';
    const hash = hashOtp(code);

    const isMatch = compareOtp('000000', hash);
    assert.equal(isMatch, false);
  });

  it('should handle whitespace trimming gracefully', () => {
    const code = '123456';
    const hash = hashOtp(code);

    const isMatch = compareOtp(' 123456 ', hash);
    assert.equal(isMatch, true);
  });
});
