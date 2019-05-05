/*****************************************/
/*        THIS FILE WAS GENERATED        */
/*              DO NOT TOUCH             */
/*****************************************/

import * as grpc from 'grpc';
import { resolve } from 'path';
import { Logger, loadMessageDefinition, toPromise, toObservable } from '../../../../../shared';
import {
  SendMessageRequest,
  SendMessageResponse,
  JoinChatRequest,
  GetLatestMessagesRequest,
  GetLatestMessagesResponse,
  Message,
} from '../types';
import { Observable } from 'rxjs';

type ClientDependencies = {
  uri: string;
  logger: Logger;
};

class MessagingClient {
  private client: any;

  constructor(private dependencies: ClientDependencies) {
    const messageDefinition = loadMessageDefinition(resolve(__dirname, '../../proto/messaging-service.proto'));
    const proto: any = grpc.loadPackageDefinition(messageDefinition).messaging;
    this.client = new proto.MessagingService(dependencies.uri, grpc.credentials.createInsecure());
  }

  public sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    this.dependencies.logger.info(`${JSON.stringify({ service: 'Messaging', method: 'sendMessage', request })}`);
    return toPromise<SendMessageRequest, SendMessageResponse>(this.client, 'sendMessage')(request);
  }

  public getLatestMessages(request: GetLatestMessagesRequest): Promise<GetLatestMessagesResponse> {
    this.dependencies.logger.info(`${JSON.stringify({ service: 'Messaging', method: 'getLatestMessages', request })}`);
    return toPromise<GetLatestMessagesRequest, GetLatestMessagesResponse>(this.client, 'getLatestMessages')(request);
  }

  public joinChat(request: JoinChatRequest): Promise<Observable<Message>> {
    this.dependencies.logger.info(`${JSON.stringify({ service: 'Messaging', method: 'joinChat', request })}`);
    return toObservable<JoinChatRequest, Message>(this.client, 'joinChat')(request);
  }
}

export { MessagingClient };
