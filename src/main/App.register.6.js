//// OomHub //// 1.0.2 //// January 2018 //// http://oom-hub.loop.coop/ ////////

!function (ROOT) { 'use strict'

const META = {
    NAME:    { value:'register' }
  , REMARKS: { value:'Modules register as a service on the event hub' }
}


//// Define `OomHub`, this module’s main entry point.
const method = ROOT.OOM.OomHub.prototype.register = function (abc) {
    return abc + ' ok!'
}//register()


//// Add static constants to the `register()` method.
Object.defineProperties(method, META)




}( 'object' === typeof global ? global : this ) // `window` in a browser
