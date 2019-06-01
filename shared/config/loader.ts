import * as fs from 'fs';
import * as _ from 'lodash';
import * as minimist from 'minimist';
import * as path from 'path';
import { Logger } from '../';

type Config = any;

const CONFIGS = './config';

export interface LoadConfigDependencies {
  defaultConfigsPath?: string;
  logger?: Logger;
}

export type ConfigLoader = (section?: string) => Config;

/**
 * Load config from default location or from location defined
 * with a flag -c or --config
 * It's also possible to provide multiple config files, in such case they'll be merged into one.
 *
 * @param section {string} pluck this property from loaded config (will be overriden by --configKey argument)
 * @returns config {T}
 */
export const configLoader = ({
  defaultConfigsPath = CONFIGS,
  logger,
}: LoadConfigDependencies): ConfigLoader => (section: string = '') => {
  const args = minimist(process.argv.slice(2));

  const configsPath: string = path.resolve(defaultConfigsPath)
  const configKey: string = args.configKey ? args.configKey : section;

  if (logger) {
    logger.info(`loading config from: ${configsPath} key: ${configKey}`);
  }

  let config: any = {};
  const configsPaths: string[] = fs.readdirSync(configsPath);
  for (const configPath of configsPaths) {
    const { config: fileConfig } = require(path.resolve(defaultConfigsPath, configPath))
    config = _.merge({}, config, fileConfig);
  }

  if (logger) {
    logger.info(JSON.stringify(config));
  }

  if (args.c && _.isUndefined(args.configKey)) {
    return config;
  }

  if (configKey === '') {
    return config;
  }

  return _.get(config, configKey);
};
