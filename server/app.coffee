express = require('express')
app     = express()
server  = require('http').createServer(app)
io      = require('socket.io').listen(server)
path    = require('path')

app.configure ->
  app.set 'port', process.env.PORT || 3000
  app.set 'views', __dirname + '/views'
  app.use express.logger('dev')
  app.use app.router
  app.use express.static(path.join(__dirname, 'public'))
  # app.set 'view engine', 'eco'
  # app.use express.favicon()
  # app.use express.bodyParser()
  # app.use express.methodOverride()

app.configure 'development', ->
  app.use express.errorHandler()

server.listen app.get('port'), ->
  console.log "Express server listening on port #{app.get('port')}"

io.sockets.on 'connection', (socket) ->
  socket.emit 'news', hello: 'world'
  socket.on 'my other event', (data) -> console.log(data)