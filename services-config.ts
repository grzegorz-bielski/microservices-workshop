import * as manifest from './manifest.json';
import { resolve } from 'path';
import { Logger } from './shared';
import { upperFirst } from 'lodash';

type ServiceType = 'messaging';
// service-types-ends-here

export type ServicesManifest = {
  [key: string]: {
    proto: string;
    client: string;
  };
};

const servicesManifest: any = <any>manifest;

function getProtoPath(service: ServiceType): string {
  if (!servicesManifest[service]) {
    throw new Error(`Service - ${service} is not configured`);
  }

  return resolve(servicesManifest[service].proto);
}

function getClientPath(service: ServiceType): string {
  if (!servicesManifest[service]) {
    throw new Error(`Service - ${service} is not configured`);
  }

  return resolve(servicesManifest[service].client);
}

function getClient(service: ServiceType, uri: string, logger: Logger): Promise<any> {
  return import(getClientPath(service)).then(
    clientClass =>
      new clientClass[`${upperFirst(service)}Client`]({
        uri,
        logger,
      })
  );
}

export { getProtoPath, getClientPath, getClient, ServiceType };
