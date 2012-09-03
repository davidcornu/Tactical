DrawingMethods = require('drawing_methods').DrawingMethods
Cell           = require('cell').Cell

class exports.Renderer

  cellSize: Cell::size
  padding: 10

  constructor: (map) ->
    _(@).extend(DrawingMethods)
    @map = map
    @canvas = document.createElement('canvas')
    @setCanvasSize()
    @ctx = @canvas.getContext('2d')

  setCanvasSize: ->
    @canvas.setAttribute 'width', 2 * @padding + @map.width * @cellSize + @cellSize/2
    @canvas.setAttribute 'height', do =>
      base = 2 * @padding + 1.5 * Math.floor(@map.height/2) * @cellSize
      base += if @map.height % 2 == 0 then @cellSize / 4 else @cellSize
      return base

  drawMap: ->
    t = @map.territories[0]
    @drawPolygon(t.polygon)
    @ctx.stroke()
    @resetCtx()

    t = @map.territories[1]
    @drawPolygon(t.polygon)
    @ctx.stroke()
    @resetCtx()

    # for cell in @map.waterCells
    #   @drawCell(cell, 'rgba(0,0,150,0.05)')

    # for territory in @map.territories
      # @drawPolygon(territory.polygon)
      # @ctx.fillStyle = territory.owner.color
      # @ctx.fill()
      # @resetCtx()

      # @drawPolygon(territory.polygon)
      # @ctx.lineWidth = 2
      # @ctx.strokeStyle = 'white'
      # @ctx.stroke()
      # @resetCtx()

      # for cell in territory.cells
      #   color = if territory.hover then 'white' else 'rgba(0,0,0,0.1)'
      #   @drawCell(cell, color)

  drawCell: (cell, color) ->
    @ctx.fillStyle = color
    @fillHexagon(cell.x + 1, cell.y + 1, @cellSize - 2)
    @strokeHexagon(cell.x + 0.5, cell.y + 0.5, @cellSize - 1) if cell.hover

    if cell.hasTroop
      @ctx.fillStyle = 'rgba(255,255,255,0.8)'
      @fillCircle(cell.x + @cellSize/2, cell.y + @cellSize/2, @cellSize/5)

    @resetCtx()

  resetCtx: ->
    @ctx.fillStyle = 'white'
    @ctx.strokeStyle = 'black'
    @ctx.lineWidth = 1