import { Response } from '../../../../../shared';

/*****************************************/
/*         THIS FILE WAS GENERATED       */
/*              DO NOT TOUCH             */
/*****************************************/

export type Message = {
  content: string;
  username: string;
};

export type SendMessageRequest = {
  username: string;
  content: string;
  tracingId: string;
};

export type SendMessageResponse = null;

export type GetLatestMessagesRequest = {
  tracingId: string;
};

export type GetLatestMessagesResponse = {
  messages: Message[];
};

export type JoinChatRequest = {
  username: string;
  tracingId: string;
};

export interface MessagingServiceHandlers {
  sendMessage: (request: SendMessageRequest) => Promise<Response<SendMessageResponse>>;
  getLatestMessages: (request: GetLatestMessagesRequest) => Promise<Response<GetLatestMessagesResponse>>;
  joinChat: (request: JoinChatRequest) => Promise<Response<Message>>;
}
