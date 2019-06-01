import { tracingConfigSchema } from '../../../../shared';
import * as Joi from '@hapi/joi';
import { MessagingConfig } from './config';

const dbConfigSchema = Joi.object().keys({
  type: Joi.string().required(),
  url: Joi.string().required(),
});

const messagingConfigSchema = Joi.object().keys({
  appName: Joi.string().required(),
  uri: Joi.string().required(),
  tracing: tracingConfigSchema.required(),
  db: dbConfigSchema.required(),
  entities: Joi.array()
    .items(Joi.string())
    .required(),
  migrations: Joi.array()
    .items(Joi.string())
    .required(),
  migrationsDir: Joi.string().required(),
});

export const validateConfig = (config: MessagingConfig) => {
  const { error } = Joi.validate(config, messagingConfigSchema);

  if (error !== null) {
    throw error;
  }
};
