import { dash } from '@better-auth/infra';
import { DB_COLLECTIONS, generateAccessibleColor } from '@org/dal';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { bearer, oneTap } from 'better-auth/plugins';
import mongoose from 'mongoose';

type MongoDb = NonNullable<typeof mongoose.connection.db>;

const secret: string =
  process.env['BETTER_AUTH_SECRET'] ||
  process.env['BETTER_AUTH_API_KEY'] ||
  'default_fallback_secret_32_characters_long_min!';

const corsOrigins = process.env['CORS_ORIGIN']
  ? process.env['CORS_ORIGIN'].split(',').map((o) => o.trim())
  : [];

const trustedOrigins = [
  'http://localhost:5173',
  'http://localhost:4200',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:1234',
  ...corsOrigins,
];

/**
 * Strongly-typed Lazy DB Proxy for mongodbAdapter using Mongoose's MongoDb type.
 *
 * Resolves mongoose.connection.db dynamically at runtime when Better Auth endpoints
 * are invoked, avoiding import-time connection race conditions without any 'any' types.
 */
const lazyDb: MongoDb = new Proxy({} as unknown as MongoDb, {
  get<K extends keyof MongoDb>(_target: MongoDb, prop: K): MongoDb[K] {
    const db: MongoDb | undefined = mongoose.connection.db;
    if (!db) {
      throw new Error(
        '[BetterAuth] MongoDB is not connected yet. Ensure connectDatabase() ran in main.ts.',
      );
    }
    const value = db[prop];
    return typeof value === 'function' ? (value.bind(db) as MongoDb[K]) : value;
  },
});

export const options: BetterAuthOptions = {
  database: mongodbAdapter(lazyDb),
  secret,
  baseURL: process.env['BETTER_AUTH_URL'] || 'http://localhost:5000',
  trustedOrigins,
  user: {
    modelName: DB_COLLECTIONS.USERS, // Unifies Better Auth to target 'users' collection!
    fields: {
      image: 'avatar',
    },
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
      color: {
        type: 'string',
        required: false,
      },
      provider: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: false,
      },
      isOnline: {
        type: 'boolean',
        required: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      phoneVerified: {
        type: 'boolean',
        required: false,
      },
      gender: {
        type: 'string',
        required: false,
      },
      birthday: {
        type: 'date',
        required: false,
      },
    },
  },
  session: {
    modelName: 'sessions',
    expiresIn: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  account: {
    modelName: 'accounts',
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },
  verification: {
    modelName: 'verifications',
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: (user as Record<string, unknown>)['role'] || 'user',
              color: user.color || generateAccessibleColor(),
              status: user.status || 'Hey there! Welcome to my blog profile.',
              isOnline: true,
              emailVerified: user.emailVerified ?? false,
              phoneVerified: false,
            },
          };
        },
        after: async (user) => {
          console.log(
            '[BetterAuthHook] User created in unified users collection:',
            user.email,
          );
        },
      },
      update: {
        after: async (user) => {
          console.log(
            '[BetterAuthHook] User updated in unified users collection:',
            user.email,
          );
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          console.log(
            '[BetterAuthHook] Account created for user:',
            account.userId,
            account.providerId,
          );
        },
      },
    },
  },
  plugins: [dash(), bearer(), oneTap()],
};

export const auth = betterAuth(options);
