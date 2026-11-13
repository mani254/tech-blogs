import mongoose from 'mongoose';

let isConnected = false;

/**
 * Establishes a singleton MongoDB connection using Mongoose.
 *
 * This should be called ONCE at application startup (e.g. in your server
 * bootstrap file). Subsequent calls are no-ops — the connection is reused.
 *
 * The DAL library itself never calls this. The application layer owns the
 * connection lifecycle.
 *
 * @param uri - A full MongoDB connection string. Defaults to MONGODB_URI env var.
 */
export async function connectDatabase(uri?: string): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const connectionUri = uri?.trim() || process.env['MONGODB_URI']?.trim();

  if (!connectionUri) {
    throw new Error(
      '[DAL] MongoDB connection URI is required. ' +
        'Pass it as an argument or set the MONGODB_URI environment variable.',
    );
  }

  await mongoose.connect(connectionUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log('[DAL] MongoDB connected');

  try {
    const db = mongoose.connection.db;
    if (db) {
      const usersCollection = db.collection('users');
      const indexes = await usersCollection.indexes();
      const hasBadIndex = indexes.some(
        (idx) => idx.name === 'provider_1_providerId_1',
      );
      if (hasBadIndex) {
        await usersCollection
          .dropIndex('provider_1_providerId_1')
          .catch(() => null);
        console.log('[DAL] Dropped old provider_1_providerId_1 index');
      }
    }
  } catch {
    // Ignore index cleanup errors
  }

  // Clear existing listeners to prevent memory leaks on re-connections
  mongoose.connection.removeAllListeners('disconnected');
  mongoose.connection.removeAllListeners('error');

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[DAL] MongoDB disconnected');
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('[DAL] MongoDB connection error:', err.message);
  });
}

/**
 * Gracefully closes the MongoDB connection.
 *
 * Call this during application shutdown (e.g. SIGTERM handler).
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  isConnected = false;
  console.log('[DAL] MongoDB disconnected gracefully');
}
