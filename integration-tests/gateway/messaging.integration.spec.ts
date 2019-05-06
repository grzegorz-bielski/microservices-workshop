import * as socketIo from 'socket.io-client';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as Joi from '@hapi/joi';
import { fromEvent } from 'rxjs';
import { first } from 'rxjs/operators';
import { join } from 'path';

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
        .pipe(first())
        .toPromise();

      socket.emit('message', {
        serviceName: 'messaging',
        serviceOperation: 'sendMessage',
        payload: {
          username: 'John',
          content: 'some message',
        },
      });

      const sendMessageResponse = await onSendMessage;

      const sendMessageValidationResult = Joi.validate(
        sendMessageResponse,
        Joi.object().keys({
          type: Joi.valid('messaging-sendMessage'),
          payload: Joi.object().empty(),
        })
      );
      assert.equal(sendMessageValidationResult.error, null);

      const onBroadcastedMessage = fromEvent(socket, 'message')
        .pipe(first())
        .toPromise();

      const boardcastedMessageResponse = await onBroadcastedMessage;

      const broadcastedMessageValidationResult = Joi.validate(
        boardcastedMessageResponse,
        Joi.object().keys({
          payload: Joi.object().keys({ content: Joi.valid('some message'), username: Joi.valid('John') }),
          type: Joi.string().valid('messaging-joinChat'),
        })
      );
      assert.equal(broadcastedMessageValidationResult.error, null);

      socket.close();
      done();
    });
  });
});
