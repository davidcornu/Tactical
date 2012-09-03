class exports.Cell

  size: 20

  constructor: (mapX, mapY) ->
    @hasTroop = false
    @hover = false
    @type = 'empty'
    @mapX = mapX
    @mapY = mapY
    @isOnEvenRow = (@mapY + 1) % 2 == 0
    @x = @mapX * @size
    @y = @mapY * @size * 0.75
    @x += @size/2 if @isOnEvenRow
    @buildPoints()
    @buildVertices()

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

  neighboringCellCoords: ->
    targets = [
      [@mapX + 1, @mapY],
      [@mapX - 1, @mapY]
    ]
    for targetY in [@mapY - 1, @mapY + 1]
      targets.push [@mapX, targetY]
      if @isOnEvenRow
        targets.push [@mapX + 1, targetY]
      else
        targets.push [@mapX - 1, targetY]
    return targets

  relativePositionOf: (cell) ->
    position = []
    if @mapY == @mapY
      position.push 'middle'
    else if @mapY < @mapY
      position.push 'top'
    else
      position.push 'bottom'

    if @isOnEvenRow
      position.push (if @mapX <= @mapX then 'left' else 'right')
    else
      position.push (if @mapX <  @mapX then 'left' else 'right')

    return position

  buildPoints: ->
    @points = [
      [@x + @size/2, @y],
      [@x + @size, @y + @size/4],
      [@x + @size, @y + @size*0.75],
      [@x + @size/2, @y + @size],
      [@x, @y + @size*0.75],
      [@x, @y + @size/4]
    ]

  buildVertices: ->
    points = @points
    @vertices = []
    for i in [0...points.length]
      next = (if i == points.length - 1 then 0 else i + 1)
      @vertices.push [points[i], points[next]]