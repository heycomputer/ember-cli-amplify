/* eslint-env node */

'use strict'

const path = require('path')
const existsSync = require('exists-sync')
const fs = require('fs-extra')
const chalk = require('chalk')
const EOL = require('os').EOL
const recast = require('recast')
const camelCase = require('camelcase')
const Blueprint = require('ember-cli/lib/models/blueprint');
const addonName = 'ember-cli-amplify'
const amplifyModuleName = 'aws-amplify'
const webpackImporterAddonName = 'ember-cli-webpack-imports'
const webpackImporterConfigKey = webpackImporterAddonName
const builders = recast.types.builders

function getOptionsNode(ast) {
  var optionsNode
  recast.visit(ast, {
    visitNewExpression: function(path) {
      var node = path.node
      if (['EmberApp', 'EmberAddon'].includes(node.callee.name)) {
        optionsNode = node.arguments.find((argument) => argument.type === 'ObjectExpression')
        return false
      } else {
        this.traverse(path)
      }
    }
  })
  return optionsNode
}

function hasKey(propertyNode, key) {
  const propertyKey = propertyNode.key
  const propertyType = propertyKey.type
  return propertyType === 'Literal' && propertyKey.value == key ||
    propertyType === 'Identifier' && propertyKey.name == key
}

function getOrCreateProperty(parentNode, propertyType, propertyName, propertyValueType) {
  var siblings = parentNode.properties
  var propertyNode = siblings.find((propertyNode) => hasKey(propertyNode, propertyName))
  if (!propertyNode) {
    propertyNode = builders.property(
      'init',
      builders[camelCase(propertyType)](propertyName),
      builders[camelCase(propertyValueType)]([])
    )
    siblings.push(propertyNode)
  }
  return propertyNode
}

module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  addWebpackImportToApp: function(webpackModuleName) {
    const file = 'ember-cli-build.js'
    if (existsSync(file)) {
      try {
        this.ui.writeLine(chalk.green(`Updating ${file}...`))
        let source = fs.readFileSync(file, 'utf-8')
        let ast = recast.parse(source)
        let optionsNode = getOptionsNode(ast)
        let addonNode = getOrCreateProperty(optionsNode, 'Literal', webpackImporterConfigKey, 'ObjectExpression')
        let webpackModuleNodes = getOrCreateProperty(addonNode.value, 'Literal', 'expose', 'ArrayExpression')

        if (webpackModuleNodes.value.elements.find((el) => el.value === webpackModuleName)) {
          this.ui.writeLine(chalk.yellow(`${webpackModuleName} already included in ${webpackImporterConfigKey} configuration. skipping...`))
          return
        }

        webpackModuleNodes.value.elements.push(builders.literal(webpackModuleName))

        const code = recast.print(ast).code
        fs.writeFileSync(file, code)
        this.ui.writeLine(chalk.green(`Added ${webpackModuleName} webpack import configuration to ${file}`))
      } catch (e) {
        let manualConfig = {}
        this.ui.writeLine(e)
        manualConfig[webpackImporterConfigKey] = {
          exports: [webpackModuleName]
        }
        this.ui.writeLine(chalk.red(`${file} could not be edited.`))
        this.ui.writeLine(chalk.yellow(`Please update the EmberApp config in ${file} to include:` + EOL))
        this.ui.writeLine('let app = new EmberApp(defaults, ' + chalk.green(JSON.stringify(manualConfig, null, '  ')) + ')' + EOL)
      }
    } else {
      this.ui.writeLine(chalk.red(`Ember CLI file ${file} is not present.`))
      this.ui.writeLine(chalk.red(`${addonName} requires Ember CLI`))
    }
  },

  confirm(executor, promptMessage) {
    return this.ui.prompt({
      type: 'confirm',
      name: 'action',
      message: promptMessage
    }).then((response) => {
      if (response.action === true) {
        return executor();
      } else {
        return false;
      }
    })
  },

  addDependencyAwsAmplify() {
    return this.addPackagesToProject([{
      name: amplifyModuleName,
      target: 'latest'
    }])
  },

  addAddonWebpackImporter() {
    return this.addAddonsToProject({
      packages: [{
        name: webpackImporterAddonName,
        target: 'latest'
      }, ]
    }).then(() => true)
  },

  addInstanceInitializer(options) {
    var blueprint = Blueprint.lookup('instance-initializer', {
      paths: [path.resolve(__dirname, '..')]
    })
    options['entity'] = {
      name: 'amplify-initializer'
    }
    return blueprint.install(options)
  },

  async afterInstall(options) {

    const confirm = this.confirm.bind(this)
    const addDependencyAwsAmplify = this.addDependencyAwsAmplify.bind(this)
    const addAddonWebpackImporter = this.addAddonWebpackImporter.bind(this)
    const addWebpackImportToApp = this.addWebpackImportToApp.bind(this, amplifyModuleName)
    const addInstanceInitializer = this.addInstanceInitializer.bind(this, options)

    await confirm(addDependencyAwsAmplify,
      `Add ${amplifyModuleName} to package.json? (recommended)`)

    this.ui.writeLine(chalk.green(`${addonName} uses node module ${webpackImporterAddonName} to import ${amplifyModuleName}`))
    let usingImporter = await confirm(addAddonWebpackImporter,
      `Add ${webpackImporterAddonName} to package.json? (recommended)`)

    if (usingImporter) {
      await confirm(addWebpackImportToApp,
        `Add ${webpackImporterAddonName} configuration for ${amplifyModuleName} to ember-cli-build.js? (recommended)`)
    }

    await this.confirm(addInstanceInitializer,
      `Generate an Ember instance initializer to configure the amplify service? (recommended)`)

    this.ui.writeLine(chalk.green(`${addonName} default blueprint complete`))
  }
}
