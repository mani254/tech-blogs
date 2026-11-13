import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API Error Response DTO for OpenAPI / Swagger documentation.
 * Conforms to HttpExceptionFilter's serialized response shape.
 */
export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: 'Operation failure flag' })
  success!: boolean;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({
    example: 'Invalid OTP code. Please check and try again.',
    description: 'Error message description',
  })
  error!: string;

  @ApiPropertyOptional({
    example: 'INVALID_CREDENTIALS',
    description: 'Application error code',
  })
  code?: string;

  @ApiProperty({
    example: '2026-10-22T21:30:00.000Z',
    description: 'ISO timestamp when the error occurred',
  })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/auth/login', description: 'Request path' })
  path!: string;
}
