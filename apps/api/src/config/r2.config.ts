import { registerAs } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { IsOptional, IsString, validateSync } from 'class-validator';

class R2Env {
  @IsString()
  CLOUDFLARE_R2_ACCOUNT_ID: string =
    process.env['CLOUDFLARE_R2_ACCOUNT_ID'] || 'test-account-id';

  @IsString()
  CLOUDFLARE_R2_ACCESS_KEY_ID: string =
    process.env['CLOUDFLARE_R2_ACCESS_KEY_ID'] || 'test-access-key-id';

  @IsString()
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: string =
    process.env['CLOUDFLARE_R2_SECRET_ACCESS_KEY'] || 'test-secret-access-key';

  @IsString()
  CLOUDFLARE_R2_BUCKET_NAME: string =
    process.env['CLOUDFLARE_R2_BUCKET_NAME'] || 'tech-blogs-assets';

  @IsOptional()
  @IsString()
  CLOUDFLARE_R2_PUBLIC_BUCKET_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDFLARE_R2_PRIVATE_BUCKET_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDFLARE_R2_PUBLIC_DOMAIN?: string;

  @IsOptional()
  @IsString()
  CLOUDFLARE_R2_PUBLIC_URL?: string;

  @IsOptional()
  @IsString()
  CLOUDFLARE_R2_ENDPOINT?: string;
}

function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(R2Env, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Cloudflare R2 config validation failed:\n${errors.toString()}`,
    );
  }
  return validated;
}

export default registerAs('r2', () => {
  const env = validate(process.env as Record<string, unknown>);
  const defaultBucket = env.CLOUDFLARE_R2_BUCKET_NAME;
  return {
    accountId: env.CLOUDFLARE_R2_ACCOUNT_ID,
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucketName: defaultBucket,
    publicBucketName: env.CLOUDFLARE_R2_PUBLIC_BUCKET_NAME || defaultBucket,
    privateBucketName: env.CLOUDFLARE_R2_PRIVATE_BUCKET_NAME || defaultBucket,
    publicDomain:
      env.CLOUDFLARE_R2_PUBLIC_DOMAIN || env.CLOUDFLARE_R2_PUBLIC_URL,
    publicUrl: env.CLOUDFLARE_R2_PUBLIC_URL,
    endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  };
});
