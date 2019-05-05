import { winstonLogger } from './logger';
import * as winston from 'winston';
import { MESSAGE } from 'triple-beam';
import * as mocha from 'mocha';
import * as assert from 'assert';

describe('Logger', () => {
  it('outputs properly formatted message to console', () => {
    Date.prototype.toISOString = () => 'mockedDate';
    process.env['APP_NAME'] = 'appName';
    process.env['NODE_ENV'] = 'nodeEnv';
    process.env['HOST'] = 'host';
    process.env['LOGGING_LEVEL'] = 'loggingLevel';

    const logger = <any>winstonLogger;

    assert.equal(logger.transports[0] instanceof winston.transports.Console, true);

    const formatedLog = logger.format.transform({
      level: 'info',
      message: 'my-message',
    });

    assert.equal(
      formatedLog[MESSAGE],
      '{"@timestamp":"mockedDate","@version":1,"application":"appName","environment":"nodeEnv","host":"host","message":"my-message","severity":"info","type":"stdin"}'
    );
  });
});
