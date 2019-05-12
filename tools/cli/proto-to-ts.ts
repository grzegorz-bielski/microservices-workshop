import * as protobuf from 'protobufjs';
import { resolveConfig, format } from 'prettier';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { upperFirst } from 'lodash';
import { generateService } from './proto-to-ts/to-service';
import { generateClient } from './proto-to-ts/to-client';
import { generateTypes } from './proto-to-ts/to-types';
import { generateInterface } from './proto-to-ts/to-interface';
import { ProtoService, ProtoPackage, FileDescriptor } from './proto-to-ts/types';
import { keyInYN } from 'readline-sync';
import { loadManifest } from './load-manifest';

export interface ProtoToTsArguments {
  packageName: string;
  manifestPath: string;
  generatorType: string;
  outDir?: string;
  protoPath?: string;
}

export const protoToTs = (args: ProtoToTsArguments) => {
  const { packageName, manifestPath, generatorType, outDir, protoPath } = args;

  const servicesManifest = loadManifest(manifestPath)

  const getProtoPath = (protoPackage: string): string => resolve(process.cwd(), servicesManifest[protoPackage].proto);

  const convertToObj = (rootNode: any): any => JSON.parse(JSON.stringify(rootNode));

  const getPackage = (rootNode: any, grpcPackageName: string) => {
    const rootNodeObj = convertToObj(rootNode).nested;

    return rootNodeObj[grpcPackageName].nested;
  };

  protobuf
    .load(getProtoPath(packageName))
    .then(async (root: any) => {
      const protoPackage: ProtoPackage = getPackage(root, packageName);
      const baseName = upperFirst(packageName);
      const serviceName = `${baseName}Service`;
      const service: ProtoService = <ProtoService>protoPackage[serviceName];

      switch (generatorType) {
        case 'interface':
          return [
            generateInterface(baseName, protoPackage, service, serviceName, outDir)
          ]
        case 'client':
          return [
            generateTypes(packageName, protoPackage, service, serviceName, outDir),
            generateClient(packageName, service, baseName, outDir, protoPath),
          ];
        case 'service':
          const generatedService = generateService(packageName, service, baseName, outDir);

          if (existsSync(generatedService.outDir)) {
            // tslint:disable-next-line
            console.log('WARNING!!! Service already exists. If you continue all of your current work will be lost.');
            if (!keyInYN('Do you want to continue?')) {
              process.exit(1);
            }
          }

          return [generatedService];
        default:
          throw new Error(`Unsupported option: ${generatorType}`);
      }
    })
    .then((sources: FileDescriptor[]) =>
      resolveConfig(process.cwd()).then(options =>
        sources.map(source => ({
          outDir: source.outDir,
          filename: source.filename,
          content: format(source.content, { ...options, parser: 'typescript' }),
        }))
      )
    )
    .then((sources: FileDescriptor[]) => {
      sources.forEach(source => {
        if (!existsSync(source.outDir)) {
          mkdirSync(source.outDir, { recursive: true });
        }

        writeFileSync(resolve(source.outDir, source.filename), source.content);
      });
    })
    .catch(err => {
      // tslint:disable-next-line
      console.error(err);
    });
};
