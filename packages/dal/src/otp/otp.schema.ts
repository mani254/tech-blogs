import mongoose, { InferSchemaType, Schema, model } from 'mongoose';
import { DB_COLLECTIONS } from '../connection/database.constants.js';

const otpSchema = new Schema(
  {
    target: {
      type: String,
      required: [true, 'Target is required'],
      trim: true,
      lowercase: true,
    },
    targetType: {
      type: String,
      enum: ['email', 'phone'],
      default: 'email',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    hashedOtp: {
      type: String,
      required: [true, 'Hashed OTP is required'],
      trim: true,
    },
    otp: {
      type: String,
      trim: true,
      select: false, // Hidden from queries by default; only persisted in non-production environments
    },
    purpose: {
      type: String,
      enum: ['register', 'forgot_password', 'verify_email', 'verify_phone'],
      required: [true, 'Purpose is required'],
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    consumedAt: {
      type: Date,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Indexes
otpSchema.index({ target: 1, purpose: 1 });
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB automatic TTL deletion

export type RawOtpDocument = InferSchemaType<typeof otpSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const OtpModel = model<RawOtpDocument>(
  'Otp',
  otpSchema,
  DB_COLLECTIONS.OTPS,
);
