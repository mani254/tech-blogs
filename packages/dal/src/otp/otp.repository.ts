import crypto from 'node:crypto';
import type {
  CreateOtpInput,
  OtpCooldownResult,
  OtpPurpose,
  VerifyOtpInput,
  VerifyOtpResult,
} from '@org/shared';
import { type OtpEntity, toOtpEntity } from './otp.entity.js';
import { type RawOtpDocument, OtpModel } from './otp.schema.js';

export type {
  CreateOtpInput,
  OtpCooldownResult,
  VerifyOtpInput,
  VerifyOtpResult,
};

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

export function compareOtp(plainOtp: string, hashedOtp: string): boolean {
  try {
    const computedHash = hashOtp(plainOtp);
    if (computedHash.length !== hashedOtp.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'utf8'),
      Buffer.from(hashedOtp, 'utf8'),
    );
  } catch {
    return false;
  }
}

export class OtpRepository {
  /**
   * Check if a cooldown is currently active for the given target and purpose.
   */
  async checkCooldown(
    targetOrEmail: string,
    purpose: OtpPurpose,
    cooldownSeconds = 60,
  ): Promise<OtpCooldownResult> {
    const normalized = targetOrEmail.toLowerCase().trim();
    const latest = await OtpModel.findOne({
      $or: [{ target: normalized }, { email: normalized }],
      purpose,
    })
      .sort({ createdAt: -1 })
      .lean<RawOtpDocument>()
      .exec();

    if (!latest || !latest.lastSentAt) {
      return { inCooldown: false, remainingSeconds: 0 };
    }

    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(latest.lastSentAt).getTime()) / 1000,
    );
    if (elapsedSeconds < cooldownSeconds) {
      return {
        inCooldown: true,
        remainingSeconds: cooldownSeconds - elapsedSeconds,
      };
    }

    return { inCooldown: false, remainingSeconds: 0 };
  }

  /**
   * Creates a cryptographically hashed OTP record.
   */
  async createOtp(data: CreateOtpInput): Promise<OtpEntity> {
    const target = (data.target || data.email || '').toLowerCase().trim();
    const targetType =
      data.targetType || (data.target?.startsWith('+') ? 'phone' : 'email');
    const email = data.email || (targetType === 'email' ? target : undefined);
    const hashed = hashOtp(data.otp);

    // Invalidate/delete any previous active OTPs for the same target & purpose
    await OtpModel.deleteMany({
      $or: [{ target }, { email: target }],
      purpose: data.purpose,
    }).exec();

    // In production, never persist plaintext OTP in database.
    // In non-production (development/test), optionally store for inspection.
    const isDev = process.env['NODE_ENV'] !== 'production';

    const doc = await OtpModel.create({
      target,
      targetType,
      email,
      hashedOtp: hashed,
      otp: isDev ? data.otp : undefined,
      purpose: data.purpose,
      expiresAt: data.expiresAt,
      attempts: 0,
      maxAttempts: data.maxAttempts ?? 5,
      isVerified: false,
      lastSentAt: new Date(),
    });

    return toOtpEntity(doc.toObject() as RawOtpDocument);
  }

  /**
   * Securely verifies an incoming OTP code against stored hash with attempt tracking.
   */
  async verifyOtpCode(
    data: VerifyOtpInput,
  ): Promise<VerifyOtpResult<OtpEntity>> {
    const target = (data.target || data.email || '').toLowerCase().trim();

    const doc = await OtpModel.findOne({
      $or: [{ target }, { email: target }],
      purpose: data.purpose,
      consumedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .exec();

    if (!doc) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (new Date() > new Date(doc.expiresAt)) {
      return { valid: false, reason: 'EXPIRED' };
    }

    const maxAttempts = doc.maxAttempts ?? 5;
    if (doc.attempts >= maxAttempts) {
      // Invalidate the record to prevent further brute-force
      await OtpModel.findByIdAndDelete(doc._id).exec();
      return {
        valid: false,
        reason: 'TOO_MANY_ATTEMPTS',
        remainingAttempts: 0,
      };
    }

    // Verify hash using timing-safe comparison
    const isMatch = compareOtp(data.otp, doc.hashedOtp);

    if (!isMatch) {
      doc.attempts += 1;
      const remaining = Math.max(0, maxAttempts - doc.attempts);
      if (doc.attempts >= maxAttempts) {
        await OtpModel.findByIdAndDelete(doc._id).exec();
        return {
          valid: false,
          reason: 'TOO_MANY_ATTEMPTS',
          remainingAttempts: 0,
        };
      }
      await doc.save();
      return {
        valid: false,
        reason: 'INVALID_CODE',
        remainingAttempts: remaining,
      };
    }

    // Match succeeded!
    doc.isVerified = true;
    await doc.save();

    return {
      valid: true,
      record: toOtpEntity(doc.toObject() as RawOtpDocument),
    };
  }

  /**
   * Atomically consumes a verified OTP so it can never be reused.
   */
  async consumeOtp(id: string): Promise<boolean> {
    const doc = await OtpModel.findByIdAndUpdate(
      id,
      { $set: { consumedAt: new Date() } },
      { new: true },
    ).exec();
    return doc !== null;
  }

  /**
   * Find latest valid OTP (non-expired, unconsumed).
   */
  async findLatestValidOtp(
    targetOrEmail: string,
    purpose: 'register' | 'forgot_password' | 'verify_email' | 'verify_phone',
  ): Promise<OtpEntity | null> {
    const normalized = targetOrEmail.toLowerCase().trim();
    const doc = await OtpModel.findOne({
      $or: [{ target: normalized }, { email: normalized }],
      purpose,
      expiresAt: { $gt: new Date() },
      consumedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .lean<RawOtpDocument>()
      .exec();

    return doc ? toOtpEntity(doc) : null;
  }

  async deleteOtpsByEmailAndPurpose(
    email: string,
    purpose: 'register' | 'forgot_password' | 'verify_email' | 'verify_phone',
  ): Promise<void> {
    const normalized = email.toLowerCase().trim();
    await OtpModel.deleteMany({
      $or: [{ target: normalized }, { email: normalized }],
      purpose,
    }).exec();
  }
}
