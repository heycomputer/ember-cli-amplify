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
import awsmobile from '../aws-exports'

Amplify.configure(awsmobile)

export default Service.extend({
  Amplify,
  Auth,
  I18n,
  Analytics,
  API,
  Storage,
  Cache,
  PubSub,
  Logger
})
