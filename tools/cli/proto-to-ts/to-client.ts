import { resolve, join } from 'path';
import { kebabCase, flatten } from 'lodash';
import { FileDescriptor, ProtoService, ProtoMethodTuple } from './types';

const template = (
  baseName: string,
  packageName: string,
  types: string,
  methods: string,
  protoPath?: string
): string => {
  const providedOrDefaultProtoPath = protoPath || `../../proto/${kebabCase(packageName)}-service.proto`;

  return `
    /*****************************************/
    /*        THIS FILE WAS GENERATED        */
    /*              DO NOT TOUCH             */
    /*****************************************/

    import { Observable } from 'rxjs'
    import * as grpc from 'grpc'
    import { resolve } from 'path'
    import { 
      Logger,
      loadMessageDefinition,
      toPromise,
      toObservable
    } from '../../../../../shared'
    ${types}

    type ClientDependencies = {
      uri: string,
      logger: Logger
    }

    class ${baseName}Client {
      
      private client: any

      constructor(private dependencies: ClientDependencies) {
        const messageDefinition = loadMessageDefinition(resolve(__dirname, '${providedOrDefaultProtoPath}'))
        const proto: any = grpc.loadPackageDefinition(messageDefinition).${packageName}
        this.client = new proto.${baseName}Service(dependencies.uri, grpc.credentials.createInsecure())
      }

      ${methods}
    }

    export { ${baseName}Client }
    `;
};

const getServiceTypes = (service: ProtoService) => {
  const types: string[] = flatten(
    Object.entries(service.methods).map((method: ProtoMethodTuple) => {
      return [method[1].requestType, method[1].responseType];
    })
  ).filter((type, index, array) => array.indexOf(type) === index);

  return `import {
    ${types.join(',\n')}
  } from '../types'`;
};

const getServiceMethods = (baseName: string, service: ProtoService) => {
  const methods = Object.entries(service.methods).map((method: ProtoMethodTuple) => {
    if (method[1].responseStream) {
      return `public ${method[0]}(request: ${method[1].requestType}): Promise<Observable<${method[1].responseType}>> {
        this.dependencies.logger.info(\`\${JSON.stringify({ service: "${baseName}", method: "${
        method[0]
      }", request })}\`)
        return toObservable<${method[1].requestType}, ${method[1].responseType}>(this.client, '${method[0]}')(request)
      }`;
    }

    return `public ${method[0]}(request: ${method[1].requestType}): Promise<${method[1].responseType}> {
      this.dependencies.logger.info(\`\${JSON.stringify({ service: "${baseName}", method: "${method[0]}", request })}\`)
      return toPromise<${method[1].requestType}, ${method[1].responseType}>(this.client, '${method[0]}')(request)
    }`;
  });

  return methods.join('\n\n');
};

export function generateClient(
  packageName: string,
  service: ProtoService,
  baseName: string,
  outDir?: string,
  protoPath?: string
): FileDescriptor {
  const providedOrDefaultOutputDirectory =
    (outDir && join(outDir, 'client')) ||
    resolve(process.cwd(), 'services', `${kebabCase(packageName)}`, 'src', 'grpc', 'client');

  return {
    filename: 'index.ts',
    outDir: providedOrDefaultOutputDirectory,
    content: template(baseName, packageName, getServiceTypes(service), getServiceMethods(baseName, service), protoPath),
  };
}
