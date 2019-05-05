import { configLoader } from './loader';
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as mocha from 'mocha';

const baseConfig = {
  one: {
    a: 1,
    b: 1,
  },
  two: {
    c: 1,
    d: 1,
  },
};

const secretConfig = {
  one: {
    c: 1,
  },
  two: {
    d: 2,
  },
  three: {
    a: 1,
  },
};

const fullConfig = {
  one: {
    a: 1,
    b: 1,
    c: 1,
  },
  two: {
    c: 1,
    d: 2,
  },
  three: {
    a: 1,
  },
};

const setCommandLineArgs = () => {
  process.argv = ['path', 'path'];
};

describe('Loader', () => {
  it('Returns a full default config when no section and paths are provided', () => {
    setCommandLineArgs();

    const readFileSync = sinon
      .stub()
      .onFirstCall()
      .returns(JSON.stringify(baseConfig))
      .onSecondCall()
      .returns(JSON.stringify(secretConfig));

    const loadConfig = configLoader({ readFileSync });
    const config = loadConfig();

    assert.deepEqual(config, fullConfig);
  });

  it('Returns config`s section when vaild configKey is provided.', () => {
    setCommandLineArgs();
    process.argv.push('--configKey=one');

    const readFileSync = sinon
      .stub()
      .onFirstCall()
      .returns(JSON.stringify(baseConfig))
      .onSecondCall()
      .returns(JSON.stringify(secretConfig));

    const loadConfig = configLoader({ readFileSync });
    const config = loadConfig();

    assert.deepEqual(config, Object.assign({}, fullConfig.one));
  });

  it('Returns merged configs.', () => {
    setCommandLineArgs();
    process.argv.push('--configKey=one');
    process.argv.push('--c=./config/all.yaml,./myConfig');

    const overridingConfig = {
      one: {
        b: 2,
      },
    };

    const readFileSync = sinon
      .stub()
      .onFirstCall()
      .returns(JSON.stringify(baseConfig))
      .onSecondCall()
      .returns(JSON.stringify(overridingConfig))
      .onThirdCall()
      .returns(JSON.stringify(secretConfig));

    const loadConfig = configLoader({ readFileSync });
    const config = loadConfig();

    assert.deepEqual(config, { a: 1, b: 2, c: 1 });
  });
});
