import { TracingConfig } from '../../../../shared';

export interface SecurityConfig {
  appName: string;
  uri: string;
  tracing: TracingConfig;
}
