/* eslint-env node */

'use strict';

const path = require('path');
const existsSync = require('exists-sync');
const chalk = require('chalk');
const EOL = require('os').EOL;
const BuildConfigEditor = require('ember-cli-build-config-editor');

const addonName = 'ember-aws-amplify'
const amplifyModuleName = 'aws-amplify'
const webpackImporterAddonName = 'ember-cli-webpack-imports'
const webpackImporterConfigKey = webpackImporterAddonName

module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  addWebpackImportToApp: function(webpackModuleName) {
    const file = 'ember-cli-build.js';
    if (existsSync(file)) {
      let source = fs.readFileSync(file, 'utf-8');
      let build = new BuildConfigEditor(source);
      let config = build.retrieve(webpackImporterConfigKey);
      if(!config) {
        config = { expose: [] }
      } else if(!Array.isArray(config.expose)) {
        config.expose = []
      } else if(config.expose.includes(webpackModuleName)) {
        this.ui.writeLine(chalk.yellow(`${webpackModuleName} already exists in ${configKey} configuration. skipping...`));
        return
      }
      config.expose.push(webpackModuleName)
      try {
        const code = build.edit(webpackImporterConfigKey, config).code()
        fs.writeFileSync(file, code);
        this.ui.writeLine(chalk.green(`Added ${webpackModuleName} webpack import configuration to ${file}`));
      } catch (e) {
        let manualConfig = {}
        manualConfig[webpackImporterConfigKey] = { exports: [webpackModuleName] }
        this.ui.writeLine(chalk.red(`${file} could not be edited.`));
        this.ui.writeLine(chalk.yellow(`Please update the ${file} Ember app configuration to include:`));
        this.ui.writeLine('let app = new EmberApp(defaults, {');
        this.ui.writeLine(chalk.orange(JSON.stringify(manualConfig, null, '  ')));
        this.ui.writeLine('  });');
      }
    } else {
      this.ui.writeLine(chalk.red(`Ember CLI file ${file} is not present.`))
      this.ui.writeLine(chalk.red(`${addonName} requires Ember CLI`))
    }
  },

  afterInstall() {
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
      }]);
    }).then(() => {
      // Add webpack import to ember-cli-build.js
      return this.addWebpackImportToApp(amplifyModuleName)
    })
  }
};
