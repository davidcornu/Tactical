exports.DrawingMethods =

  drawHexagon: (x, y, s) ->
    x += @padding
    y += @padding
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

  drawPolygon: (polygon) ->
    @ctx.beginPath()
    lastPoint = null
    for vertex in polygon.vertices
      if !lastPoint or (lastPoint and vertex[0][0] != lastPoint[0] and vertex[0][1] != lastPoint[1])
        @ctx.moveTo(@padding + vertex[0][0], @padding + vertex[0][1])
      @ctx.lineTo(@padding + vertex[1][0], @padding + vertex[1][1])
      lastPoint = vertex[1]
    @ctx.closePath()

  strokePolygon: (polygon) ->
    @drawPolygon(polygon)
    @ctx.stroke()

  drawCircle: (centerX, centerY, radius) ->
    centerX += @padding
    centerY += @padding
    @ctx.beginPath()
    @ctx.arc(centerX, centerY, radius, 0, Math.PI*2, true)
    @ctx.closePath()

  fillCircle: (centerX, centerY, radius) ->
    @drawCircle(centerX, centerY, radius)
    @ctx.fill()

  clear: ->
    @ctx.clearRect(0, 0, @canvas.width, @canvas.height)