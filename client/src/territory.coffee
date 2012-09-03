Polygon = require './polygon'

class Territory

  constructor: ->
    @cells = []
    @owner = null

  internalNeighborsOf: (cell) ->
    targets   = cell.neighboringCellCoords()
    neighbors = []
    for c in @cells
      for target in targets
        if target[0] == c.mapX && target[1] == c.mapY
          neighbors.push(c)
    return neighbors

  outerBordersOf: (cell) ->
    possibleBorders = [
      ['top', 'left'],
      ['top', 'right'],
      ['middle', 'left'],
      ['middle', 'right'],
      ['botton', 'left'],
      ['bottom', 'right']
    ]
    internalBorders = []
    for neighbor in @internalNeighborsOf(cell)
      internalBorders.push cell.relativePositionOf(neighbor)
    externalBorders = _(possibleBorders).reject (b) ->
      for iB in internalBorders
        return true if iB[0] == b[0] and iB[1] == b[1]
      return false

    return externalBorders

  buildPolygon: ->
    @polygon = new Polygon
    for cell in @cells
      @polygon.merge(cell)
    @polygon.optimize()

exports = Territory