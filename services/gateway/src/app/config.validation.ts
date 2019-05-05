import * as Joi from '@hapi/joi';
import { UiGatewayConfig } from './config';
import { tracingConfigSchema } from '../../../../shared';

const serviceConfigSchema = Joi.object().keys({
  uri: Joi.string()
    .uri()
    .required(),
  type: Joi.string().required(),
});

const uiGatewayConfigSchema = Joi.object().keys({
  appName: Joi.string().required(),
  services: Joi.array().items(serviceConfigSchema),
  port: Joi.number().required(),
  tracing: tracingConfigSchema.required(),
});

export const validateConfig = (config: UiGatewayConfig) => {
  const { error } = Joi.validate(config, uiGatewayConfigSchema);

  if (error !== null) {
    throw error;
  }
};
