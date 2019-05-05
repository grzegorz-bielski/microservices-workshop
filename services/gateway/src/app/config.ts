import { TracingConfig } from '../../../../shared';

export interface ServiceConfig {
  type: string;
  uri: string;
}

export interface UiGatewayConfig {
  appName: string;
  port: number;
  tracing: TracingConfig;
  services: ServiceConfig[];
}
