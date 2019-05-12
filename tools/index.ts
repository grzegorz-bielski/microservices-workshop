import { createProject } from './cli/create-project';
import { protoToTs } from './cli/proto-to-ts';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import * as program from 'commander';
import { loadManifest } from './cli/load-manifest';

program.version('1.6.0');

program
  .command('create-project')
  .description('Creates new project structure')
  .option('-pn, --project-name [projectName], Name of project')
  .option('-od, --out-dir [outDir]', 'Directory where project should be created')
  .action(options => {
    handleCreateProjectOption(options);
  });

  program
    .command('interfaces')
    .description('Generates client interfaces')
    .option('-od, --out-dir [outDir]', 'Directory where types should be created')
    .action(options => {
      handleGenerateInterfacesOption(options);
    });

program
  .command('from-proto')
  .description('Creates types and client or service placeholder based on proto')
  .option('-p, --package [package], Name of package from manifest')
  .option('-g, --generator-type [generatorType]', 'One of "client" or "service". Defines result type.')
  .option('-m, --manifest-path [manifestPath]', '<optional> Defines path to manifest.json')
  .option('-od, --out-dir [outDir]', '<optional> Defines where files will be generated')
  .option(
    '-pp, --proto-path [protoPath]',
    '<optional> Must be provided when "out-dir" provided and "generator-type" set to "client". Path to source proto file, relative to client directory.'
  )
  .action(options => {
    handleFromProtoOption(options);
  });

const handleMissingOrIncorrectParameters = (errorMessage: string) => {
  // tslint:disable-next-line
  console.info(chalk.red(errorMessage));

  process.exit(1);
};

const handleCreateProjectOption = (options: { projectName?: string; outDir?: string }) => {
  if (!options.projectName) {
    handleMissingOrIncorrectParameters('Please provide project name, eg. --project-name=mailer');
  } else {
    createProject({ outDir: options.outDir, projectName: options.projectName });
  }
};

const handleFromProtoOption = (options: {
  package: string;
  generatorType: string;
  manifestPath?: string;
  outDir?: string;
  protoPath?: string;
}) => {
  const protoPath = options.protoPath;
  const generatorType = options.generatorType;
  const manifestPath = options.manifestPath;
  const packageName = options.package;
  const outDir = options.outDir;

  if (!packageName) {
    handleMissingOrIncorrectParameters('Please provide package name, eg. --package=mailer');
  }

  if (!generatorType) {
    handleMissingOrIncorrectParameters('Please provide generator type, eg. --generator-type=client');
  }

  if (outDir && !protoPath) {
    handleMissingOrIncorrectParameters('`proto-path` must be provided when `out-dir` is defined');
  }

  protoToTs({
    outDir,
    packageName,
    manifestPath: manifestPath || join(process.cwd(), 'manifest.json'),
    generatorType,
    protoPath,
  });
};

const handleGenerateInterfacesOption = (options: {
  manifestPath?: string;
  outDir?: string;
}) => {
  const manifestPath = options.manifestPath;
  const outDir = options.outDir;

  const manifest = loadManifest(manifestPath)

  for (const service in manifest) {
    protoToTs({
      outDir,
      packageName: service,
      manifestPath: manifestPath || join(process.cwd(), 'manifest.json'),
      generatorType: 'interface'
    });
  }
};

program.parse(process.argv);
