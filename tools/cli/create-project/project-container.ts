import { ProjectFile } from '.'
import { join } from 'path'
import { upperFirst, camelCase } from 'lodash'

const createContent = (projectName: string): string => {
  const config = `${upperFirst(camelCase(projectName))}Config`

  return `
  import * as awilix from 'awilix'
  import { AwilixContainer, ContainerOptions } from 'awilix'
  import { ConfigLoader, configLoader, createBaseContainer } from '../../../shared';
  
  import { ${config} } from './app/config'
  import { validateConfig } from './app/config.validation'

  export default async function createContainer(options?: ContainerOptions): Promise<AwilixContainer> {
    const loadConfig: ConfigLoader = configLoader({})
    const config: ${config} = loadConfig()
    validateConfig(config)

    const container: AwilixContainer = createBaseContainer({ appName: config.appName, ...config.tracing }, options)

    /*container.register({
      service: awilix.asValue({
        protoPath: getProtoPath('name-of-the-service-in-manifest'),
        uri: config.serverUri,
      }),
      server: awilix.asClass(SomeSErvice),
    })*/

    return container
}

  `
}

export const projectContainer = (baseDir: string, projectName: string): ProjectFile => {
  return {
    path: join(baseDir, 'src', 'container.ts'),
    content: createContent(projectName),
  }
}
