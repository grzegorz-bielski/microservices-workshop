const tracing = {
  tracingServiceHost: 'jaeger',
  tracingServicePort: 6832,
};

const messaging = {
  appName: 'messaging',
  uri: '0.0.0.0:50050',
  tracing,
  db: {
    type: 'postgres',
    url: 'postgres://messaging:password@messaging-db:5432/messaging',
  },
  entities: ['/app/build/services/messaging/src/entities/*'],
  migrations: ['/app/build/services/messaging/src/migrations/*'],
  migrationsDir: 'services/messaging/src/migrations',
};

const security = {
  appName: 'security',
  uri: '0.0.0.0:50050',
  tracing,
};

const gateway = {
  appName: 'gateway',
  port: '50050',
  tracing,
  services: [{ type: 'messaging', uri: 'messaging:50050' }, { type: 'security', uri: 'security:50050' }],
};

module.exports = {
  config: {
    messaging,
    gateway,
    security,
  },
};
