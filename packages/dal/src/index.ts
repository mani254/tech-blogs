// @org/dal — Public API
//
// This is the ONLY import path for database operations.
//
// What is exported:
//   - Repositories  (UserRepository, OtpRepository)
//   - Entities      (UserEntity, OtpEntity)
//   - Connection    (connectDatabase, disconnectDatabase)

// ─── Connection ───────────────────────────────────────────────────────────────
export {
  connectDatabase,
  DB_COLLECTIONS,
  disconnectDatabase,
} from './connection/index.js';
export type { DbCollection } from './connection/index.js';

// ─── Users ────────────────────────────────────────────────────────────────────
export {
  generateAccessibleColor,
  toUserEntity,
  UserRepository,
} from './users/index.js';
export type { UserEntity } from './users/index.js';

// ─── OTP ──────────────────────────────────────────────────────────────────────
export {
  compareOtp,
  hashOtp,
  isOtpExpired,
  OtpRepository,
  toOtpEntity,
  type CreateOtpInput,
  type OtpCooldownResult,
  type VerifyOtpInput,
  type VerifyOtpResult,
} from './otp/index.js';
export type { OtpEntity } from './otp/index.js';

