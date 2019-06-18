import * as socketIo from 'socket.io-client';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as Joi from '@hapi/joi';
import { fromEvent } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';

describe('Gateway - messaging integration tests', () => {
  let socket: SocketIOClient.Socket;

  beforeEach(() => {
    socket = socketIo('http://gateway:50050');
  });

  afterEach(() => {
    socket.close();
  });

  it('joins to chat and sends a message', done => {
    const connect$ = fromEvent(socket, 'connect');
    connect$.subscribe(async () => {
      const onJoinChatMessage = fromEvent(socket, 'message')
        .pipe(first())
        .toPromise();

      socket.emit('message', {
        serviceName: 'messaging',
        serviceOperation: 'joinChat',
        payload: {
          username: 'John',
        },
      });

      const joinChatMessageResponse = await onJoinChatMessage;
      const joinChatValidationResult = Joi.validate(
        joinChatMessageResponse,
        Joi.object().keys({
          type: Joi.string().valid('messaging-joinChat'),
          payload: Joi.object().empty(),
        })
      );
      assert.equal(joinChatValidationResult.error, null);

      const onSendMessage = fromEvent(socket, 'message')
        .pipe(take(2), toArray())
        .toPromise();

      socket.emit('message', {
        serviceName: 'messaging',
        serviceOperation: 'sendMessage',
        payload: {
          username: 'John',
          content: 'some message',
        },
      });

      const responsesOnSendMessgae = await onSendMessage;

      const joinChatResponse: any = responsesOnSendMessgae.find(response => (<any>response).type === 'messaging-joinChat')
      const sendMessageResponse: any = responsesOnSendMessgae.find(response => (<any>response).type === 'messaging-sendMessage')

      assert.deepEqual(joinChatResponse.payload, { content: 'some message', username: 'John' })

      assert.deepEqual(sendMessageResponse.payload, {})

      socket.close();
      done();
    });
  });
});
