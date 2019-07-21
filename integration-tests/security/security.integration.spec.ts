import * as socketIo from 'socket.io-client';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as Joi from '@hapi/joi';
import { fromEvent } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';
import { getClient } from '../../services-config';
import { winstonLogger } from '../../shared';
import { SecurityClient } from '../../services/security/src/grpc/client';

describe('Security - authentication integration tests', async () => {
  const client: SecurityClient = await getClient('security', 'security:50050', winstonLogger);

  it('generates access token for valid data', async () => {
    const res = await client.authenticate({
      username: 'valid',
      // tslint:disable-next-line:no-hardcoded-credentials
      password: '2342',
    });

    assert.notEqual(res.accessToken, undefined);
  });

  it('throws error for invalid data', () => {
    assert.rejects(() =>
      client.authenticate({
        username: 'invalid',
        // tslint:disable-next-line:no-hardcoded-credentials
        password: '2342',
      })
    );
  });
});
