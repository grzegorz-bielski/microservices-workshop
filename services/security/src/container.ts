import * as awilix from 'awilix';
import { AwilixContainer, ContainerOptions } from 'awilix';
import { ConfigLoader, configLoader, createBaseContainer } from '../../../shared';

import * as jsonwebtoken from 'jsonwebtoken';

import { SecurityConfig } from './app/config';
import { validateConfig } from './app/config.validation';
import { getProtoPath } from '../../../services-config';

import { SecurityService } from './service/service';

export default async function createContainer(options?: ContainerOptions): Promise<AwilixContainer> {
  const loadConfig: ConfigLoader = configLoader({});
  const config: SecurityConfig = await loadConfig();

  validateConfig(config);

  const container: AwilixContainer = createBaseContainer({ appName: config.appName, ...config.tracing }, options);

  // register dependencies here

  container.register({
    service: awilix.asValue({
      protoPath: getProtoPath('security'),
      uri: config.uri,
    }),
    salt: awilix.asValue('salt'),
    tokenService: awilix.asValue(jsonwebtoken),
    server: awilix.asClass(SecurityService),
  });

  return container;
}
