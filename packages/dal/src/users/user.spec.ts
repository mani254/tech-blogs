import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import mongoose from 'mongoose';
import { toUserEntity } from './user.entity.js';
import { UserModel, type RawUserDocument } from './user.schema.js';

describe('User Schema and Defaults', () => {
  it('should instantiate UserModel with default role', () => {
    const doc = new UserModel({
      name: 'Default User',
      email: 'default@example.com',
    });

    assert.equal(doc.role, 'user', 'Default role should be user');
    assert.equal(doc.name, 'Default User');
    assert.equal(doc.email, 'default@example.com');
  });

  it('should convert RawUserDocument to UserEntity with string _id', () => {
    const rawDoc: RawUserDocument = {
      _id: new mongoose.Types.ObjectId('60d5ecb8b392d511f8b1c411'),
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      avatar: '',
      status: 'Ready',
      isOnline: false,
      provider: 'credentials',
      emailVerified: true,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as RawUserDocument;

    const entity = toUserEntity(rawDoc);

    assert.equal(entity._id, '60d5ecb8b392d511f8b1c411');
    assert.equal(entity.role, 'user');
    assert.equal(entity.name, 'Test User');
    assert.equal(entity.email, 'test@example.com');
  });

  it('should validate role enum allowing user and admin, but rejecting invalid roles', async () => {
    const validUserDoc = new UserModel({
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
    await validUserDoc.validate(['role', 'name', 'email']);

    const validAdminDoc = new UserModel({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    });
    await validAdminDoc.validate(['role', 'name', 'email']);

    const invalidRoleDoc = new UserModel({
      name: 'Invalid User',
      email: 'invalid@example.com',
      role: 'superadmin',
    });
    let invalidRoleErr: mongoose.Error.ValidationError | null = null;
    try {
      await invalidRoleDoc.validate(['role', 'name', 'email']);
    } catch (err) {
      invalidRoleErr = err as mongoose.Error.ValidationError;
    }
    assert.ok(invalidRoleErr?.errors['role'], 'Should reject invalid role');
  });
});
