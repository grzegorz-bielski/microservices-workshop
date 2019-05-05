import { configLoader, ConfigLoader } from '../../../../shared';
import { MessagingConfig } from './config';
import { validateConfig } from './config.validation';

const loadConfig: ConfigLoader = configLoader({});
const config: MessagingConfig = loadConfig('messaging');
validateConfig(config);

module.exports = {
  type: <any>config.db.type,
  url: config.db.url,
  entities: config.entities,
  migrationsTableName: 'migrations',
  migrations: config.migrations,
  cli: {
    migrationsDir: config.migrationsDir,
  },
};
