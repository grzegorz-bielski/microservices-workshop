export interface ServiceTracingConfig extends TracingConfig {
  appName: string;
}

export interface TracingConfig {
  tracingServiceHost: string;
  tracingServicePort: number;
}
