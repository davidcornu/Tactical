class Tactical.Cell

  size: Tactical.Renderer::cellSize

  constructor: (mapX, mapY) ->
    @hover = false
    @type = 'empty'
    @mapX = mapX
    @mapY = mapY
    @x = 0
    @y = 0

  containsPoint: (pointX, pointY) ->
    inOuterBox = _([
      pointX > @x,
      pointX < @x + @size,
      pointY > @y,
      pointY < @y + @size
    ]).all(_.identity)
    return false unless inOuterBox

    inInnerBox = _([
      pointY > @y + 0.25 * @size,
      pointY < @y + 0.75 * @size
    ]).all(_.identity)
    return true if inInnerBox

    if pointY < @y + 0.5 * @size
      yIntersect = Math.abs(-(pointX - @x)/2 + 0.25 * @size) + @y
      return pointY > yIntersect
    else
      yIntersect = -Math.abs(-(pointX - @x)/2 + 0.25 * @size) + @size + @y
      return pointY < yIntersect