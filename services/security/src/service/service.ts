import * as grpc from 'grpc';
import * as jsonwebtoken from 'jsonwebtoken';
import { promisify } from 'util';

import {
  AuthenticateRequest,
  AuthenticateResponse,
  HasAccessRequest,
  HasAccessResponse,
  SecurityServiceHandlers,
} from '../grpc/types';
import { CallTracer, Response, Logger, Call, Callback, loadMessageDefinition } from '../../../../shared';

interface ServiceDependencies {
  service: {
    protoPath: string;
    uri: string;
  };
  tokenService: typeof jsonwebtoken;
  salt: string;
  tracer: CallTracer;
  logger: Logger;
}

class SecurityService implements SecurityServiceHandlers {
  private server: grpc.Server;

  constructor(private dependencies: ServiceDependencies) {
    this.server = new grpc.Server();

    const messageDefinition = loadMessageDefinition(dependencies.service.protoPath);
    const proto: any = grpc.loadPackageDefinition(messageDefinition)['security'];
    const grpcHandlers = {
      authenticate: (call: Call<AuthenticateRequest>, callback: Callback<AuthenticateResponse>) => {
        this.authenticate(call.request)
          .then(res => {
            callback(null, res);
          })
          .catch(error => {
            callback(error, null);
          });
      },
      hasAccess: (call: Call<HasAccessRequest>, callback: Callback<HasAccessResponse>) => {
        this.hasAccess(call.request)
          .then(res => {
            callback(null, res);
          })
          .catch(error => {
            callback(error, null);
          });
      },
    };

    this.server.addService(proto['SecurityService'].service, grpcHandlers);

    this.server.bind(dependencies.service.uri, grpc.ServerCredentials.createInsecure());
    this.server.start();
  }

  public async authenticate(request: AuthenticateRequest): Promise<Response<AuthenticateResponse>> {
    const { salt, tokenService } = this.dependencies;
    if (request.username === 'invalid') {
      throw new Error('invalid username');
    }

    return new Promise((resolve, reject) =>
      tokenService.sign(request.username, salt, (err, accessToken) => (err ? reject() : resolve({ accessToken })))
    );
  }

  public hasAccess({ accessToken, resourceId }: HasAccessRequest): Promise<Response<HasAccessResponse>> {
    const { salt, tokenService } = this.dependencies;

    if (resourceId === 'security/authenticate') {
      return Promise.resolve({ hasAccess: true });
    }

    return new Promise(resolve =>
      tokenService.verify(accessToken as string, salt, err => {
        resolve({ hasAccess: !err });
      })
    );
  }
}

export { SecurityService };
