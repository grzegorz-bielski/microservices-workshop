import * as Joi from '@hapi/joi';
import { SecurityConfig } from './config';
import { tracingConfigSchema } from '../../../../shared';

const securityConfigSchema = Joi.object().keys({
  appName: Joi.string().required(),
  uri: Joi.string().required(),
  tracing: tracingConfigSchema.required(),
});

export const validateConfig = (config: SecurityConfig) => {
  const { error } = Joi.validate(config, securityConfigSchema);

  if (error !== null) {
    throw error;
  }
};
