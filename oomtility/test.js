!function () { 'use strict'

const NAME     = 'Oomtility Test'
    , VERSION  = '1.0.11'
    , HOMEPAGE = 'http://oomtility.loop.coop'

    , HELP =
`
${NAME} ${VERSION}
${'='.repeat( (NAME+VERSION).length+1 )}

This Node.js script runs the ‘universal’ and ‘nonbrowser’ tests in ‘dist/test’.
It can also launch ‘support/test.html’ in your default browser.

Installation
------------
If you haven’t done it already, you should set up the \`oomtest\` alias:
$ node oomtility/alias.js

Basic Usage
-----------
$ cd /path/to/your/oom/repo/  # An Oom repo directory
$ oomtest --version           # Show the current ${NAME} version
$ oomtest                     # Run ‘universal’ and ‘nonbrowser’ tests in Node
$ npm test                    # Same as \`$ oomtest\`
$ npm test -- --browser       # Same as \`$ oomtest --browser\`

Options
-------
-b  --browser   Also launch ‘support/test.html’ in the default browser
-h  --help      Show this help message
-v  --version   Show the current ${NAME} version

This script belongs to ${HOMEPAGE}
`


//// Validate the environment.
const nodePath = process.argv.shift()
const selfPath = process.argv.shift()
if ( '/oomtility/test.js' !== selfPath.slice(-18) )
    return console.warn('Unexpected environment!')
if ( ( process.cwd() !== selfPath.slice(0,-18) ) )
    return console.warn(`Unexpected CWD, try:\n  $ cd ${selfPath.slice(0,-18)}`)
if ('function' !== typeof require)
    return console.warn('Use Node.js instead:\n  $ node oomtility/test.js')




//// SETUP


//// Set constants.
const projectLC = process.cwd().split('/').pop() // lowercase, eg 'foo-bar'

//// Load the assertion library and its reporter.
require('../support/asset/js/klud.min.js')
require('../support/asset/js/report.min.js')

//// Load the Production ES6 verion of the app.
require(`../dist/main/${projectLC}.6.js`)

//// Declare variables.
let opt, browser

//// Deal with command-line options.
while ( opt = process.argv.shift() ) {
    if ('-h' === opt || '--help'    === opt) return console.log(HELP)
    if ('-v' === opt || '--version' === opt) return console.log(VERSION)
    if ('-b' === opt || '--browser' === opt) { browser = true; continue }
}




//// RUN TESTS


//// Stub the environment, to make it appear more browser-like.
global.jQuery = global.$ = onload => { onload() }

//// Run parts of the test-suite compatible with a non-browser runtime.
require(`../dist/test/${projectLC}-universal.6.js`)
require(`../dist/test/${projectLC}-nonbrowser.6.js`)

//// Launch the browser tests.
if (browser) {
    const exec = require('child_process').exec
    exec(
        'open file://' + process.cwd() + '/support/test.html'
      , function(error, stdout, stderr) {
            if (error) console.warn(error)
        }
    )
}


}()
