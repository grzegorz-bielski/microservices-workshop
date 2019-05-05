import * as awilix from 'awilix';
import { AwilixContainer, ContainerOptions } from 'awilix';
import { ConfigLoader, configLoader, createBaseContainer } from '../../../shared';
import { UiGatewayConfig } from './app/config';
import { validateConfig } from './app/config.validation';
import { getClient } from '../../../services-config';
import { SocketIOServer } from './server/socket-io-server';

export default async function createContainer(options?: ContainerOptions): Promise<AwilixContainer> {
  const loadConfig: ConfigLoader = configLoader({});
  const config: UiGatewayConfig = loadConfig();
  validateConfig(config);

  const container: AwilixContainer = createBaseContainer({ appName: config.appName, ...config.tracing }, options);

  const clients: any = {};

  for (const service of config.services) {
    clients[<any>service.type] = await getClient(<any>service.type, service.uri, container.resolve('logger'));
  }

  container.register({
    port: awilix.asValue(config.port),
    config: awilix.asValue(config),
    clients: awilix.asValue(clients),
    socketIoServer: awilix.asClass(SocketIOServer),
  });

  return container;
}
