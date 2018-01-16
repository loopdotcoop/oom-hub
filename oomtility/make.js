!function () { 'use strict'

const NAME     = 'Oomtility Make'
    , VERSION  = '1.0.6'
    , HOMEPAGE = 'http://oomtility.loop.coop'

    , BYLINE   = `\n\n\n\n//\\\\//\\\\ built by ${NAME} ${VERSION}`
                       + ` //\\\\//\\\\ ${HOMEPAGE} //\\\\//\\\\\n`
    , HELP =
`
${NAME} ${VERSION}
${'='.repeat( (NAME+VERSION).length+1 )}

This Node.js script reads source files from ‘src/’ (all ES6), and rebuilds the
distribution files in ‘dist/’ (ES6, ES5 and minified ES5). It also updates the
‘dynamic’ sections of various ‘support/’ files.

Installation
------------
You’ll need Uglify and Traceur installed globally before running make.js:
$ npm install -g uglify-js; npm install -g traceur

If you haven’t done it already, you should set up the \`oommake\` alias:
$ node oomtility/alias.js

Basic Usage
-----------
$ cd /path/to/your/oom/repo/  # An Oom repo directory
$ oommake --version           # Show the current ${NAME} version
$ oommake                     # Build ‘dist/’ files, update ‘support/’ files

Create Files
------------
1. Concatenate files in ‘src/main/’ to ‘dist/main/project.6.js’
2. Transpile the new ‘project.6.js’ to ‘project.5.js’
3. Minify ‘project.5.js’ to ‘project.5.min.js’
4. Copy files in ‘src/demo/’ to ‘dist/demo/’ (and change to lowercase)
5. Transpile ES6 files in ‘dist/demo/’ to ES5
6. Concatenate files in ‘src/test/’ to:
   - ‘dist/test/project-browser.6.js’        (can only be run in a browser)
   - ‘dist/test/project-nonbrowser.6.js’     (cannot be run in a browser)
   - ‘dist/test/project-universal.6.js’      (can run anywhere)
7. Transpile the ‘browser’ and ‘universal’ files to ES5

Edit Files
----------
1. support/demo.html                       Link to each usage example
2. support/asset/js/ecmaswitch.js          \`var classFiles = '...'\` updated
3. support/test.html                       ‘Development ES6’ links
X. src/main/README.md                      Documentation for each class @TODO move to docs.js
X. support/docs.html                       Documentation for each class @TODO move to docs.js

Options
-------
-h  --help      Show this help message
-v  --version   Show the current ${NAME} version

This script belongs to ${HOMEPAGE}
`


//// Validate the environment.
const nodePath   = process.argv.shift()
const scriptPath = process.argv.shift()
if ( '/oomtility/make.js' !== scriptPath.slice(-18) )
    return console.warn('Unexpected environment!')
if ( ( process.cwd() !== scriptPath.slice(0,-18) ) )
    return console.warn('Unexpected CWD, try:\n  $ cd /path/to/your/oom/repo/')
if ('function' !== typeof require)
    return console.warn('Use Node.js instead:\n  $ node oomtility/make.js')




//// SETUP


//// Load library functionality.
const fs = require('fs')
    , uglify = tidyUglifyWarnings( require('uglify-js') )
    , traceur = require('traceur/src/node/api.js')

//// Set constants.
const topline = (fs.readFileSync(`src/main/App.6.js`)+'').split('\n')[0]
const projectTC = topline.split(' ')[1]          // titlecase, eg 'FooBar'
const projectLC = process.cwd().split('/').pop() // lowercase, eg 'foo-bar'
const projectNH = projectLC.replace(/-/g,'')     // no hyphens, eg 'foobar'
if ( projectLC.toLowerCase() != projectLC) return console.warn(
    `Project '${projectLC}' contains uppercase letters`)
if ( projectTC.toLowerCase() != projectNH) return console.warn(
    `Project '${projectLC}' is called '${projectTC}' in src/main/App.6.js`)

//// Simplifies moving ‘App.6.js’ to the start of concatenation.
Array.prototype.move = function(from, to) { // stackoverflow.com/a/7180095
    this.splice(to, 0, this.splice(from, 1)[0]) }

//// Declare variables.
let opt, es6, es5, min, mains, demos, tests, pos, names

//// Deal with command-line options.
while ( opt = process.argv.shift() ) {
    if ('-h' === opt || '--help'    === opt) return console.log(HELP)
    if ('-v' === opt || '--version' === opt) return console.log(VERSION)
}




//// CREATE FILES: MAIN


//// Delete the current contents of ‘dist/main/’.
fs.readdirSync('dist/main').forEach( name => {
    if ('.' != name[0]) fs.unlinkSync('dist/main/' + name)
})


//// 1. Concatenate files in ‘src/main/’ to ‘dist/main/project.6.js’
mains = fs.readdirSync('src/main')
es6 = []
if ( -1 === (pos = mains.indexOf('App.6.js')) )
    return console.warn('No ‘src/main/App.6.js’')
mains.move(pos, 0) // ‘src/main/App.6.js’ must go first (`move()` defined above)
mains.forEach( name => {
    if ( '.6.js' !== name.slice(-5) ) return
    es6.push('//\\\\//\\\\ src/main/' + name)
    es6.push( fs.readFileSync('src/main/' + name)+'' )
})
es6 = es6.join('\n\n\n\n') + BYLINE
fs.writeFileSync( `dist/main/${projectLC}.6.js`, es6 )


//// 2. Transpile the new ‘project.6.js’ to ‘project.5.js’
es5 = traceur.compile(es6, { blockBinding:true }) + BYLINE
es5 = es5.replace( // correct a traceur error
    /efined' : \$traceurRuntime\.typeof\(global\)\) \? global : \(void 0\)\);/g
  , "efined' : $traceurRuntime.typeof(global)) ? global : this);"
)
fs.writeFileSync( `dist/main/${projectLC}.5.js`, es5 )


//// 3. Minify ‘project.5.js’ to ‘project.5.min.js’
min = uglify.minify( es5, minConfig(`dist/main/${projectLC}.5.min.js`) )
fs.writeFileSync( `dist/main/${projectLC}.5.min.js`, min.code + BYLINE )




//// CREATE FILES: DEMO


//// Delete the current contents of ‘dist/demo/’.
fs.readdirSync('dist/demo').forEach( name => {
    if ('.' != name[0]) fs.unlinkSync('dist/demo/' + name)
})


//// 4. Copy files in ‘src/demo/’ to ‘dist/demo/’ (and change to lowercase)
demos = fs.readdirSync('src/demo')
es6 = [], names = []
demos.forEach( name => {
    if ( '.6.js' !== name.slice(-5) ) return
    es6.push('//\\\\//\\\\ src/demo/' + name + '\n\n\n\n'
        + fs.readFileSync('src/demo/' + name)
    )
    names.push( name.slice(0,-5).toLowerCase() ) // 'Ok-demo.6.js' -> 'ok-demo'
})
es6.forEach( (orig, i) =>
    fs.writeFileSync( `dist/demo/${names[i]}.6.js`, orig + BYLINE )
)


//// 5. Transpile ES6 files in ‘dist/demo/’ to ES5
es6.forEach( (orig, i) => {
    const es5 = traceur.compile(orig, { blockBinding:true })
    fs.writeFileSync( `dist/demo/${names[i]}.5.js`, es5 + BYLINE )
})




//// CREATE FILES: TEST


//// Delete the current contents of ‘dist/test/’.
fs.readdirSync('dist/test').forEach( name => {
    if ('.' != name[0]) fs.unlinkSync('dist/test/' + name)
})


//// 6. Concatenate files in ‘src/test/’ to:
tests = fs.readdirSync('src/test')
es6 = { browser:[], nonbrowser:[], universal:[] }
tests.forEach( name => {
    if ( '.6.js' !== name.slice(-5) ) return
    let ua =
        '-browser.6.js'    == name.slice(-13) ? es6.browser
      : '-nonbrowser.6.js' == name.slice(-16) ? es6.nonbrowser
      : '-universal.6.js'  == name.slice(-15) ? es6.universal
      : []
    ua.push('//\\\\//\\\\ src/test/' + name)
    ua.push( fs.readFileSync('src/test/' + name)+'' )
})

//// - ‘dist/test/project-browser.6.js’         (can only be run in a browser)
es6.browser    = es6.browser.join('\n\n\n\n')    + BYLINE
fs.writeFileSync( `dist/test/${projectLC}-browser.6.js`, es6.browser )

//// - ‘dist/test/project-nonbrowser.6.js’      (cannot be run in a browser)
es6.nonbrowser = es6.nonbrowser.join('\n\n\n\n') + BYLINE
fs.writeFileSync( `dist/test/${projectLC}-nonbrowser.6.js`, es6.nonbrowser )

//// - ‘dist/test/project-universal.6.js’       (can run anywhere)
es6.universal  = es6.universal.join('\n\n\n\n')  + BYLINE
fs.writeFileSync( `dist/test/${projectLC}-universal.6.js`, es6.universal )


//// 7. Transpile the ‘browser’ and ‘universal’ files to ES5
es5 = {}
es5.browser    = traceur.compile(es6.browser,   { blockBinding:true }) + BYLINE
fs.writeFileSync( `dist/test/${projectLC}-browser.5.js`, es5.browser )
es5.universal  = traceur.compile(es6.universal, { blockBinding:true }) + BYLINE
fs.writeFileSync( `dist/test/${projectLC}-universal.5.js`, es5.universal )




//// EDIT FILES

//// 1. support/demo.html                       Link to each usage example
updateDemoFile('support/demo.html', 'support')


//// 2. support/asset/js/ecmaswitch.js          `var classFiles = '...'` updated
updateECMASwitch('support/asset/js/ecmaswitch.js', mains)


//// 3. support/test.html                       ‘Development ES6’ links
updateTestFile('support/test.html', tests) // `tests` from previous step




//// UTILITY


////
function updateDemoFile (htmlPath, supportPath) {
    let out, start = 0, end = 0
      , html = (fs.readFileSync(htmlPath)+'').split('\n')
      , demos = fs.readdirSync(supportPath)
    for (; start<html.length; start++)
        if (0 < html[start].indexOf('BEGIN DYNAMIC SECTION //////////') ) break
    for (; end<html.length; end++)
        if (0 < html[end].indexOf('END DYNAMIC SECTION ////////////')   ) break
    if ( start == html.length || end == html.length)
        return console.warn(`Could not find dynamic section in ‘${htmlPath}’`)
    out = html.slice(0, start+1).concat([
`  //// This dynamic section is kept up to date by ‘oomtility/make.js’ ////// -->`])
    demos.forEach( name => {
        if ( 'demo-' != name.slice(0,5) || '.html' != name.slice(-5) ) return
        let i, file = (fs.readFileSync(supportPath+'/'+name)+'').split('\n')
        for (i=0; i<file.length; i++)
            if (0 < file[i].indexOf('<title>') ) break
        out.push(`
  <a href="${name}">
  ${i != file.length ? file[i].replace(/title>/g,'b>') : '  Untitled Demo'}
  </a><br>`)
    })
    out = out.concat( '', html.slice(end) )
    fs.writeFileSync( htmlPath, out.join('\n') )
}


////
function updateECMASwitch (jsPath, mains) {
    let out, start = 0, end = 0
      , js = (fs.readFileSync(jsPath)+'').split('\n')
    for (; start<js.length; start++)
        if (0 < js[start].indexOf('BEGIN DYNAMIC SECTION //////////') ) break
    for (; end<js.length; end++)
        if (0 < js[end].indexOf('END DYNAMIC SECTION ////////////')   ) break
    if ( start == js.length || end == js.length)
        return console.warn(`Could not find dynamic section in ‘${jsPath}’`)
    out = js.slice(0, start+1).concat([
`//// This dynamic section is kept up to date by ‘oomtility/make.js’ ////////////

var projectLC = '${projectLC}'
var classFiles = '${mains.filter(n=>'.6.js'==n.slice(-5)).map(n=>n.slice(0,-5))}'
`])
    out = out.concat( js.slice(end) )
    fs.writeFileSync( jsPath, out.join('\n') )
}


////
function updateTestFile (htmlPath, tests) {
    let out, start = 0, end = 0
      , html = (fs.readFileSync(htmlPath)+'').split('\n')
    for (; start<html.length; start++)
        if (0 < html[start].indexOf('BEGIN DYNAMIC SECTION //////////') ) break
    for (; end<html.length; end++)
        if (0 < html[end].indexOf('END DYNAMIC SECTION ////////////')   ) break
    if ( start == html.length || end == html.length)
        return console.warn(`Could not find dynamic section in ‘${htmlPath}’`)
    out = html.slice(0, start+1).concat([
`//// This dynamic section is kept up to date by ‘oomtility/make.js’ ////////////
`])
    tests.forEach( name => {
        if ( '-browser.6.js'   != name.slice(-13)
          && '-universal.6.js' != name.slice(-15) ) return
        out.push(`    , [ null, null, null, '../src/test/${name}' ]`)
    })
    out = out.concat( '', html.slice(end) )
    fs.writeFileSync( htmlPath, out.join('\n') )
}


//// Hack Uglify, to avoid warnings we don’t care about.
function tidyUglifyWarnings (uglify) {
    var origWarn = uglify.AST_Node.warn
    uglify.AST_Node.warn = function(txt, props) {
        if (! (
            'Dropping unused variable {name} [{file}:{line},{col}]' === txt
            && ( // 'WARN: Dropping unused variable HOMEPAGE [...]', etc
                'NAME'     === props.name
             || 'VERSION'  === props.name
             || 'HOMEPAGE' === props.name
            )
        ) ) origWarn(txt, props)
    }
    return uglify
}


//// Generate a configuration object for Uglify.
function minConfig(outFileName) {
    return {
       // fromString:  true
       // outFileName: outFileName
        warnings: true
      , output: { max_line_len:64 } // easier on the eye - but 500 would be safe
      , compress: {
            dead_code: true
          , global_defs: { DEBUG:false }
        }
    }
}

}()
