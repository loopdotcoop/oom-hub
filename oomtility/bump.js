!function () { 'use strict'

const NAME     = 'Oomtility Bump'
    , VERSION  = '1.0.8'
    , HOMEPAGE = 'http://oomtility.loop.coop'

    , HELP =
`
${NAME} ${VERSION}
${'='.repeat( (NAME+VERSION).length+1 )}

This Node.js script increments (bumps) the project’s version wherever it appears
in the ‘src/’ folder and in ‘package.json’ and ‘README.md’. It searches files
for lines containing the special string ‘OOMBUMPABLE’, and also checks the top
line of ‘src/’ files for the standard Oom topline.

${NAME} also updates the date in ‘src/’ file toplines and in ‘README.md’.

By default, Oomtility Bump increments the ‘patch’ (eg from 1.2.3 to 1.2.4).
Options exist to bump minor or major parts, or set the version to anything.

Note that the current version is retrieved from ‘src/main/App.6.js’s topline.

Installation
------------
If you haven’t done it already, you should set up the \`oombump\` alias:
$ node oomtility/alias.js

Basic Usage
-----------
$ cd /path/to/your/oom/repo/  # An Oom repo directory
$ oombump --version           # Show the current ${NAME} version
$ oombump                     # Increment version from 1.2.3 to 1.2.4
$ oombump --minor             # Increment version from 1.2.3 to 1.3.0
$ oombump --major             # Increment version from 1.2.3 to 2.0.0
$ oombump --set 0.44.99       # Set the version to 0.44.99

Standard Files
--------------
1. README.md      Bump version on lines containing ‘OOMBUMPABLE’
2. README.md      Update date on lines containing ‘OOMBUMPABLE’
3. package.json   Bump version in the "version" field

Files In ‘src/’
---------------
1. Bump version on lines containing ‘OOMBUMPABLE’
2. Update date on lines containing ‘OOMBUMPABLE’
3. Bump version in topline (must be the first line)
4. Update date in topline (must be the first line)

Options
-------
-h  --help      Show this help message
-v  --version   Show the current ${NAME} version
-1  --major     Increment version from 1.2.3 to 2.0.0
-2  --minor     Increment version from 1.2.3 to 1.3.0
-3  --patch     Increment version from 1.2.3 to 1.2.4 (default)
-s  --set       Set the version to some arbitrary value

This script belongs to ${HOMEPAGE}
`


//// Validate the environment.
const nodePath   = process.argv.shift()
const scriptPath = process.argv.shift()
if ( '/oomtility/bump.js' !== scriptPath.slice(-18) )
    return console.warn('Unexpected environment!')
if ( ( process.cwd() !== scriptPath.slice(0,-18) ) )
    return console.warn('Unexpected CWD, try:\n  $ cd /path/to/your/oom/repo/')
if ('function' !== typeof require)
    return console.warn('Use Node.js instead:\n  $ node oomtility/bump.js')




//// SETUP


//// Load library functionality.
const fs = require('fs')

//// Set constants.
const rxV = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const topline = (fs.readFileSync(`src/main/App.6.js`)+'').split('\n')[0]
const [
    x1          // four slashes
  , projectTC   // titlecase, eg 'FooBar'
  , x2          // four slashes
  , projectV    // current project version, eg ‘1.2.3’
  , x3          // four slashes
  , projectMth  // current last-updated month, eg ‘January’
  , projectYYYY // current last-updated year, eg ‘2018’
  , x4          // four slashes
  , projectURL  // project URL, eg ‘http://oom-foo.loop.coop/’
] = topline.split(' ')
if (! /^[A-Z][a-zA-Z]+$/.test(projectTC) )
    return console.warn(`App.6.js’s topline title '${projectTC}' is invalid`)
if (! rxV.test(projectV) )
    return console.warn(`App.6.js’s topline version '${projectV}' is invalid`)
if (! /^January|February|March|April|May|June|July|August|September|October|November|December$/.test(projectMth) )
    return console.warn(`App.6.js’s topline month '${projectMth}' is invalid`)
if (! /^20\d\d$/.test(projectYYYY) )
    return console.warn(`App.6.js’s topline year '${projectYYYY}' is invalid`)
const currV = projectV.split('.').map( v => +v )
const rxProjectV = new RegExp(projectV, 'g')

//// Build search expressions for dates, and new dates to replace them with.
const projectMM = {
    'January':  '01'
  , 'February': '02'
  , 'March':    '03'
  , 'April':    '04'
  , 'May':      '05'
  , 'June':     '06'
  , 'July':     '07'
  , 'August':   '08'
  , 'September':'09'
  , 'October':  '10'
  , 'November': '11'
  , 'December': '12'
}[projectMth]
const rxProjectYYYYMMDD = new RegExp(`${projectYYYY}/${projectMM}/[0-3]\\d`,'g')
const rxProjectMthYYYY  = new RegExp(`${projectMth} ${projectYYYY}`,'g')
const newMthNum   = (new Date).getUTCMonth() + 1 // 1 for January
const newDateNum  = (new Date).getUTCDate() // 7 for 7th day of the month
const newMM       = (10 > newMthNum  ? '0' : '') + newMthNum // '01' for January
const newDD       = (10 > newDateNum ? '0' : '') + newDateNum // '07' for day 7
const newYYYY     = (new Date).getUTCFullYear() // '2018'
const newYYYYMMDD = `${newYYYY}/${newMM}/${newDD}` // '2018/01/07'
const newMth      = monthNames()[newMthNum] // 'January'
const newMthYYYY  = `${newMth} ${newYYYY}` // 'January 2018'

//// Deal with command-line options.
let opt, major, minor, patch, set, setV
while ( opt = process.argv.shift() ) {
    if ('-h' === opt || '--help'    === opt) return console.log(HELP)
    if ('-v' === opt || '--version' === opt) return console.log(VERSION)
    if ('-1' === opt || '--major'   === opt) { major = true; continue }
    if ('-2' === opt || '--minor'   === opt) { minor = true; continue }
    if ('-3' === opt || '--patch'   === opt) { patch = true; continue } //unused
    if ('-s' === opt || '--set'     === opt) { set   = true; continue }
    if ( rxV.test(opt) )
        setV = opt
    else
        console.warn(`Ignoring '${opt}' - not a valid option or version`)
}
if (set && ! setV) set = null

//// Get the new version.
let newV
if (set)
    newV = setV
else if (major)
    newV = `${++currV[0]}.0.0`
else if (minor)
    newV = `${currV[0]}.${++currV[1]}.0`
else // default
    newV = `${currV[0]}.${currV[1]}.${++currV[2]}`

//// Build a new topline.
const newTopline = ('//// ' + ([ //@TODO deal with overlong topline
    projectTC, newV, newMth + ' ' + projectYYYY, projectURL
]).join(' //// ') + ' ///////////////////').substr(0, 80)




//// STANDARD FILES


let out = []
;(fs.readFileSync('README.md')+'').split('\n').forEach( line => {
    if ( /OOMBUMPABLE/.test(line) ) {

        //// 1. README.md      Bump version on lines containing ‘OOMBUMPABLE’
        line = line.replace(rxProjectV, newV)

        //// 2. README.md      Update date on lines containing ‘OOMBUMPABLE’
        line = line.replace(rxProjectYYYYMMDD, newYYYYMMDD)
        line = line.replace(rxProjectMthYYYY, newMthYYYY)
    }
    out.push(line)
})
fs.writeFileSync( 'README.md', out.join('\n') )

out = []
;(fs.readFileSync('package.json')+'').split('\n').forEach( line => {
    if ( new RegExp(`^\\s*"version":\\s*"${projectV}",?$`,'g').test(line) ) {

        //// 3. package.json   Bump version in the "version" field
        line = line.replace(rxProjectV, newV)

    }
    out.push(line)
})
fs.writeFileSync( 'package.json', out.join('\n') )




//// FILES IN ‘SRC/’


//// Get a list of paths to search in.
function readdirSyncRecurse (except, path) {
    let out = []
    fs.readdirSync(path).forEach(
        item => {
            if ( -1 !== except.indexOf(item) ) return
            const pathSlashItem = `${path}/${item}`
            const isDir = fs.statSync(pathSlashItem).isDirectory()
            if (isDir)
                out = out.concat( readdirSyncRecurse(except, pathSlashItem) )
            else
                out.push(pathSlashItem)
        }
    )
    return out
}
const srcPaths = readdirSyncRecurse([], 'src')

//// Make the replacements.
srcPaths.forEach( path => {
    let out = []
    ;(fs.readFileSync(path)+'').split('\n').forEach( (line, i) => {

        if ( /OOMBUMPABLE/.test(line) ) {

            //// 1. Bump version on lines containing ‘OOMBUMPABLE’
            line = line.replace(rxProjectV, newV)

            //// 2. Update date on lines containing ‘OOMBUMPABLE’
            line = line.replace(rxProjectYYYYMMDD, newYYYYMMDD)
            line = line.replace(rxProjectMthYYYY, newMthYYYY)
        }

        //// 3. Bump version in topline (must be the first line)
        //// 4. Update date in topline (must be the first line)
        if (0 === i && topline === line)
            line = newTopline

        out.push(line)
    })

    fs.writeFileSync( path, out.join('\n') )
})
return




//// UTILITY


//// Used to get `newMth`.
function monthNames() {
    return [
        '' // NOT zero indexed
      , 'January'
      , 'February'
      , 'March'
      , 'April'
      , 'May'
      , 'June'
      , 'July'
      , 'August'
      , 'September'
      , 'October'
      , 'November'
      , 'December'
    ]
}

}()
