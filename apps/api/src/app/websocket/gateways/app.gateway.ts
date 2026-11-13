import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { UserEntity } from '@org/dal';
import { WS_EVENTS } from '@org/shared';
import { Server, Socket } from 'socket.io';
import { RedisPresenceService } from '../../redis/redis-presence.service';
import { WsAuthGuard } from '../guards/ws-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AppGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly redisPresenceService: RedisPresenceService,
    private readonly wsAuthGuard: WsAuthGuard,
  ) {}

  // ─── Lifecycle: Connection ─────────────────────────────────────────────────

  async handleConnection(client: Socket): Promise<void> {
    const isAuthenticated = await this.wsAuthGuard.validateSocket(client);

    if (!isAuthenticated) {
      this.logger.warn(`Disconnecting unauthenticated socket ${client.id}`);
      client.emit(WS_EVENTS.WS_ERROR, { message: 'Authentication required' });
      client.disconnect(true);
      return;
    }

    const user: UserEntity = client.data.user;
    this.logger.log(
      `⚡ Connected: ${client.id} (User: ${user.email} [${user._id}])`,
    );

    // Track socket in Redis presence
    await this.redisPresenceService.setUserOnline(user._id, client.id);

    // Join personal user room
    await client.join(`user:${user._id}`);

    // Broadcast to all clients
    this.server.emit(WS_EVENTS.USER_ONLINE, {
      userId: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Lifecycle: Disconnection ──────────────────────────────────────────────

  async handleDisconnect(client: Socket): Promise<void> {
    const user: UserEntity | undefined = client.data.user;
    if (!user) return;

    this.logger.log(`🔌 Disconnected: ${client.id} (User: ${user.email})`);

    await this.redisPresenceService.setUserOffline(user._id, client.id);

    const isStillOnline = await this.redisPresenceService.isUserOnline(
      user._id,
    );
    if (!isStillOnline) {
      this.server.emit(WS_EVENTS.USER_OFFLINE, {
        userId: user._id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ─── Presence Handlers ─────────────────────────────────────────────────────

  @SubscribeMessage(WS_EVENTS.PRESENCE_PING)
  async handleHeartbeat(@ConnectedSocket() client: Socket): Promise<void> {
    const user: UserEntity = client.data.user;
    if (user) {
      await this.redisPresenceService.heartbeat(user._id);
      client.emit(WS_EVENTS.PRESENCE_PONG, {
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage(WS_EVENTS.PRESENCE_GET_ONLINE)
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket): Promise<void> {
    const onlineUserIds = await this.redisPresenceService.getOnlineUserIds();
    client.emit(WS_EVENTS.PRESENCE_ONLINE_LIST, { onlineUserIds });
  }
}
