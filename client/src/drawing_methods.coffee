Tactical.DrawingMethods =

  drawHexagon: (x, y, s) ->
    @ctx.moveTo(x + s/2, y)
    @ctx.beginPath()
    @ctx.lineTo x + s   , y + s/4
    @ctx.lineTo x + s   , y + (s/4)*3
    @ctx.lineTo x + s/2 , y + s
    @ctx.lineTo x       , y + (s/4)*3
    @ctx.lineTo x       , y + s/4
    @ctx.lineTo x + s/2 , y
    @ctx.closePath()

  strokeHexagon: (x, y, s) ->
    @drawHexagon(x, y, s)
    @ctx.stroke()

  fillHexagon: (x, y, s) ->
    @drawHexagon(x, y, s)
    @ctx.fill()

  clearHexagon: (x, y, s) ->
    @drawHexagon(x, y, s)
    @ctx.clip()
    @clear()
    @ctx.restore()

  clear: ->
    @ctx.clearRect(0, 0, @canvas.width, @canvas.height)