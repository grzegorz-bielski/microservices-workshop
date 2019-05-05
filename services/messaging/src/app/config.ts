import { TracingConfig } from '../../../../shared';

export interface MessagingConfig {
  appName: string;
  serverUri: string;
  tracing: TracingConfig;
  db: {
    type: string;
    url: string;
  };
  entities: string[];
  migrations: string[];
  migrationsDir: string;
}
