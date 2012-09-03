Cell        = require('cell').Cell
Renderer    = require('renderer').Renderer
Player      = require('player').Player
PerlinNoise = require('perlin_noise').PerlinNoise
Territory   = require('territory').Territory

class exports.Map

  constructor: (width = 30, height = 40, playerCount) ->
    @width       = width
    @height      = height
    @playerCount = playerCount
    @buildRows()
    @generatePlayers()
    @generateWater()
    @generateTerritories()
    @assignTerritories()

  eachCell: (callback) ->
    return unless typeof(callback) == 'function'
    for row in @rows
      for cell in row
        callback(cell)

  buildRows: ->
    @rows = []
    for mapY in [0..(@height - 1)]
      row = []
      for mapX in [0..(@width - 1)]
        row.push(new Cell(mapX, mapY))
      @rows.push(row)

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

  generatePlayers: ->
    @players   = []
    colorNames = _.keys(Player::colors)
    for i in [1..@playerCount]
      @players.push(new Player(colorNames.pop()))

  generateWater: ->
    @waterCells = []
    size = Math.floor(Math.random() * 1000)/100
    threshold = 0.44
    @eachCell (cell) =>
      x = cell.mapX / @width
      y = cell.mapY / @height
      n = PerlinNoise.noise(size * x, size * y, 0.7)
      if n < threshold
        cell.type = 'water'
        @waterCells.push(cell)

  territoryNeighbors: (territory) ->
    neighbors = []
    for cell in territory.cells
      for neighbor in @neighboringCells(cell)
        unless _(neighbors).include(neighbor) or _(territory.cells).include(neighbor)
          neighbors.push(neighbor)
    return neighbors

  generateTerritories: ->
    @territories = []
    random = (min, max) -> min + Math.floor(Math.random() * (max - min))
    minSize = 6
    maxSize = 15
    emptyCells = []
    @eachCell (c) -> emptyCells.push(c) if c.type == 'empty'
    emptyCells = _(emptyCells).shuffle()

    # Main loop function, iterates over initial list of empty cells
    while emptyCells.length > 0
      targetSize = random(minSize, maxSize)
      territory  = new Territory
      firstCell  = emptyCells.pop()

      firstCell.type = 'terrain'
      territory.cells.push(firstCell)

      # Once first cell is added to teritory continue adding cells until it
      # reaches the target size
      candidates = []
      while territory.cells.length < targetSize and emptyCells.length > 0
        if candidates.length == 0 # Avoids recalculating candidates while closer ones are still available
          emptyNeighbors = _(@territoryNeighbors(territory)).filter((c) -> c.type == 'empty')
          candidates.push(_(emptyNeighbors).shuffle()...)

        break if candidates.length == 0

        candidate = candidates.pop()
        candidate.type = 'terrain'
        territory.cells.push(candidate)
        # Candidates can include cells recycled from previous attempts, so they
        # might not be in the emptyCells array
        index = emptyCells.indexOf(candidate)
        emptyCells.splice(index, 1) if index >= 0

      # Dump the territory if unable to make it the minimum size
      if territory.cells.length < minSize
        cell.type = 'empty' for cell in territory.cells # Some of these will be picked up
      else
        @territories.push(territory)

    # Check for any remaining empty neighbors and grow the territories accordingly
    # Also check for any islands to get rid of
    islands = []
    for territory in @territories
      emptyNeighbors = _(@territoryNeighbors(territory)).filter((c) -> c.type == 'empty')
      for neighbor in emptyNeighbors
        neighbor.type = 'terrain'
        territory.cells.push(neighbor)
      islands.push(territory) if _(@territoryNeighbors(territory)).all((c) -> c.type == 'water')

    # Actually get rid of islands
    for territory in islands
      @territories.splice(@territories.indexOf(territory), 1)
      for cell in territory.cells
        cell.type = 'water'
        @waterCells.push(cell)

    # Make any remaining cells water as they can't be assigned (usually a small number)
    remainingCells = []
    @eachCell (c) -> remainingCells.push(c) if c.type == 'empty'
    for cell in remainingCells
      cell.type = 'water'
      @waterCells.push(cell)

    # Generate territory polygons as we're done adding cells to them
    territory.buildPolygon() for territory in @territories

  assignTerritories: ->
    toGiveOut = _(@territories).shuffle()

    while toGiveOut.length > 0
      for player in @players
        territory.owner = player if territory = toGiveOut.pop()