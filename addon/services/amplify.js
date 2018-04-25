import Service from '@ember/service'
import Amplify, {
  Auth,
  I18n,
  Analytics,
  API,
  Storage,
  Cache,
  PubSub,
  Logger
} from 'aws-amplify'

export default Service.extend({
  Amplify,
  Auth,
  I18n,
  Analytics,
  API,
  Storage,
  Cache,
  PubSub,
  Logger,
  configure(config) {
    this.Amplify.configure(config)
  }
})
