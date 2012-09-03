Renderer = require('renderer').Renderer

exports.MapUtils =

  eachCell: (callback) ->
    return unless typeof(callback) == 'function'
    for row in @rows
      for cell in row
        callback(cell)

  _validMapCoords: (mapX, mapY) ->
    mapX >= 0 and mapX < @width and mapY >= 0 and mapY < @height

  cellAt: (mapX, mapY) ->
    if @_validMapCoords(mapX, mapY) then @rows[mapY][mapX] else null

  cellAtPoint: (pointX, pointY) ->
    pointX -= Renderer::padding
    pointY -= Renderer::padding
    for row in @rows
      for cell in row
        return cell if cell.containsPoint(pointX, pointY)
    return null

  territoryAtPoint: (pointX, pointY) ->
    pointX -= Renderer::padding
    pointY -= Renderer::padding
    for territory in @territories
      for cell in territory.cells
        return territory if cell.containsPoint(pointX, pointY)
    return null

  territoryForCell: (cell) ->
    for territory in @territories
      return territory if _(territory.cells).include(cell)
    return null

  neighboringCells: (cell) ->
    targets = cell.neighboringCellCoords()
    neighbors = []
    for target in targets
      neighbors.push(@cellAt(target...)) if @_validMapCoords(target...)
    return neighbors

  territoryNeighbors: (territory) ->
    neighbors = []
    for cell in territory.cells
      for neighbor in @neighboringCells(cell)
        unless _(neighbors).include(neighbor) or _(territory.cells).include(neighbor)
          neighbors.push(neighbor)
    return neighbors