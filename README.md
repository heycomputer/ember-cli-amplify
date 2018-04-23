ember-aws-amplify
==============================================================================

Adds AWS Amplify to your Ember CLI project.

Installation
------------------------------------------------------------------------------

```
ember install ember-aws-amplify
```

On installation the addon will automatically perform the following actions:

1. Add aws-amplify to devDependencies in package.json
2. Add ember-cli-webpack-imports to devDependencies in package.json
3. Add aws-amplify to an ember-cli-webpack-imports configuration in the
   EmberApp options found in ember-cli-build.js

Because aws-amplify is a webpack module the ember-cli-webpack-exports addon
is used to add aws-amplify to the build.

Usage
------------------------------------------------------------------------------

TODO...

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-aws-amplify`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
