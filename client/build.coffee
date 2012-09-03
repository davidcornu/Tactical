stitch  = require 'stitch'
coffee  = require 'coffee-script'
fs      = require 'fs'

# Build lib package

build = stitch.createPackage
  paths: [__dirname + '/src/lib']

build.compile (err, source) ->
  fs.writeFile __dirname + '/js/lib.js', source, (err) ->
    throw err if err
    console.log 'Compiled js/lib.js'

# Build runner

fs.readFile __dirname + '/src/app.coffee', 'utf8', (err, data) ->
  throw err if err
  fs.writeFile __dirname + '/js/app.js', coffee.compile(data), (err) ->
    throw err if err
    console.log 'Compiled js/app.js'