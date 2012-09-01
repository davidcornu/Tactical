class Tactical.Renderer

  cellSize: 20

  constructor: (map) ->
    _(@).extend(Tactical.DrawingMethods)
    @map = map
    @canvas = document.createElement('canvas')
    @setCanvasSize()
    @ctx = @canvas.getContext('2d')

  setCanvasSize: ->
    @canvas.setAttribute 'width',  @map.width * @cellSize + @cellSize/2
    @canvas.setAttribute 'height', do =>
      base = 1.5 * Math.floor(@map.height/2) * @cellSize
      base += if @map.height % 2 == 0 then @cellSize / 4 else @cellSize
      return base

  drawMap: ->
    for cell in @map.waterCells
      @drawCell(cell, 'rgba(0,0,150,0.05)')

    for territory in @map.territories
      for cell in territory.cells
        color = if territory.hover then 'white' else territory.owner.color
        @drawCell(cell, color)

  drawCell: (cell, color) ->
    cell.x = cell.mapX * @cellSize
    cell.y = cell.mapY * @cellSize * 0.75
    cell.x += @cellSize/2 if (cell.mapY + 1) % 2 == 0

    @ctx.fillStyle = color
    @fillHexagon(cell.x + 1, cell.y + 1, @cellSize - 2)
    @strokeHexagon(cell.x + 0.5, cell.y + 0.5, @cellSize - 1) if cell.hover
    @resetColors()

  resetColors: ->
    @ctx.fillStyle = 'white'
    @ctx.strokeStyle = 'black'
    @ctx.lineJoin = 'miter'