import { copySync } from 'fs-extra';
import { dirname, join } from 'path';
import * as manifest from '../manifest.json';
import { getProtoPath, ServicesManifest, ServiceType } from '../services-config';

const servicesManifest = <ServicesManifest>manifest;

const build = () => {
  const buildDir = join(process.cwd(), 'build');

  Object.entries(servicesManifest).forEach(serviceEntry => {
    if (serviceEntry[1].proto) {
      copySync(dirname(getProtoPath(<ServiceType>serviceEntry[0])), join(buildDir, dirname(serviceEntry[1].proto)));
    }
  });

  copySync(join(process.cwd(), 'manifest.json'), join(buildDir, 'manifest.json'));
};

build();
