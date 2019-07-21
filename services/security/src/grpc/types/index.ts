/*****************************************/
/*         THIS FILE WAS GENERATED       */
/*              DO NOT TOUCH             */
/*****************************************/

import { Response } from '../../../../../shared';

export type AuthenticateRequest = {
  username: string;
  password: string;
};

export type AuthenticateResponse = {
  accessToken: string;
};

export type HasAccessRequest = {
  accessToken?: string;
  resourceId: string;
};

export type HasAccessResponse = {
  hasAccess: boolean;
};

export interface SecurityServiceHandlers {
  authenticate: (request: AuthenticateRequest) => Promise<Response<AuthenticateResponse>>;
  hasAccess: (request: HasAccessRequest) => Promise<Response<HasAccessResponse>>;
}
