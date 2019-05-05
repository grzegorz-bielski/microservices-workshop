import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { kebabCase } from 'lodash'
import { resolveConfig, format } from 'prettier'
import { config, configValidator } from './create-project/config'
import { projectIndex } from './create-project/project-index'
import { projectContainer } from './create-project/project-container'

export type ProjectFile = {
  path: string
  content: string
}

export interface CreateProjectArguments {
  outDir?: string
  projectName: string
}

export const createProject = (args: CreateProjectArguments) => {
  const { outDir, projectName } = args
  const outputDir: string = join(outDir || process.cwd(), 'services', kebabCase(`${projectName}`))

  const directoriesToCreate: string[] = [
    `${join(outputDir, 'src', 'app')}`,
    `${join(outputDir, 'src', 'grpc')}`,
    `${join(outputDir, 'src', 'proto')}`,
    `${join(outputDir, 'src', 'service')}`,
  ]

  const filesToCreate: ProjectFile[] = [
    config(outputDir, projectName),
    configValidator(outputDir, projectName),
    projectIndex(outputDir),
    projectContainer(outputDir, projectName),
  ]

  directoriesToCreate.forEach(directory => {
    try {
      mkdirSync(directory, {
        recursive: true,
      })
    } catch (err) {
      // tslint:disable-next-line
      console.log(err)
    }
  })

  resolveConfig(process.cwd()).then(options =>
    filesToCreate.forEach(file => {
      writeFileSync(file.path, format(file.content, { ...options, parser: 'typescript' }))
    })
  )
}
