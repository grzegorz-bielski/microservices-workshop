import { ProjectFile } from '.';
import { join } from 'path';

const createContent = (): string => {
  return `
  import createContainer from './container'
  import { Logger } from '../../../shared';
  ;(async () => {
    const container = await createContainer()

    process.on('uncaughtException', err => {
    container.resolve<Logger>('logger').error(\`Uncaught: \${err.toString()}\`, err)
    process.exit(1)
  })

  process.on('unhandledRejection', err => {
    if (err) {
      container.resolve<Logger>('logger').error(\`Unhandled: \${err.toString()}\`, err)
    }
    process.exit(1)
  })

  })()
  `;
};

export const projectIndex = (baseDir: string): ProjectFile => {
  return {
    path: join(baseDir, 'src', 'index.ts'),
    content: createContent(),
  };
};
