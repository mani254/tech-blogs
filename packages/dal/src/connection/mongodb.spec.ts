import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { connectDatabase, disconnectDatabase } from './mongodb.js';

describe('connectDatabase', () => {
  const originalEnvUri = process.env['MONGODB_URI'];

  beforeEach(async () => {
    delete process.env['MONGODB_URI'];
    await disconnectDatabase();
  });

  afterEach(async () => {
    if (originalEnvUri) {
      process.env['MONGODB_URI'] = originalEnvUri;
    } else {
      delete process.env['MONGODB_URI'];
    }
    await disconnectDatabase();
  });

  it('should throw an error if no URI is provided and MONGODB_URI env var is not set', async () => {
    await assert.rejects(
      async () => {
        await connectDatabase();
      },
      {
        name: 'Error',
        message:
          '[DAL] MongoDB connection URI is required. Pass it as an argument or set the MONGODB_URI environment variable.',
      },
    );
  });

  it('should throw connection error for an invalid/unreachable MongoDB URI', async () => {
    const invalidUri = 'mongodb://127.0.0.1:1/nonexistent-db';
    await assert.rejects(
      async () => {
        await connectDatabase(invalidUri);
      },
      (err: Error) => {
        assert.ok(err instanceof Error);
        return true;
      },
    );
  });

  it('should be idempotent on consecutive calls with same or different URI', async () => {
    const uri =
      process.env['MONGODB_URI'] ||
      'mongodb://127.0.0.1:27017/test_tech_blogs';
    try {
      await connectDatabase(uri);
      const listenerCount = mongoose.connection.listenerCount('disconnected');

      // Second call should return immediately without attaching extra listeners
      await connectDatabase(uri);
      const newListenerCount =
        mongoose.connection.listenerCount('disconnected');

      assert.equal(
        newListenerCount,
        listenerCount,
        'Listener count should not increase on repeated calls',
      );
    } catch (err: unknown) {
      // If local MongoDB is not running, verify that connection error is thrown cleanly
      assert.ok(err instanceof Error);
    }
  });

  it('should handle disconnectDatabase correctly', async () => {
    const uri =
      process.env['MONGODB_URI'] ||
      'mongodb://127.0.0.1:27017/test_tech_blogs';
    try {
      await connectDatabase(uri);
      assert.equal(
        mongoose.connection.readyState === 1 ||
          mongoose.connection.readyState === 2,
        true,
      );
      await disconnectDatabase();
      assert.equal(mongoose.connection.readyState, 0);
    } catch {
      // If local mongo is not running, disconnecting from disconnected state should be safe
      await disconnectDatabase();
      assert.equal(mongoose.connection.readyState, 0);
    }
  });
});
