# ember-cli-amplify

Adds AWS Amplify to your Ember CLI project.
This Ember addon is neither created nor endorsed by Amazon!
> AWS Amplify connects to AWS Mobile Hub to work with Amazon Web Services. AWS Mobile Hub gives you a single place to easily configure AWS service and automatically provisions the AWS services required for the features in your app. ~ [AWS Amplify Documentation](https://aws.github.io/aws-amplify/media/install_n_config)


## Prerequisites

1. An AWS Account
2. NodeJS
3. Ember CLI
  ```bash
  npm install -g ember-cli

  # create a new project if you don't already have one
  ember new <app-name>
  cd <app-name>
  ```
4. AWS Amplify CLI
  ```bash
  npm install -g @aws-amplify/cli

  # configure the CLI with your AWS credentials
  amplify configure
  ```
See [here](https://github.com/aws-amplify/amplify-cli) for more details about configuration

## Installation

```
ember install ember-cli-amplify
```

On installation the addon will request confirmation to perform the following actions:

1. Add aws-amplify to devDependencies in package.json
2. Add ember-cli-webpack-imports to devDependencies in package.json
3. Add aws-amplify to an ember-cli-webpack-imports configuration in the EmberApp options found in ember-cli-build.js
4. Generate instance initializer amplify-initializer.js to configure the Amplify service

Because aws-amplify is a webpack module the ember-cli-webpack-exports addon is used to add aws-amplify to the build.

## Post-Installation Configuration

### Amplify Setup

From within the root of your application:

```
$ amplify init
```

Change the default options to:

```
Source code directory: app
      Build directory: dist
        Build command: ember b
        Start command: ember s
```

This will generate the aws-exports.js file, placing it in your app/ directory.

> Please note that backend resources that are created with awsmobile init are copied to amplify/#current-cloud-backend project folder. When you change your backend configuration and run amplify pull, the contents of the folder will be updated automatically, and a new copy of the configuration file (app/aws-exports.js) will be re-generated to app/aws-exports.js folder ~ [AWS Amplify Quickstart](https://aws.github.io/aws-amplify/media/quick_start)

### Amplify Feature Configuration

Enable the Amplify features you wish to use and push the configuration to AWS Mobile.

```
$ amplify add <category>
$ awsmobile push
```

Enable hosting and Publish your site to S3/CloudFront:

```
$ amplify add hosting
$ amplify publish
```

This will refresh your `app/aws-exports.js` file.

## Usage

Accessing each Amplify category in your Ember app is
as simple as injecting the Amplify service into your code, for example:

```js
import Component from '@ember/component';
import { inject as service } from '@ember/service';
export default Component.extend({
  amplify:service(),
  actions: {
  signIn() {
    const auth = this.get('amplify').Auth;
    const username  = this.get('username');
    const password  = this.get('password');
    auth.signIn(username, password)
  }
});
```
Want to know how to use the Amplify category objects? Check out these links:
#### [Amplify Category Guides](https://aws.github.io/aws-amplify/media/developer_guide)
#### [Amplify API Docs](https://aws.github.io/aws-amplify/api/)

## References

- [Adding AWS Amplify to an Ember.js Application](https://itnext.io/adding-aws-amplify-to-an-ember-js-application-72683167c476)
- [AWS Amplify Quickstart](https://aws.github.io/aws-amplify/media/quick_start)
- [AST Rewriting Using recast and esprima](https://www.slideshare.net/srvance/ast-rewriting-using-recast-and-esprima)

## Contributing

### Installation

- `git clone <repository-url>`
- `cd ember-cli-amplify`
- `npm install`

### Linting

- `npm run lint:js`
- `npm run lint:js -- --fix`

### Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

- `ember serve`
- Visit the dummy application at <http://localhost:4200>.

For more information on using ember-cli, visit <https://ember-cli.com/>.

## License

This project is licensed under the [MIT License](LICENSE.md).
