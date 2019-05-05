import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as minimist from 'minimist';
import * as path from 'path';
import { Logger } from '../';

type Config = any;
type ReadFileOptions = any;

const DEFAULT_CONFIG_PATH = './config/all.yaml';
const DEFAULT_SECRET_CONFIG_PATH = './config/secret.yaml';

export interface LoadConfigDependencies {
  readFileSync?: (path: string, options?: ReadFileOptions) => string;
  defaultConfigPath?: string;
  defaultSecretConfigPath?: string;
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
  readFileSync = fs.readFileSync,
  defaultConfigPath = DEFAULT_CONFIG_PATH,
  defaultSecretConfigPath = DEFAULT_SECRET_CONFIG_PATH,
  logger,
}: LoadConfigDependencies): ConfigLoader => (section: string = '') => {
  const args = minimist(process.argv.slice(2));

  const configPaths: string[] = args.c ? args.c.split(',') : [defaultConfigPath];
  const configAbsolutePaths: string[] = configPaths.map(configPath => path.resolve(configPath));
  const configKey: string = args.configKey ? args.configKey : section;

  if (logger) {
    logger.info(`loading config from: ${configAbsolutePaths.join(', ')} key: ${configKey}`);
  }

  const configYamls: string[] = configAbsolutePaths.map(configPath => readFileSync(configPath, 'utf8'));
  const configs: object[] = configYamls.map(configYaml => yaml.safeLoad(configYaml));

  if (logger) {
    logger.info(JSON.stringify(configs));
  }

  const secretConfigPaths: string[] = args.sc ? args.sc.split(',') : [defaultSecretConfigPath];
  const secretConfigAbsolutePaths: string[] = secretConfigPaths.map(configPath => path.resolve(configPath));
  const secretConfigYamls: string[] = secretConfigAbsolutePaths.map(configPath => readFileSync(configPath, 'utf8'));
  const secretConfigs: object[] = secretConfigYamls.map(configYaml => yaml.safeLoad(configYaml));

  const config: object = _.merge({}, ...configs, ...secretConfigs);

  if (args.c && _.isUndefined(args.configKey)) {
    return config;
  }

  if (configKey === '') {
    return config;
  }

  return _.get(config, configKey);
};
