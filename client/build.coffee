stitch  = require 'stitch'
coffee  = require 'coffee-script'
path    = require 'path'
fs      = require 'fs'

# Build lib package

build = stitch.createPackage
  paths: [__dirname + '/src/lib']

build.compile (err, source) ->
  throw err if err
  filePath = path.resolve(__dirname, '../server/public/js/lib.js')
  fs.writeFile filePath, source, (err) ->
    throw err if err
    console.log 'Compiled js/lib.js'

# Build runner

fs.readFile __dirname + '/src/app.coffee', 'utf8', (err, data) ->
  throw err if err
  filePath = path.resolve(__dirname, '../server/public/js/app.js')
  fs.writeFile filePath, coffee.compile(data), (err) ->
    throw err if err
    console.log 'Compiled js/app.js'