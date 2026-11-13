import type { UpdateQuery } from 'mongoose';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRole,
} from '@org/shared';
import { type UserEntity, toUserEntity } from './user.entity.js';
import { type RawUserDocument, UserModel } from './user.schema.js';

export class UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id).lean<RawUserDocument>().exec();
    return doc ? toUserEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .lean<RawUserDocument>()
      .exec();
    return doc ? toUserEntity(doc) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ phone: phone.trim() })
      .lean<RawUserDocument>()
      .exec();
    return doc ? toUserEntity(doc) : null;
  }

  async create(data: CreateUserInput): Promise<UserEntity> {
    const doc = await UserModel.create(data);
    return toUserEntity(doc.toObject() as RawUserDocument);
  }

  async updateById(
    id: string,
    data: UpdateUserInput,
  ): Promise<UserEntity | null> {
    const update: UpdateQuery<RawUserDocument> = { $set: data };
    const doc = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .lean<RawUserDocument>()
      .exec();
    return doc ? toUserEntity(doc) : null;
  }

  async updatePhone(
    id: string,
    phone: string,
    phoneVerified = false,
  ): Promise<UserEntity | null> {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: { phone: phone.trim(), phoneVerified } },
      { new: true },
    )
      .lean<RawUserDocument>()
      .exec();
    return doc ? toUserEntity(doc) : null;
  }

  async setOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { isOnline } }).exec();
  }

  async searchUsersWithCursor(
    options: {
      search?: string;
      excludeUserId?: string;
      cursor?: string;
      limit?: number;
    } = {},
  ): Promise<{ items: UserEntity[]; nextCursor?: string; hasMore: boolean }> {
    const limit = Math.min(50, Math.max(1, options.limit ?? 10));
    const filter: Record<string, unknown> = {};

    if (options.excludeUserId) {
      filter['_id'] = { $ne: options.excludeUserId };
    }

    if (options.search && options.search.trim().length > 0) {
      const regex = new RegExp(options.search.trim(), 'i');
      filter['$or'] = [{ name: regex }, { email: regex }];
    }

    if (options.cursor) {
      filter['_id'] = {
        ...((filter['_id'] as object) || {}),
        $gt: options.cursor,
      };
    }

    const docs = await UserModel.find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .lean<RawUserDocument[]>()
      .exec();

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem ? lastItem._id.toString() : undefined;

    return { items: items.map(toUserEntity), nextCursor, hasMore };
  }

  // ─── Role Methods ───────────────────────────────────────────────────────────

  async updateRole(userId: string, role: UserRole): Promise<UserEntity | null> {
    const doc = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true },
    )
      .lean<RawUserDocument>()
      .exec();
    return doc ? toUserEntity(doc) : null;
  }
}
