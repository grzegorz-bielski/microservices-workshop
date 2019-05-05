import * as Joi from '@hapi/joi';

export const tracingConfigSchema = Joi.object().keys({
  tracingServiceHost: Joi.string().required(),
  tracingServicePort: Joi.number().required(),
});
