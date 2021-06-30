import VueRegion from './vue-region'
import pkg from '../package.json'

function install(app) {
  app.component(VueRegion.name, VueRegion)
}

VueRegion.install = install
VueRegion.version = pkg.version

export { install, VueRegion }
export default VueRegion
