/*****************************************/
/*        THIS FILE WAS GENERATED        */
/*              DO NOT TOUCH             */
/*****************************************/

import { Observable } from 'rxjs';
import * as grpc from 'grpc';
import { resolve } from 'path';
import { Logger, loadMessageDefinition, toPromise, toObservable } from '../../../../../shared';
import { AuthenticateRequest, AuthenticateResponse, HasAccessRequest, HasAccessResponse } from '../types';

type ClientDependencies = {
  uri: string;
  logger: Logger;
};

class SecurityClient {
  private client: any;

  constructor(private dependencies: ClientDependencies) {
    const messageDefinition = loadMessageDefinition(resolve(__dirname, '../../proto/security-service.proto'));
    const proto: any = grpc.loadPackageDefinition(messageDefinition).security;
    this.client = new proto.SecurityService(dependencies.uri, grpc.credentials.createInsecure());
  }

  public authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse> {
    this.dependencies.logger.info(`${JSON.stringify({ service: 'Security', method: 'authenticate', request })}`);
    return toPromise<AuthenticateRequest, AuthenticateResponse>(this.client, 'authenticate')(request);
  }

  public hasAccess(request: HasAccessRequest): Promise<HasAccessResponse> {
    this.dependencies.logger.info(`${JSON.stringify({ service: 'Security', method: 'hasAccess', request })}`);
    return toPromise<HasAccessRequest, HasAccessResponse>(this.client, 'hasAccess')(request);
  }
}

export { SecurityClient };
