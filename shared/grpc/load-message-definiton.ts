import { loadSync } from '@grpc/proto-loader';
import { PackageDefinition } from 'grpc';

export const loadMessageDefinition = (path: string): PackageDefinition => {
  return loadSync(path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
};
