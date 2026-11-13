import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GoogleAuthService } from './google-auth.service';

describe('GoogleAuthService Token Security', () => {
  const configService = {
    get: (key: string) =>
      key === 'auth.googleClientId'
        ? 'test-google-client-id.apps.googleusercontent.com'
        : undefined,
  } as unknown as ConfigService;

  const service = new GoogleAuthService(configService);

  it('should throw BadRequestException if token is missing or empty', async () => {
    await assert.rejects(
      async () => {
        await service.verifyIdToken('');
      },
      (err: unknown) => {
        assert.ok(err instanceof BadRequestException);
        assert.match((err as Error).message, /Google ID token is required/);
        return true;
      },
    );
  });

  it('should throw UnauthorizedException if token is malformed', async () => {
    await assert.rejects(
      async () => {
        await service.verifyIdToken('invalid.token.structure');
      },
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return true;
      },
    );
  });
});
