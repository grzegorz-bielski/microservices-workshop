import { fromEvent } from 'rxjs';
import { first } from 'rxjs/operators';
import * as Joi from '@hapi/joi';

export const createSocketValidator = (socketClient: any) => async (message: any, expectedResponse: any) => {
  const onMessage = fromEvent(socketClient, 'message')
    .pipe(first())
    .toPromise();

  socketClient.emit('message', message);

  const response = <any>await onMessage;

  return {
    validation: Joi.validate(response, expectedResponse),
    response,
  };
};
