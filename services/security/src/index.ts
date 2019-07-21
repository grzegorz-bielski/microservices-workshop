import createContainer from './container';
import { Logger } from '../../../shared';
import { SecurityServiceHandlers } from './grpc/types';
(async () => {
  const container = await createContainer();

  process.on('uncaughtException', err => {
    container.resolve<Logger>('logger').error(`Uncaught: ${err.toString()}`, err);
    process.exit(1);
  });

  process.on('unhandledRejection', err => {
    if (err) {
      container.resolve<Logger>('logger').error(`Unhandled: ${err.toString()}`, err);
    }
    process.exit(1);
  });

  container.resolve<SecurityServiceHandlers>('server');
})();
