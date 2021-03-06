!function () { 'use strict'

const NAME     = 'Oomtility Auto'
    , VERSION  = '1.0.11'
    , HOMEPAGE = 'http://oomtility.loop.coop'

    , BYLINE   = `\n\n\n\n//\\\\ generated by ${NAME} ${VERSION}\n`
                       + ` //\\\\//\\\\ ${HOMEPAGE} //\\\\//\\\\\n`
    , HELP =
`
${NAME} ${VERSION}
${'='.repeat( (NAME+VERSION).length+1 )}

This Node.js script generates and edits the source, test and demo files
associated with one or more new classes. @TODO docs?

Installation
------------
If you haven’t done it already, you should set up the \`oomauto\` alias:
$ node oomtility/alias.js

Basic Usage
-----------
$ cd /path/to/your/oom/repo/     # An Oom repo directory
$ oomauto --version              # Show the current ${NAME} version
$ oomauto Base Another Base.Sub  # Generates files for three new classes
$ oomauto -r Another Base.Sub    # Removes files for two classes

Generated Or Removed Files
--------------------------
1. src/main/Base.Sub.6.js               Source file for Base.Sub class
2. src/test/Base.Sub-universal.6.js     Basic unit tests you’ll add to
3. src/test/Base.Sub-browser.6.js       As above, for browsers only
4. src/test/Base.Sub-nonbrowser.6.js    As above, for Node.js only
5. src/demo/Base.Sub-demo.6.js          Usage example script
6. support/demo-base.sub.html           Usage example page (lowercase)

Options
-------
-d  --demo      Just generate a demo script and page - no class, test or docs
-h  --help      Show this help message
-r  --remove    Remove existing class or classes from the project
-v  --version   Show the current ${NAME} version

This script belongs to ${HOMEPAGE}
`


//// Validate the environment.
const nodePath = process.argv.shift()
const selfPath = process.argv.shift()
if ( '/oomtility/auto.js' !== selfPath.slice(-18) )
    return console.warn('Unexpected environment!')
if ( ( process.cwd() !== selfPath.slice(0,-18) ) )
    return console.warn(`Unexpected CWD, try:\n  $ cd ${selfPath.slice(0,-18)}`)
if ('function' !== typeof require)
    return console.warn('Use Node.js instead:\n  $ node oomtility/auto.js')




//// SETUP


//// Load library functionality.
const fs = require('fs')

//// Set constants.
const topline = (fs.readFileSync(`src/main/App.6.js`)+'').split('\n')[0]
const projectTC = topline.split(' ')[1]          // titlecase, eg 'FooBar'
const projectLC = process.cwd().split('/').pop() // lowercase, eg 'foo-bar'
const projectNH = projectLC.replace(/-/g,'')     // no hyphens, eg 'foobar'
if ( projectLC.toLowerCase() != projectLC) return console.warn(
    `Project '${projectLC}' contains uppercase letters`)
if ( projectTC.toLowerCase() != projectNH) return console.warn(
    `Project '${projectLC}' is called '${projectTC}' in src/main/App.6.js`)

//// Declare variables.
let opt, demo = false, remove = false, classes = []

//// Deal with command-line options.
while ( opt = process.argv.shift() ) {
    if ('-d' === opt || '--demo'    === opt) { demo = true; continue }
    if ('-h' === opt || '--help'    === opt) return console.log(HELP)
    if ('-r' === opt || '--remove'  === opt) { remove = true; continue }
    if ('-v' === opt || '--version' === opt) return console.log(VERSION)
    if ( /^[A-Z][A-Za-z0-9]+(\.[A-Z][A-Za-z0-9]+)*$/.test(opt) )
        classes.push(opt)
    else
        console.warn(`Ignoring '${opt}' - not a valid option or class-name`)
}

//// Ignore duplicate class-names.
classes = new Set(classes)




//// GENERATE OR REMOVE FILES


//// 1. src/main/Base.Sub.6.js               Source file for Base.Sub class

classes.forEach( name => { generateOrRemove(
    `src/main/${name}.6.js`
  , generateClass(name)
) })


//// 2. src/test/Base.Sub-universal.6.js     Basic unit tests you’ll add to
classes.forEach( name => { generateOrRemove(
    `src/test/${name}-universal.6.js`
  , generateUniversalTest(name)
) })


//// 3. src/test/Base.Sub-browser.6.js       As above, for browsers only
classes.forEach( name => { generateOrRemove(
    `src/test/${name}-browser.6.js`
  , generateBrowserTest(name)
) })


//// 4. src/test/Base.Sub-nonbrowser.6.js    As above, for Node.js only
classes.forEach( name => { generateOrRemove(
    `src/test/${name}-nonbrowser.6.js`
  , generateNonbrowserTest(name)
) })


//// 5. src/demo/Base.Sub-demo.6.js          Usage example script
classes.forEach( name => { generateOrRemove(
    `src/demo/${name}-demo.6.js`
  , generateDemoScript(name)
) })


//// 6. support/demo-base.sub.html           Usage example page (lowercase)
classes.forEach( name => { generateOrRemove(
    `support/demo-${name.toLowerCase().replace(/\./g,'-')}.html`
  , generateDemoPage(name)
) })




//// EDIT @TODO MOVE TO `docs.js`


//// 1. src/main/README.md                      Documentation for each class
// @todo


//// 3. support/docs.html                       Documentation for each class
// @todo




//// UTILITY


////
function generateOrRemove (path, content) {
    const exists = fs.existsSync(path)
    if (remove && ! exists)
        return console.warn(`Doesn’t exist: ${path}`)
    if (! remove && exists)
        return console.warn(`Already exists: ${path}`)
    if (remove)
        fs.unlinkSync(path)
    else
        fs.writeFileSync(path, content)
}


////
function generateClass (name) {
    let out = `${topline}

!function (ROOT) { 'use strict'

`

    if ( -1 == name.indexOf('.') ) {
        out += `
ROOT.${projectTC}.${name} = class {

    constructor (config, app) {
`
    } else {
        const baseName = name.split('.').slice(0, -1).join('.')
        out += `
ROOT.${projectTC}.${name} = class extends ROOT.${projectTC}.${baseName} {

    constructor (config, app) {
        super(config, app)
`
    }
    out += `
        //// Record configuration.
        const defaults = {
            aa:     10
          , bb:     null
          , cc:     app.cc
        }
        Object.assign(this, defaults, config, { app })
    }

    xxx (config) {
        const { app, aa, bb, cc } = this
        const { xx, yy, zz } = config

        ////

    }

}


}( 'object' == typeof global ? global : this ) // \`window\` in a browser
`

    return out
}


////
function generateUniversalTest (name) {
    const fullName = `${projectTC}.${name}`
    return `${topline}


//// Node.js: 7.2.0
//// Rhino:   [not tested yet]

//// Windows XP: Firefox 6, Chrome 15 (and probably lower), Opera 12.10
//// Windows 7:  IE 9, Safari 5.1
//// OS X 10.6:  Firefox 6, Chrome 16 (and probably lower), Opera 12, Safari 5.1
//// iOS:        iPad 3rd (iOS 6) Safari, iPad Air (iOS 7) Chrome
//// Android:    Xperia Tipo (Android 4), Pixel XL (Android 7.1)




if ('function' != typeof jQuery) throw Error('jQuery not found')
jQuery( function($) { 'use strict'




test('The ${name} class (universal)', () => {
    is('function' == typeof ${fullName}   , '\`${fullName}\` is a function')
})




})
`}


////
function generateBrowserTest (name) {
    const fullName = `${projectTC}.${name}`
    return `${topline}


//// Windows XP: Firefox 6, Chrome 15 (and probably lower), Opera 12.10
//// Windows 7:  IE 9, Safari 5.1
//// OS X 10.6:  Firefox 6, Chrome 16 (and probably lower), Opera 12, Safari 5.1
//// iOS:        iPad 3rd (iOS 6) Safari, iPad Air (iOS 7) Chrome
//// Android:    Xperia Tipo (Android 4), Pixel XL (Android 7.1)




if ('function' != typeof jQuery) throw Error('jQuery not found')
jQuery( function($) { 'use strict'




test('The ${name} class (browser)', () => {
    is('function' == typeof ${fullName}   , '\`${fullName}\` is a function')
})




})
`}


////
function generateNonbrowserTest (name) {
    const fullName = `${projectTC}.${name}`
    return `${topline}


//// Node.js: 7.2.0
//// Rhino:   [not tested yet]




if ('function' != typeof jQuery) throw Error('jQuery not found')
jQuery( function($) { 'use strict'




test('The ${name} class (nonbrowser)', () => {
    is('function' == typeof ${fullName}   , '\`${fullName}\` is a function')
})




})
`}


////
function generateDemoScript (name) {
    const nameLC_ = name.toLowerCase().replace(/\./g,'_')
    return `${topline}


if ('function' != typeof jQuery) throw Error('jQuery not found')
jQuery( function($) { 'use strict'


//// Generate an instance of ${projectTC} with default configuration.
const ${projectLC} = new ${projectTC}({ // config
})


//// Generate an instance of ${name} with default configuration.
const ${nameLC_} = new ${projectTC}.${name}({ // config
}, {}) // app


})
`}


////
function generateDemoPage (name) {
    const nameLC = name.toLowerCase()
    return `<!DOCTYPE HTML>
<html lang="en-GB">
<head>




<!-- META -->

<!-- Technical meta -->
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport"
   content="width=device-width, initial-scale=1.0, shrink-to-fit=no,
            maximum-scale=1.0, user-scalable=no">

<!-- Search engine meta -->
<title>${name} Demo</title>
<meta name="description"
   content="Usage examples for ‘${name}’.">
<link rel="author" href="../README.md">

<!-- Twitter Card, and Open Graph for Facebook, LinkedIn, Google+, etc -->
<meta name="twitter:card"    content="summary">
<meta name="twitter:site"    content="@loopdotcoop">
<meta name="twitter:creator" content="@richplastow">
<meta property="og:type"     content="website">
<meta property="og:locale"   content="en_GB">
<meta property="og:title"    content="${name} Demo">
<meta property="og:url"      content="https://${projectLC}.loop.coop/">
<meta property="og:image"
       content="https://${projectLC}.loop.coop/asset/logo/logo1200.png">
<meta property="og:description"
       content="Usage examples for ‘${name}’.">

<!-- From realfavicongenerator.net - see README.md for settings -->
<link rel="apple-touch-icon" sizes="180x180" href="../asset/icon/apple-touch.png">
<link rel="icon" type="image/png" sizes="32x32" href="../asset/icon/favicon32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../asset/icon/favicon16.png">
<link rel="manifest"                  href="../asset/icon/manifest.json">
<link rel="mask-icon" color="#FFFFFF" href="../asset/icon/safari-pinned-tab.svg">
<link rel="shortcut icon"             href="../asset/icon/favicon.ico">
<meta name="apple-mobile-web-app-title" content="${name} Demo">
<meta name="application-name"           content="${name} Demo">
<meta name="msapplication-config"       content="../asset/icon/browserconfig.xml">
<meta name="theme-color"                content="#FFFFFF">




<!-- STYLE -->

<!-- Load fonts as soon as possible -->
<style type="text/css">
/*
@font-face {
  font-family: 'someFontRegular';
  src: url('asset/font/somefontregular.woff') format('woff');
  font-weight: 400; font-style: normal;
}
@font-face {
  font-family: 'someFontBold';
  src: url('asset/font/somefontbold.woff') format('woff');
  font-weight: 700; font-style: normal;
}
*/
</style>

<!-- Load styles -->
<link rel="stylesheet" href="../lib/bootstrap/css/bootstrap.css">
<link rel="stylesheet" href="../asset/css/main.css">


</head>
<body>




<!-- HEADER -->

<!-- Dropdown menu to select JavaScript format -->
<select id="ecmaswitch" style="float:right" onchange="document.cookie=
  'ecmaswitch='+this.options[this.selectedIndex].value;location.reload()">
  <option value="~0~">ES5 Production</option><!-- default -->
  <option value="~1~">ES5 Minified</option>
  <option value="~2~">ES6 Production</option>
  <option value="~3~">ES6 Development</option>
</select><script>!function(d,f,e){if(e=d.getElementById('ecmaswitch'))f=~~
  d.cookie.split('~')[1],e.options[f].selected=!0}(document)</script>

<!-- Header and Navigation menu -->
<h1 style="display:inline">${name} Demo
  <span id="version">&hellip;</span> <span id="format"></span>&nbsp;</h1>
<div style="float:right">
  <a href="../index.html">Home</a> &nbsp;
  <a href="https://github.com/loopdotcoop/${projectLC}">Repo</a> &nbsp;
  <a href="@TODO">NPM</a> &nbsp;
  <a href="test.html">Test</a> &nbsp;
  <a href="demo.html">Demo</a> &nbsp;&nbsp;
</div>

<h2 style="margin-top:0.2em">Usage examples for ‘${name}’.</h2>




<!-- CONTENT -->

<!-- Upgrade message for Internet Explorer 8 and below --><!--[if lte IE 8]>
<script>document.getElementById('version').innerHTML='Not Supported'</script>
<h2>Please upgrade to Internet Explorer 9 or higher</h2><![endif]-->
<!-- Begin hiding from IE 8 and below --><!--[if gte IE 9 | !IE ]><!-->


<!-- Displays the demo -->
<pre id="dump" style="font: 18px Monaco,'Lucida Console',monospace;
  background:#cde; width:48em; line-height:1.15"></pre>

<!-- Load the proper format scripts, according to the '#ecmaswitch' menu -->
<script src="asset/js/ecmaswitch.js"></script>
<script>ECMASwitch.load('../', [
    [
        '../dist/demo/${nameLC}-demo.5.js'
      , '../dist/demo/${nameLC}-demo.5.js' // no need to minify a demo script
      , '../dist/demo/${nameLC}-demo.js'
      ,  '../src/demo/${name}-demo.js'
    ]
])</script>

<!-- Display the version and format -->
<script>$('#version').html(${projectTC}.VERSION||'(no VERSION)');$('#format').html(
'es'+'5|5 min|6|6 dev'.split('|')[~~document.cookie.split('~')[1]])</script>

<!-- End hiding from Internet Explorer 8 and below --><!--<![endif]-->
</body>
</html>
`
}



}()
