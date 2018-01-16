!function () { 'use strict'

const NAME     = 'Oomtility Wrap'
    , VERSION  = '1.0.6'
    , HOMEPAGE = 'https://oomtility.loop.coop'
    , HELP =
`
${NAME} ${VERSION}
${'='.repeat( (NAME+VERSION).length+1 )}

This Node.js script reads the files specified, and converts them into JavaScript
functions which return that file as a string. It’s used to create most of the
functions in ‘oomtility-lib.js’, and may be useful for general Oom development.

Installation
------------
If you haven’t done it already, you should set up the \`oomwrap\` alias:
$ node oomtility/alias.js

Basic Usage
-----------
$ cd /path/to/your/oom/repo/  # An Oom repo directory
$ oomwrap --version           # Show the current ${NAME} version
$ oomwrap foo.js bar/baz.png  # Output \`getFooJs()\` and \`getBazPng()\`

Options
-------
-h  --help      Show this help message
-v  --version   Show the current ${NAME} version

This script belongs to ${HOMEPAGE}
`


//// Validate the environment.
const nodePath   = process.argv.shift()
const scriptPath = process.argv.shift()
if ( '/oomtility/wrap.js' !== scriptPath.slice(-18) )
    return console.warn('Unexpected environment!')
if ( ( process.cwd() !== scriptPath.slice(0,-18) ) )
    return console.warn('Unexpected CWD, try:\n  $ cd /path/to/your/oom/repo/')
if ('function' !== typeof require)
    return console.warn('Use Node.js instead:\n  $ node oomtility/wrap.js')




//// SETUP


//// Load library functionality.
const fs = require('fs')

//// Declare variables.
let opt, paths = []

//// Deal with command-line options.
while ( opt = process.argv.shift() ) {
    if ('-h' === opt || '--help'    === opt) return console.log(HELP)
    if ('-v' === opt || '--version' === opt) return console.log(VERSION)
    paths.push(opt)
}




//// CONVERT FILES


//// Xx.
paths.forEach( path => {
    const out = [
        `//// An ${NAME} of ${path.split('/').pop()} \\\\//\\\\// ${HOMEPAGE} ////`
      , `module.exports.${pathToFnName(path)} = function () { return ''`
    ]
    ;(fs.readFileSync(path, 'binary')+'').split('\n').forEach( (line, num) => {
        line = line.replace(/\\/g, '\\\\')
        line = line.replace(/'/g, "\\'")
        line = encodeUTF16(line, '•') // avoid edge cases by adding a non-ascii
        if (80 >= line.length) {
            line = line.replace(/•/g, 'u') // correct our edge-case avoider
            return out.push(`  + '${line}\\n'`)
        }
        for (let pos=0, len=80, reduction, sub; pos<line.length;) {
            while (len) {
                reduction = getLineLengthReduction(line, pos, len)
                if (! reduction) break // no need to reduce line length
                len -= reduction // found a ‘\’ or the result of `encodeUTF16()`
            }
            if (0 >= len) throw Error(`Too many backslashes in ${path}:${num}\n`)
            sub = line.substr(pos, len)
            sub = sub.replace(/•/g, 'u') // correct our edge-case avoider
            out.push(`  + '${sub}'`)
            pos += len
            len=80
        }
        out[out.length-1] = out[out.length-1].slice(0, -1) + "\\n'"
    })
    out[out.length-1] = out[out.length-1].slice(0, -3) + "'" // no final newline
    out.push('}')
    console.log( out.join('\n') + '\n\n\n\n' );
})




//// UTILITY

function encodeUTF16 (str, u='u') {
    let pos=0, out='', code, hex
    for (; pos<str.length; pos++) {
        code = str.charCodeAt(pos)
        if (31 < code && 127 > code) {
            out += str[pos]
        } else {
            hex = code.toString(16)
            out += '\\' + u + ( '0'.repeat(4-hex.length) ) + hex
        }
    }
    return out;
}

function getLineLengthReduction (line, pos, len) {
    for (let i=1; i<6; i++) // find an encoding made by `encodeUTF16()`
        if ( /\\•[0-9a-f]{4}/.test( line.substr(pos+len-i,6) ) )
            return i
    if ( '\\' === line[pos+len-1] ) // find a backslash
        return 1
    return 0
}


//// Similar to `lcToTc()` in ‘init.js’. 'foo/bar-baz.txt' to 'getBarBazTxt'.
function pathToFnName (path) {
    return 'get' + (
        path.split('/').pop().split(/[- .]/g).map(
            w => w ? w[0].toUpperCase() + w.substr(1) : ''
        ).join('')
    )
}

}()
