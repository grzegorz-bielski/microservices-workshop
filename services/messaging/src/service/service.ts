import {
  SendMessageRequest,
  SendMessageResponse,
  MessagingServiceHandlers,
  GetLatestMessagesRequest,
  GetLatestMessagesResponse,
  JoinChatRequest,
  Message,
} from '../grpc/types';
import * as grpc from 'grpc';
import { CallTracer, Response, Logger, loadMessageDefinition, Call, Callback, CallStream } from '../../../../shared';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Message as MessageEntity } from '../entities/message';
import { v4 } from 'uuid';

interface ServiceDependencies {
  service: {
    protoPath: string;
    uri: string;
  };
  messagesRepository: Repository<MessageEntity>;
  tracer: CallTracer;
  logger: Logger;
}

class MessagingService implements MessagingServiceHandlers {
  private server: grpc.Server;
  private connectedUsers: CallStream<Message, JoinChatRequest>[] = [];

  constructor(private dependencies: ServiceDependencies) {
    this.server = new grpc.Server();

    const messageDefinition = loadMessageDefinition(dependencies.service.protoPath);
    const proto: any = grpc.loadPackageDefinition(messageDefinition)['messaging'];
    const grpcHandlers = {
      sendMessage: (call: Call<SendMessageRequest>, callback: Callback<SendMessageResponse>) => {
        this.sendMessage(call.request)
          .then(() => {
            callback(null, null);

            this.connectedUsers.forEach(user => {
              user.write({
                username: call.request.username,
                content: call.request.content,
              });
            });
          })
          .catch(error => {
            callback(error, null);
          });
      },
      getLatestMessages: (call: Call<GetLatestMessagesRequest>, callback: Callback<GetLatestMessagesResponse>) => {
        this.getLatestMessages(call.request)
          .then(messages => {
            if (!(messages instanceof Observable)) {
              callback(null, messages);
            }
          })
          .catch(error => {
            callback(error, null);
          });
      },
      joinChat: (callStream: CallStream<Message, JoinChatRequest>) => {
        this.joinChat(callStream.request).then(() => {
          this.connectedUsers.push(callStream);
        });

        callStream.on('cancelled', () => {
          this.connectedUsers = this.connectedUsers.filter(user => user !== callStream);
        });
      },
    };

    this.server.addService(proto['MessagingService'].service, grpcHandlers);

    this.server.bind(dependencies.service.uri, grpc.ServerCredentials.createInsecure());
    this.server.start();
  }

  public sendMessage(request: SendMessageRequest): Promise<Response<SendMessageResponse>> {
    return this.dependencies.tracer.traceCall(
      'send message',
      async span => {
        span.addTags(request);

        try {
          await this.dependencies.messagesRepository.insert(
            MessageEntity.create({
              id: v4(),
              content: request.content,
              username: request.username,
              createdAt: Date.now(),
            })
          );

          span.addTags({ result: 'success' });
          return Promise.resolve(null);
        } catch (err) {
          this.dependencies.logger.error(err, err);
          span.addTags({ result: 'error', error: err });
          return Promise.reject(err);
        }
      },
      undefined,
      this.dependencies.tracer.tracingIdFromString(request.tracingId)
    );
  }

  public getLatestMessages(request: GetLatestMessagesRequest): Promise<Response<GetLatestMessagesResponse>> {
    return this.dependencies.tracer.traceCall(
      'get latests messages',
      async span => {
        span.addTags(request);

        try {
          const messages = await this.dependencies.messagesRepository.find();

          span.addTags({ result: 'success' });
          return Promise.resolve({ messages });
        } catch (err) {
          this.dependencies.logger.error(err, err);
          span.addTags({ result: 'error', error: err });
          return Promise.reject(err);
        }
      },
      undefined,
      this.dependencies.tracer.tracingIdFromString(request.tracingId)
    );
  }

  public joinChat(request: JoinChatRequest): Promise<Response<Message>> {
    return this.dependencies.tracer.traceCall(
      'join chat',
      async span => {
        span.addTags(request);

        try {
          return {};
        } catch (err) {
          this.dependencies.logger.error(err, err);
          span.addTags({ result: 'error', error: err });
          return Promise.reject(err);
        }
      },
      undefined,
      this.dependencies.tracer.tracingIdFromString(request.tracingId)
    );
  }
}

export { MessagingService };
