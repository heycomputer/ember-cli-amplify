import awsmobile from '../aws-exports'

export function initialize(appInstance) {
  let service = appInstance.lookup('service:amplify')
  service.configure(awsmobile || {})
}

export default {
  initialize
}
