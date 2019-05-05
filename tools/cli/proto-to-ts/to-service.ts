import { resolve } from 'path'
import { kebabCase } from 'lodash'
import { FileDescriptor, ProtoService, ProtoMethodTuple } from './types'

const template = (baseName: string, types: string, methods: string, methodNames: string[]): string => {
  return `
  import * as grpc from 'grpc';
${types}

interface ServiceDependencies {
  service: {
    protoPath: string;
    uri: string;
  };
  tracer: CallTracer;
  logger: Logger;
}

class ${baseName}Service implements ${baseName}ServiceHandlers {
  private server: grpc.Server;
  
  constructor(private dependencies: ServiceDependencies) {
    this.server = new grpc.Server();

    const messageDefinition = loadMessageDefinition(dependencies.service.protoPath);
    const proto: any = grpc.loadPackageDefinition(messageDefinition)['${baseName.toLocaleLowerCase()}'];
    const grpcHandlers = {};

    this.server.addService(proto['${baseName}Service'].service, grpcHandlers);

    this.server.bind(dependencies.service.uri, grpc.ServerCredentials.createInsecure());
    this.server.start();
  }

  ${methods}
}

export { ${baseName}Service }
`
}

const getServiceTypes = (service: ProtoService, baseName: string): string => {
  const types = Object.entries(service.methods).map((method: ProtoMethodTuple) => {
    return [method[1].requestType, method[1].responseType].join(',\n')
  })

  return `
  import {
    ${types.join(',\n')},
    ${baseName}ServiceHandlers,
  } from '../grpc/types'
  import {
    CallTracer, Response, Logger, loadMessageDefinition
  } from '../../../../shared'`
}

const getServiceMethods = (service: ProtoService): string => {
  const methods: string[] = Object.entries(service.methods).map((method: ProtoMethodTuple) => {
    return `public ${method[0]}(request: ${method[1].requestType}): Promise<Response<${method[1].responseType}>> {
      throw new Error('To be implemented');
    }`
  })

  return methods.join('\n\n')
}

export function generateService(
  packageName: string,
  service: ProtoService,
  baseName: string,
  outDir?: string
): FileDescriptor {
  const providedOrDefaultOutputDirectory =
    outDir || resolve(process.cwd(), 'services', `${kebabCase(packageName)}`, 'src', 'service')

  return {
    filename: 'service.ts',
    outDir: providedOrDefaultOutputDirectory,
    content: template(
      baseName,
      getServiceTypes(service, baseName),
      getServiceMethods(service),
      Object.keys(service.methods)
    ),
  }
}
