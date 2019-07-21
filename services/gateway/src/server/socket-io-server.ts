import * as socketIo from 'socket.io';
import { Server as HttpServer } from 'http';
import { Logger, CallTracer, Span } from '../../../../shared';
import { internalError } from '../message-types/message-types';
import { Observable, Subscription } from 'rxjs';

type ServerDependencies = {
  port: string;
  logger: Logger;
  tracer: CallTracer;
  clients: Clients;
};

type SocketMessage = {
  payload: object;
  serviceName: string;
  serviceOperation: string;
  accessToken?: string;
  requestId: string;
};

type Clients = {
  [key: string]: any;
};

export class SocketIOServer {
  private socketIOServer: SocketIO.Server;
  private activeSubscriptions: {
    [key: string]: Subscription;
  } = {};

  constructor(private dependencies: ServerDependencies) {
    this.socketIOServer = socketIo(new HttpServer());
    this.socketIOServer.origins('*:*');

    this.socketIOServer.on('connection', (socket: SocketIO.Socket) => {
      this.dependencies.logger.info(
        `new socket connection: ${socket.id} (access token: ${socket.handshake.query.accessToken})`
      );

      socket.on('message', (data: SocketMessage) => {
        this.dependencies.logger.info(JSON.stringify(data));

        this.dependencies.tracer.traceCall('websocket message', async span => {
          await this.handle(data, socket, span);
        });
      });

      socket.on('disconnect', () => {
        this.dependencies.logger.info(`socket disconnected: ${socket.id}`);

        if (this.activeSubscriptions[socket.id]) {
          this.activeSubscriptions[socket.id].unsubscribe();
        }
      });
    });
  }

  public listen() {
    this.socketIOServer.listen(this.dependencies.port);
  }

  private async handle(data: SocketMessage, socket: SocketIO.Socket, span: Span) {
    const message = { ...data, clientId: socket.id, accessToken: socket.handshake.query.accessToken };
    span.addTags(message);

    this.dependencies.logger.info(JSON.stringify(message));

    try {
      await this.handleCall(data, socket, span);
    } catch (e) {
      const errorMessage = internalError();
      this.dependencies.logger.error(errorMessage.payload);
      this.dependencies.logger.error(e.message);
      this.dependencies.logger.error(e.stack);
      socket.emit('message', { ...errorMessage, requestId: data.requestId });
    }
  }

  private async handleCall(data: SocketMessage, socket: SocketIO.Socket, span: Span) {
    if (!this.dependencies.clients[data.serviceName]) {
      this.dependencies.logger.error(`Service ${data.serviceName} does not exist`);
      return;
    }

    if (!this.dependencies.clients[data.serviceName][data.serviceOperation]) {
      this.dependencies.logger.error(`Service ${data.serviceName}, method ${data.serviceOperation} does not exist`);
      return;
    }

    const sd = await this.dependencies.clients.security.hasAccess({
      accessToken: data.accessToken,
      resourceId: `${data.serviceName}/${data.serviceOperation}`,
    });

    if (!sd.hasAccess) {
      throw new Error('no access');
    }

    this.dependencies.clients[data.serviceName]
      [data.serviceOperation]({
        ...data.payload,
        accessToken: data.accessToken,
        requestId: data.requestId,
        tracingId: this.dependencies.tracer.tracingIdToString(span),
      })
      .then((result: any) => {
        if (result instanceof Observable) {
          const subscription = result.subscribe(message => {
            this.dependencies.logger.info(JSON.stringify(message));

            socket.emit('message', {
              payload: message,
              type: `${data.serviceName}-${data.serviceOperation}`,
              requestId: data.requestId,
            });
          });

          this.activeSubscriptions[socket.id] = subscription;

          socket.emit('message', { type: `${data.serviceName}-${data.serviceOperation}`, payload: {} });
        } else {
          const successMessage = { result: 'success', data: result };
          span.addTags(successMessage);

          this.dependencies.logger.info(JSON.stringify(successMessage));

          return socket.emit('message', {
            payload: result,
            type: `${data.serviceName}-${data.serviceOperation}`,
            requestId: data.requestId,
          });
        }
      })
      .catch(this.handleErrors(socket, span));
  }

  private handleErrors(socket: SocketIO.Socket, span: Span) {
    return (error: any) => {
      const errorMessage = { result: 'error', error };
      span.addTags(errorMessage);

      this.dependencies.logger.error(JSON.stringify(errorMessage));
      socket.emit('message', errorMessage);
    };
  }
}
