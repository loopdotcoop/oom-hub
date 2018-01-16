//\\//\\ src/main/App.6.js



//// OomHub //// 1.0.0 //// January 2018 //// http://oom-hub.loop.coop/ ////////

!function (ROOT) { 'use strict'

const META = {
    NAME:     { value:'OomHub' }
  , VERSION:  { value:'1.0.0' }
  , HOMEPAGE: { value:'http://oom-hub.loop.coop/' }
  , REMARKS:  { value:'Initial test of the oom-hub architecture' }
}


//// Make this module and Oom’s toolkit available globally.
const OOM     = ROOT.OOM    = ROOT.OOM    || {}
const TOOLKIT = OOM.TOOLKIT = OOM.TOOLKIT || {}


//// Define `OomHub`, this module’s main entry point.
const OomHub = OOM.OomHub = class {

    constructor (config={}, hub=OOM.hub) {

        //// id: Oom instances have universally unique IDs (57 billion combos).
        Object.defineProperty(this, 'id', { value:
            '123456'.replace( /./g,         c=>rndCh(48,122) )    // 6 x [0-z]
                    .replace( /[:-@\[-`]/g, c=>rndCh(97,122) ) }) // 6 x [a-z]

        //// hub: Oom instances keep a reference to the oom-hub.
        Object.defineProperty(this, 'hub', { value:hub })

        //// Validate the configuration object.
        this._validateConstructor(config)

        //// Record config’s values as immutable properties.
        this.validConstructor.forEach( valid => {
            const value = config[valid.name]
            if (null == value) throw Error('I am unreachable?') //@TODO remove
            Object.defineProperty(this, valid.name, { value })
        })

        //// ready: a Promise which resolves when the instance has initialised.
        Object.defineProperty(this, 'ready', { value: this._getReady() })
    }


    //// Returns a Promise which is recorded as the `ready` property, after
    //// the constructor() has validated `config` and recorded the config
    //// properties. Sub-classes can override _getReady() if they need to do
    //// other async preparation.
    //// Called by: constructor()
    _getReady () {

        //// setupStart: the time that `new OomHub({...})` was called.
        if (this.setupStart)
            throw new Error(`OomHub:_getReady(): Can only run once`)
        Object.defineProperty(this, 'setupStart', { value:TOOLKIT.getNow() })

        //// `OomHub` does no setup, so could resolve the `ready`
        //// Promise immediately. However, to make _getReady()’s behavior
        //// consistent with classes which have a slow async setup, we introduce
        //// a miniscule delay.
        return new Promise( (resolve, reject) => { setTimeout( () => {

            //// setupEnd: the time that `_getReady()` finished running.
            Object.defineProperty(this, 'setupEnd', { value:TOOLKIT.getNow() })

            //// Define the instance’s `ready` property.
            resolve({
                setupDelay: this.setupEnd - this.setupStart
            })
        }, 0)})

    }


    //// Ensures that the `config` argument passed to the `constructor()` is
    //// valid.
    //// Called by: constructor()
    _validateConstructor (config) {
        const pfx = `OomHub:_validateConstructor(): ` // error prefix
        if ('object' !== typeof config)
            throw new Error(pfx+`config is type ${typeof config} not object`)
        this.validConstructor.forEach( valid => {
            if (! TOOLKIT.applyDefault(valid, config) )
                throw new TypeError(pfx+`config.${valid.name} is mandatory`)
            let err, value = config[valid.name]
            if ( err = TOOLKIT.validateType(valid, value) )
                throw new TypeError(pfx+`config.${valid.name} ${err}`)
            if ( err = TOOLKIT.validateRange(valid, value) )
                throw new RangeError(pfx+`config.${valid.name} ${err}`)
        })
    }


    //// Defines what the `config` argument passed to the `constructor()`
    //// should look like. Note that all of the `config` values are recorded
    //// as immutable instance properties.
    //// Called by: constructor()
    //// Called by: constructor() > _validateConstructor()
    //// Can also be used to auto-generate unit tests and auto-build GUIs.
    get validConstructor () { return [
        {
            title:   'First Parameter'
          , name:    'firstParameter'
          , alias:   'fp'

          , tooltip: 'An example numeric parameter, intended as a placeholder'
          , devtip:  'You should replace this placeholder with a real parameter'
          , form:    'range'
          , power:   1 // eg `8` for an exponential range-slider
          , suffix:  'Units'

          , type:    'number'
          , min:     1
          , max:     100
          , step:    1
          , default: 50
        }
      , {
            title:   'Second Parameter'
          , name:    'secondParameter'
          , alias:   'sp'

          , tooltip: 'An example object parameter, intended as a placeholder'
          , devtip:  'You should replace this placeholder with a real parameter'
          , form:    'hidden'

          , type:    (ROOT.AudioContext||ROOT.webkitAudioContext)
        }
    ]}

    xxx (config) {
        const { hub, a, b, c } = this
        const { xx, yy, zz } = config

        ////

    }

}//OomHub


//// Add static constants to the `OomHub` class.
Object.defineProperties(OomHub, META)




//// TOOLKIT FUNCTIONS

TOOLKIT.applyDefault = TOOLKIT.applyDefault || ( (valid, config) => {
    if ( config.hasOwnProperty(valid.name) )
        return true // `true` here signifies default didn’t need to be applied
    if (! valid.hasOwnProperty('default') )
        return false // `false` signifies a missing mandatory field
    config[valid.name] = 'function' === typeof valid.default
      ? valid.default(config) // a value can depend on another config value
      : valid.default
    return true // `true` here signifies default was successfully applied
})

TOOLKIT.validateType = TOOLKIT.validateType || ( (valid, value) => {
    if ('string' === typeof valid.type && typeof value !== valid.type)
        return `is type ${typeof value} not ${valid.type}`
    if ('function' === typeof valid.type && ! (value instanceof valid.type))
        return `is not an instance of ${valid.type.name}`
})

TOOLKIT.validateRange = TOOLKIT.validateRange || ( (valid, value) => {
    if (null != valid.min && valid.min > value)
        return `is less than the minimum ${valid.min}`
    if (null != valid.max && valid.max < value)
        return `is greater than the maximum ${valid.max}`
    if (null != valid.step && ((value/valid.step) % 1))
        return `${value} ÷ ${valid.step} leaves ${(value/valid.step) % 1}`
})

//// Cross-platform millisecond-timer.
TOOLKIT.getNow = TOOLKIT.getNow || ( () => {
    let now
    if ( // Node.js
        'object'   === typeof ROOT.process
     && 'function' === typeof ROOT.process.hrtime) {
        const hrtime = ROOT.process.hrtime()
        now = ( (hrtime[0] * 1e9) + hrtime[1] ) / 1e6 // in milliseconds
    } else { // modern browser @TODO legacy browser
        now = ROOT.performance.now()
    }
    return now
})




//// PRIVATE FUNCTIONS

//// No operation.
function noop () {}

//// Return a random character within char-code start/end positions 's' and 'e'.
function rndCh (s, e) { return String.fromCharCode(Math.random() * (e-s) + s) }




}( 'object' === typeof global ? global : this ) // `window` in a browser





//\\//\\ built by Oomtility Make 1.0.6 //\\//\\ http://oomtility.loop.coop //\\//\\
