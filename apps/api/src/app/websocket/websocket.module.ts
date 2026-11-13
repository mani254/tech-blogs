import { Module } from '@nestjs/common';
import { UserRepository } from '@org/dal';
import { RedisModule } from '../redis/redis.module';
import { AppGateway } from './gateways/app.gateway';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [RedisModule],
  providers: [
    AppGateway,
    WsAuthGuard,
    {
      provide: UserRepository,
      useFactory: () => new UserRepository(),
    },
  ],
  exports: [AppGateway],
})
export class WebSocketModule {}
