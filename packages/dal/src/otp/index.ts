export type { OtpEntity } from './otp.entity.js';
export { toOtpEntity, isOtpExpired } from './otp.entity.js';
export {
  OtpRepository,
  hashOtp,
  compareOtp,
  type CreateOtpInput,
  type OtpCooldownResult,
  type VerifyOtpInput,
  type VerifyOtpResult,
} from './otp.repository.js';
