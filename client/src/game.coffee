class Tactical.Game

  constructor: (options = {}) ->
    _(options).extend
      selector: '.main'
      playerCount: 4
      mapWidth: 30
      mapHeight: 40

    @$el = $(options.selector)
    @map = new Tactical.Map(options.mapWidth, options.mapHeight, options.playerCount)

    @renderer = new Tactical.Renderer(@map)
    @$el.html(@renderer.canvas)

    @renderer.drawMap()

    @_bindUserEvents()

  _bindUserEvents: ->
    $(@renderer.canvas).on 'mousemove', (e) =>
      e.preventDefault()
      cell = @map.cellAtPoint(e.offsetX, e.offsetY)
      cell.hover = true if cell && cell.type != 'water'

      territory = @map.territoryForCell(cell)
      territory.hover = true if territory

      @renderer.clear()
      @renderer.drawMap()

      cell.hover = false if cell
      territory.hover = false if territory

    $(@renderer.canvas).on 'click', (e) =>
      e.preventDefault()
      cell = @map.cellAtPoint(e.offsetX, e.offsetY)
      console.log(cell) if cell
    #     neighbors = @map.neighboringCells(cell)
    #     console.log neighbors
    #     for neighbor in neighbors
    #       neighbor.hover = true
    #     cell.hover = true
    #     @renderer.clear()
    #     @renderer.drawMap()



