import { resolve } from 'path';
import {
  FileDescriptor,
  ProtoPackage,
  ProtoService,
  MappedProtoType,
  ProtoTypeField,
  ProtoType,
  ProtoMethodTuple,
} from './types';
import { lowerCase } from 'lodash'

const getTypes = (servicePackage: ProtoPackage, serviceName: string): MappedProtoType[] => {
  const typeKeys = Object.keys(servicePackage).filter(key => key !== serviceName);

  return typeKeys.map(typeKey => ({
    name: typeKey,
    ...(<ProtoType>servicePackage[typeKey]),
  }));
};

const protoTypeToJSType = (protoTypeField: ProtoTypeField): string => {
  const getType = (type: string | ProtoTypeField): string | ProtoTypeField => {
    switch (type) {
      case 'int32':
      case 'uint32':
      case 'int64':
      case 'uint64':
        return 'number';
      case 'string':
        return 'string';
      case 'bool':
        return 'boolean';
      default:
        return type;
    }
  };

  if (protoTypeField.rule && protoTypeField.rule === 'repeated') {
    const repeatedType: ProtoTypeField = <ProtoTypeField>getType(protoTypeField);
    return `${repeatedType.type}[]`;
  }

  return `${getType(protoTypeField.type)}`;
};

const getServiceTypes = (service: ProtoService, serviceName: string) => {
  const handlers = Object.entries(service.methods).map((method: ProtoMethodTuple) => {
    return `${method[0]}: (request: ${method[1].requestType}) => Promise<${method[1].responseType}>`;
  });

  return `
  export interface ${serviceName}Client { 
    ${handlers.join('\n')}
  }`;
};

const toTsTypes = (type: MappedProtoType) => {
  if (type.values) {
    const values = Object.keys(type.values).map(key => `${key} = "${key}",`);

    return `export enum ${type.name} {
      ${values.join('\n')}
    }\n`;
  }

  if (type.fields) {
    const properties: string[] = Object.entries(type.fields).map(
      (mappedField: [string, ProtoTypeField]) =>
        `${mappedField[0]}${
          mappedField[1].options && 'optional' in mappedField[1].options ? '?' : ''
        }: ${protoTypeToJSType(mappedField[1])}`
    )

    return `export type ${type.name} = {
      ${properties.join('\n')}
    };\n`
  }

  return `export type ${type.name} = null\n`;
};

const addContent = (source: string): string => {
  return `
  /*****************************************/
  /*         THIS FILE WAS GENERATED       */
  /*              DO NOT TOUCH             */
  /*****************************************/

  ${source}
  `;
};

export function generateInterface(
  baseName: string,
  servicePackage: ProtoPackage,
  service: ProtoService,
  serviceName: string,
  outDir?: string
): FileDescriptor {
  const types = getTypes(servicePackage, serviceName);
  const providedOrDefaultOutputDirectory = outDir || resolve(process.cwd(), 'types');

  return {
    filename: `${lowerCase(baseName)}.ts`,
    outDir: providedOrDefaultOutputDirectory,
    content: addContent([...types.map(toTsTypes), getServiceTypes(service, baseName)].join('\n')),
  };
}
