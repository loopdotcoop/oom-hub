//// ECMASwitch //// 1.0.6 //// January 2018 //// ecmaswitch.loop.coop/ ////////

!function (ROOT) { 'use strict'

//// Create the namespace-object if it does not already exist and add constants.
var ECMASwitch = ROOT.ECMASwitch = ROOT.ECMASwitch || {}
ECMASwitch.NAME     = 'ECMASwitch'
ECMASwitch.VERSION  = '1.0.6'
ECMASwitch.HOMEPAGE = 'http://ecmaswitch.loop.coop/'

//// Polyfill `document` for non-browser contexts.
var d = ROOT.document || {
    cookie: '~0~'
  , write:  function (x) {} // @TODO Node.js translate`<script>` to `require()`
}




//// BEGIN DYNAMIC SECTION /////////////////////////////////////////////////////
//// This dynamic section is kept up to date by ‘oomtility/make.js’ ////////////

var projectLC = 'oom-hub'
var classFiles = 'App'

//// END DYNAMIC SECTION ///////////////////////////////////////////////////////




//// PUBLIC API

////
ECMASwitch.load = function (path, names) {
    if (! path) throw Error("ECMASwitch.load(): Set `path`, eg './' or '../'")
    var f = ~~d.cookie.split('~')[1] // script format, 0 - 3
      , p = path + ( (3 == f) ? 'src/' : 'dist/' ) // get path to proper format
      , s = // src values
          (1 == f) ? [ // ES5 Minified
              path + 'support/asset/js/traceur-runtime.min.js'
            , p + 'main/' + projectLC + '.5.min.js'
          ]
        : (2 == f) ? [ // ES6 Production
              p + 'main/' + projectLC + '.6.js'
          ]
        : (3 == f) ?   // ES6 Development
              (p+'main/'+classFiles.replace(/,/g,'.6.js|'+p+'main/')+'.6.js')
             .split('|')
        : [            // ES5 Production (the default, if no cookie’s been set)
              path + 'support/asset/js/traceur-runtime.min.js'
            , p + 'main/' + projectLC + '.5.js'
          ]
      , B = '<script src="'  // begin
      , E = '"></'+'script>' // end
    names = names || []
    for (var i=0; i<names.length; i++) if (names[i][f]) s.push( names[i][f] )
    s.unshift(path + 'support/asset/js/polyfill.min.js') //@TODO only load for legacy browsers
    s.unshift(path + 'support/asset/js/jquery-3.2.1.slim.min.js') // load first
    d.write(B + s.join(E + B) + E)
}


}( 'object' === typeof global ? global : this ) // `window` in a browser
