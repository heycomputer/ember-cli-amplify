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

  afterInstall(options) {
    // Add addons to package.json and run defaultBlueprint
    return this.addAddonsToProject({
      // a packages array defines the addons to install
      packages: [
        // name is the addon name, and target (optional) is the version
        {
          name: webpackImporterAddonName,
          target: 'latest'
        },
      ]
    }).then(() => {
      // Add npm packages to package.json
      return this.addPackagesToProject([{
        name: amplifyModuleName,
        target: 'latest'
      }])
    }).then(() => {
      // Add webpack import to ember-cli-build.js
      return this.addWebpackImportToApp(amplifyModuleName)
    }).then(() => {
      var blueprint = Blueprint.lookup('instance-initializer', {
        paths: [path.resolve(__dirname, '..')]
      })
      options['entity'] = {
        name: 'amplify-initializer'
      }
      return blueprint.install(options)
    })
  }
}
