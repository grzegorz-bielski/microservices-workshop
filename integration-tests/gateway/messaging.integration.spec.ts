import * as socketIo from 'socket.io-client';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as Joi from '@hapi/joi';
import { fromEvent, combineLatest, Observable, zip } from 'rxjs';
import { tap, take, share, skip, filter, switchMapTo } from 'rxjs/operators';

type SocketMsg<T> = { payload: T; type: string };
type LogInMsg = SocketMsg<{ accessToken: string }>;
type JoinChatMsg = SocketMsg<{}>;
type Msg = LogInMsg | JoinChatMsg;

describe('Gateway - messaging integration tests', () => {
  let socket: SocketIOClient.Socket;

  beforeEach(() => {
    socket = socketIo('http://gateway:50050');
  });

  afterEach(() => {
    socket.close();
  });

  it('joins to chat and sends a message', done => {
    const connection$ = fromEvent(socket, 'connect').pipe(
      tap(() =>
        socket.emit('message', {
          serviceName: 'security',
          serviceOperation: 'authenticate',
          payload: {
            username: 'John',
            // tslint:disable-next-line:no-hardcoded-credentials
            password: 'werewr',
          },
        })
      )
    );

    const msg$ = connection$.pipe(
      switchMapTo(fromEvent<Msg>(socket, 'message')),
      share()
    );

    const toMsgOfType = toMsg(msg$);

    const login$ = msg$.pipe(
      filter(({ type }) => type === 'security-authenticate'),
      share()
    );

    const joinChat$ = login$.pipe(
      tap(msg => {
        socket.emit('message', {
          serviceName: 'messaging',
          serviceOperation: 'joinChat',
          accessToken: getAccessToken(msg),
          payload: {
            username: 'John',
          },
        });
      }),
      toMsgOfType('messaging-joinChat')
    );

    const firstChatMsg$ = joinChat$.pipe(take(1));
    const secondChatMsg$ = joinChat$.pipe(skip(1));

    const sendMessage$ = combineLatest(login$, joinChat$).pipe(
      tap(([msg]) =>
        socket.emit('message', {
          serviceName: 'messaging',
          serviceOperation: 'sendMessage',
          accessToken: getAccessToken(msg),
          payload: {
            username: 'John',
            content: 'some message',
          },
        })
      ),
      toMsgOfType('messaging-sendMessage')
    );

    zip(secondChatMsg$, sendMessage$).subscribe(() => done());

    firstChatMsg$.subscribe(msg => {
      const validationRes = Joi.validate(
        msg,
        Joi.object().keys({
          type: Joi.string().valid('messaging-joinChat'),
          payload: Joi.object().empty(),
        })
      );

      assert.equal(validationRes.error, null);
    });

    secondChatMsg$.subscribe(msg => assert.deepEqual(msg.payload, { content: 'some message', username: 'John' }));

    sendMessage$.subscribe(msg => assert.deepEqual(msg.payload, {}));
  });
});

function getAccessToken(msg: Msg) {
  return (msg as LogInMsg).payload.accessToken;
}

type ToMsgMapper = (b: string) => (a: Observable<Msg | Msg[]>) => Observable<Msg>;
function toMsg(msg$: Observable<Msg>): ToMsgMapper {
  return type => source$ =>
    source$.pipe(
      switchMapTo(msg$),
      share(),
      filter(msg => msg.type === type)
    );
}
