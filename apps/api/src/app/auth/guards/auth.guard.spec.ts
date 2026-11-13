import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard Session Verification', () => {
  it('should allow access to public routes marked with @Public()', async () => {
    const reflector = {
      getAllAndOverride: (key: string) => {
        if (key === 'isPublic') return true;
        return false;
      },
    } as unknown as Reflector;

    const guard = new AuthGuard(reflector);

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    assert.equal(result, true);
  });

  it('should reject unauthenticated requests to protected routes', async () => {
    const reflector = {
      getAllAndOverride: (key: string) => {
        if (key === 'isPublic') return false;
        return false;
      },
    } as unknown as Reflector;

    const guard = new AuthGuard(reflector);

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await assert.rejects(
      async () => {
        await guard.canActivate(mockContext);
      },
      (err: unknown) => {
        assert.ok(err instanceof UnauthorizedException);
        return true;
      },
    );
  });
});
