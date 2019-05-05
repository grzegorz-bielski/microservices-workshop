import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { kebabCase } from 'lodash';
import { resolveConfig, format } from 'prettier';
import { config, configValidator } from './create-project/config';
import { projectIndex } from './create-project/project-index';
import { projectContainer } from './create-project/project-container';

export type ProjectFile = {
  path: string;
  content: string;
};

export interface CreateProjectArguments {
  outDir?: string;
  projectName: string;
}

export const createProject = (args: CreateProjectArguments) => {
  const { outDir, projectName } = args;
  const outputDir: string = join(outDir || process.cwd(), 'services', kebabCase(`${projectName}`));
  const manifestPath = join(process.cwd(), 'manifest.json');
  const servicesConfigPath = join(process.cwd(), 'services-config.ts');
  const manifest = JSON.parse(readFileSync(manifestPath).toString());
  const servicesConfig = readFileSync(servicesConfigPath).toString();

  manifest[projectName] = {
    proto: `services/${kebabCase(projectName)}/src/proto/${kebabCase(projectName)}-service.proto`,
    client: `services/${kebabCase(projectName)}/src/grpc/client`,
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  const updatedServicesConfig = servicesConfig.replace(
    ';\n// service-types-ends-here',
    `\n  | '${projectName}';\n// service-types-ends-here`
  )
  writeFileSync(servicesConfigPath, updatedServicesConfig);

  const directoriesToCreate: string[] = [
    `${join(outputDir, 'src', 'app')}`,
    `${join(outputDir, 'src', 'grpc')}`,
    `${join(outputDir, 'src', 'proto')}`,
    `${join(outputDir, 'src', 'service')}`,
  ];

  const filesToCreate: ProjectFile[] = [
    config(outputDir, projectName),
    configValidator(outputDir, projectName),
    projectIndex(outputDir),
    projectContainer(outputDir, projectName),
  ];

  directoriesToCreate.forEach(directory => {
    try {
      mkdirSync(directory, {
        recursive: true,
      });
    } catch (err) {
      // tslint:disable-next-line
      console.log(err);
    }
  });

  resolveConfig(process.cwd()).then(options =>
    filesToCreate.forEach(file => {
      writeFileSync(file.path, format(file.content, { ...options, parser: 'typescript' }));
    })
  );
};
