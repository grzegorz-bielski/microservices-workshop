import {join} from 'path'

type ServicesManifest = {
  [key: string]: {
    proto: string;
  };
};

export const loadManifest = (manifestPath?: string) => {
  const manifestFullPath = manifestPath || join(process.cwd(), 'manifest.json');
  const manifest = require(manifestFullPath);

  const servicesManifest = <ServicesManifest>manifest;

  return servicesManifest
}