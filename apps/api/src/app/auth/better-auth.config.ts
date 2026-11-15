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

async function getConnectedDb(): Promise<MongoDb> {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose.connection.db;
  }

  await new Promise<void>((resolve, reject) => {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      return resolve();
    }
    const timeout = setTimeout(() => {
      reject(
        new Error(
          '[BetterAuth] MongoDB connection timed out waiting for connectDatabase() in main.ts.',
        ),
      );
    }, 30000);

    const onConnected = () => {
      clearTimeout(timeout);
      resolve();
    };

    const onError = (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    };

    mongoose.connection.once('connected', onConnected);
    mongoose.connection.once('error', onError);
  });

  if (!mongoose.connection.db) {
    throw new Error('[BetterAuth] MongoDB is not connected.');
  }

  return mongoose.connection.db;
}

function createLazyCollection(name: string) {
  return new Proxy({} as unknown as Record<string, unknown>, {
    get(_target, prop: string) {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        const col = mongoose.connection.db.collection(name) as unknown as Record<string, unknown>;
        const val = col[prop];
        return typeof val === 'function' ? val.bind(col) : val;
      }

      return (...args: unknown[]) => {
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
          const col = mongoose.connection.db.collection(name) as unknown as Record<string, (...args: unknown[]) => unknown>;
          return col[prop].apply(col, args);
        }

        const promise = (async () => {
          const db = await getConnectedDb();
          const col = db.collection(name) as unknown as Record<string, (...args: unknown[]) => unknown>;
          return col[prop].apply(col, args);
        })();

        return new Proxy(promise, {
          get(targetPromise: Promise<unknown>, cursorProp: string) {
            if (cursorProp === 'then') return targetPromise.then.bind(targetPromise);
            if (cursorProp === 'catch') return targetPromise.catch.bind(targetPromise);
            if (cursorProp === 'finally') return targetPromise.finally.bind(targetPromise);
            return async (...cursorArgs: unknown[]) => {
              const cursor = await targetPromise;
              const cursorMethod = (cursor as Record<string, (...args: unknown[]) => unknown>)[cursorProp];
              if (typeof cursorMethod === 'function') {
                return cursorMethod.apply(cursor, cursorArgs);
              }
              return (cursor as Record<string, unknown>)[cursorProp];
            };
          },
        });
      };
    },
  });
}

/**
 * Strongly-typed Lazy DB Proxy for mongodbAdapter using Mongoose's MongoDb type.
 *
 * Resolves mongoose.connection.db dynamically at runtime when Better Auth endpoints
 * are invoked, avoiding import-time connection race conditions without any 'any' types.
 */
const lazyDb: MongoDb = new Proxy({} as unknown as MongoDb, {
  get<K extends keyof MongoDb>(_target: MongoDb, prop: K): MongoDb[K] {
    if (prop === 'collection') {
      return ((modelName: string) => {
        if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
          return mongoose.connection.db.collection(modelName);
        }
        return createLazyCollection(modelName);
      }) as MongoDb[K];
    }

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const val = mongoose.connection.db[prop];
      return typeof val === 'function' ? (val.bind(mongoose.connection.db) as MongoDb[K]) : val;
    }

    return ((...args: unknown[]) => {
      return (async () => {
        const db = await getConnectedDb();
        const val = db[prop];
        return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).apply(db, args) : val;
      })();
    }) as MongoDb[K];
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
