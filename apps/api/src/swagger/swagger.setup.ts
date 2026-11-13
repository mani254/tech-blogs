import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * configureSwagger
 *
 * Sets up OpenAPI / Swagger at GET /api/docs.
 *
 * Features:
 *  - Bearer JWT auth support (future-ready)
 *  - DTO classes annotated with @ApiProperty() appear automatically
 *  - Disabled in production via NODE_ENV guard
 */
export function configureSwagger(app: INestApplication): void {
  if (process.env['NODE_ENV'] === 'production') return;

  const config = new DocumentBuilder()
    .setTitle('Technical Blogging Platform API')
    .setDescription(
      'Production-ready NestJS Fastify API for Technical Blogging Platform.\n\n' +
        'All request/response shapes are defined in `@org/shared`.',
    )
    .setVersion('1.0')
    .addTag('health', 'Application health checks')
    .addTag(
      'Authentication & User',
      'Better Auth session management, email/phone OTP, credentials, and Google OAuth',
    )
    .addTag('Better Auth Engine', 'Direct Better Auth protocol handlers')
    .addTag('User', 'User profiles and account settings')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Better Auth session token',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
