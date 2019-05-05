import * as awilix from 'awilix';
import { ContainerOptions } from 'awilix';
import { winstonLogger, initTracer } from '../';
import { ServiceTracingConfig } from './tracing.config';

export function createBaseContainer(tracingConfig: ServiceTracingConfig, options?: ContainerOptions) {
  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
    ...options,
  });

  container.register({
    tracer: awilix.asValue(initTracer(tracingConfig, winstonLogger)),
    logger: awilix.asValue(winstonLogger),
  });

  return container;
}
