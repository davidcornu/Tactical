DrawingMethods = require('drawing_methods').DrawingMethods
Cell = require('cell').Cell

class exports.Renderer

  cellSize: Cell::size
  padding: 10

  constructor: (map) ->
    _(@).extend(DrawingMethods)
    @retina = window.devicePixelRatio > 1
    @map = map
    @canvas = document.createElement('canvas')
    @setCanvasSize()
    @ctx = @canvas.getContext('2d')
    @ctx.scale(2,2) if @retina

  setCanvasSize: ->
    baseWidth = 2 * @padding + @map.width * @cellSize + @cellSize/2
    baseHeight = do =>
      base = 2 * @padding + 1.5 * Math.floor(@map.height/2) * @cellSize
      base += if @map.height % 2 == 0 then @cellSize / 4 else @cellSize
      return base

    $(@canvas).css('width', baseWidth)
    $(@canvas).css('height', baseHeight)

    multiplier = if @retina then 2 else 1

    @canvas.setAttribute 'width', baseWidth * multiplier
    @canvas.setAttribute 'height', baseHeight * multiplier

  drawMap: ->
    for cell in @map.waterCells
      @drawCell(cell, 'rgba(0,0,150,0.05)')

    @drawTerritory(territory) for territory in @map.territories

  drawCell: (cell, color) ->
    @ctx.fillStyle = color
    @fillHexagon(cell.x + 1, cell.y + 1, @cellSize - 2)
    @ctx.lineWidth = 2
    @strokeHexagon(cell.x, cell.y, @cellSize) if cell.hover

    if cell.hasTroop
      @ctx.fillStyle = 'rgba(255,255,255,0.8)'
      @fillCircle(cell.x + @cellSize/2, cell.y + @cellSize/2, @cellSize/5)

    @resetCtx()

  drawTerritory: (territory) ->
    @drawPolygon(territory.polygon)
    if territory.owner
      @ctx.fillStyle = territory.owner.color
    else
      @ctx.fillStyle = 'rgba(0,0,150,0.05)'
    @ctx.fill()
    @resetCtx()

    @drawPolygon(territory.polygon)
    @ctx.lineWidth = 2
    @ctx.strokeStyle = 'white'
    @ctx.stroke()
    @resetCtx()

    for cell in territory.cells
      color = if territory.hover then 'rgba(255,255,255,0.5)' else 'rgba(255,255,255,0.1)'
      @drawCell(cell, color)

  resetCtx: ->
    @ctx.fillStyle = 'white'
    @ctx.strokeStyle = 'black'
    @ctx.lineWidth = 1