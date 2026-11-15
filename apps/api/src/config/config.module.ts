import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import appConfig from './app.config';
import authConfig from './auth.config';
import databaseConfig from './database.config';
import mailConfig from './mail.config';
import redisConfig from './redis.config';
import r2Config from './r2.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        '.env.local',
        '.env',
        '../../.env.local',
        '../../.env',
      ],
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        mailConfig,
        redisConfig,
        r2Config,
      ],
    }),
  ],
})
export class ConfigModule {}
