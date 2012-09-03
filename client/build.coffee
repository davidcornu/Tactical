stitch  = require 'stitch'
fs      = require 'fs'

package = stitch.createPackage
  paths: [__dirname + '/src']

package.compile (err, source) ->
  fs.writeFile __dirname + '/js/app.js', source, (err) ->
    throw err if err
    console.log 'Compiled app.js'