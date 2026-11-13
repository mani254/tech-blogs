import {
  All,
  Controller,
  NotFoundException,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { auth } from './better-auth.config';
import { Public } from './decorators/public.decorator';

@ApiTags('Better Auth Engine')
@Public()
@Controller({ path: 'auth', version: VERSION_NEUTRAL })
export class BetterAuthController {
  /**
   * Catches all requests to /api/auth/* (e.g. /api/auth/get-session, /api/auth/sign-out, etc.)
   * without URI versioning prefix and passes them directly to the Better Auth handler.
   */
  @All('*')
  @ApiOperation({
    summary: 'Better Auth engine direct handler',
    description:
      'Passes client requests directly to Better Auth Web Standard request handler (e.g. /api/auth/get-session, /api/auth/sign-in/social, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dynamic response from Better Auth handler',
  })
  async handleBetterAuth(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const url = `${req.protocol}://${req.hostname}${req.url}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers.append(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      }
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body:
        ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body
          ? JSON.stringify(req.body)
          : undefined,
    });

    const response = await auth.handler(webRequest);

    if (!response) {
      throw new NotFoundException(`Better Auth route not found: ${req.url}`);
    }

    if (response.status === 404) {
      throw new NotFoundException(`Route not found: ${req.url}`);
    }

    // Pass the HTTP status code from Better Auth
    reply.status(response.status);

    // Pass headers from Better Auth
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    // Handle empty body
    if (!response.body) {
      return reply.send();
    }

    // Read body text and pass to Fastify
    const text = await response.text();
    return reply.send(text);
  }
}
