Renderer = require('renderer').Renderer
Map      = require('map').Map

class exports.Game

  constructor: (options = {}) ->
    _(options).extend
      selector: '.main'
      playerCount: 5
      mapWidth: 30
      mapHeight: 40

    @$el = $(options.selector)
    @map = new Map(options.mapWidth, options.mapHeight, options.playerCount)

    @renderer = new Renderer(@map)
    @$el.html(@renderer.canvas)

    @renderer.drawMap()

    @_bindUserEvents()

  _bindUserEvents: ->
    # $(@renderer.canvas).on 'mousemove', (e) =>
    #   e.preventDefault()
    #   cell = @map.cellAtPoint(e.offsetX, e.offsetY)
    #   cell.hover = true if cell && cell.type != 'water'

    #   territory = @map.territoryForCell(cell)
    #   territory.hover = true if territory

    #   @renderer.clear()
    #   @renderer.drawMap()

    #   cell.hover = false if cell
    #   territory.hover = false if territory

    # $(@renderer.canvas).on 'click', (e) =>
    #   e.preventDefault()
    #   console.log(e.offsetX - Tactical.Renderer::padding, e.offsetY - Tactical.Renderer::padding)
      # cell = @map.cellAtPoint(e.offsetX, e.offsetY)
      # console.log(cell) if cell