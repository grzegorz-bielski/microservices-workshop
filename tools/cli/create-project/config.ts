import { ProjectFile } from '.';
import { join } from 'path';
import { camelCase, upperFirst } from 'lodash';

const createContent = (projectName: string): string => {
  const configName = `${upperFirst(camelCase(projectName))}Config`;

  return `
  import { TracingConfig } from '../../../../shared';

  export interface ${configName} {
    appName: string
    uri: string
    tracing: TracingConfig
  }
  `;
};

const createValidatorContent = (projectName: string): string => {
  const configName = `${upperFirst(camelCase(projectName))}Config`;
  const configSchema = `${camelCase(projectName)}ConfigSchema`;

  return `
  import * as Joi from '@hapi/joi'
  import { ${configName} } from './config'
  import { tracingConfigSchema } from '../../../../shared';

  const ${configSchema} = Joi.object().keys({
    appName: Joi.string().required(),
    uri: Joi.string().required(),
    tracing: tracingConfigSchema.required(),
  })

  export const validateConfig = (config: ${configName}) => {
    const { error } = Joi.validate(config, ${configSchema})

    if (error !== null) {
      throw error
    }
  }
  `;
};

export const config = (baseDir: string, projectName: string): ProjectFile => {
  return {
    path: join(baseDir, 'src', 'app', 'config.ts'),
    content: createContent(projectName),
  };
};

export const configValidator = (baseDir: string, projectName: string): ProjectFile => {
  return {
    path: join(baseDir, 'src', 'app', 'config.validation.ts'),
    content: createValidatorContent(projectName),
  };
};
