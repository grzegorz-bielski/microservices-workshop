import * as awilix from 'awilix';
import { AwilixContainer, ContainerOptions } from 'awilix';
import { ConfigLoader, configLoader, createBaseContainer } from '../../../shared';

import { MessagingConfig } from './app/config';
import { validateConfig } from './app/config.validation';
import { MessagingService } from './service/service';
import { getProtoPath } from '../../../services-config';
import { createConnection } from 'typeorm';
import * as dbConfig from './app/db';
import { Message } from './entities/message';

export default async function createContainer(options?: ContainerOptions): Promise<AwilixContainer> {
  const loadConfig: ConfigLoader = configLoader({});
  const config: MessagingConfig = await loadConfig();
  validateConfig(config);

  const container: AwilixContainer = createBaseContainer({ appName: config.appName, ...config.tracing }, options);

  const dbConnection = await createConnection(<any>dbConfig);
  await dbConnection.runMigrations();

  const messagesRepository = dbConnection.getRepository(Message);

  container.register({
    service: awilix.asValue({
      protoPath: getProtoPath('messaging'),
      uri: config.uri,
    }),
    messagesRepository: awilix.asValue(messagesRepository),
    server: awilix.asClass(MessagingService),
  });

  return container;
}
