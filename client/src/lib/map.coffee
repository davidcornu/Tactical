MapUtils    = require('map_utils').MapUtils
Cell        = require('cell').Cell
Player      = require('player').Player
PerlinNoise = require('perlin_noise').PerlinNoise
Territory   = require('territory').Territory

class exports.Map

  constructor: (options = {}) ->
    _(@).extend(MapUtils)
    _(options).extend
      width: 30
      height: 40
      playerCount: 5

    @options     = options
    @width       = options.width
    @height      = options.height
    @playerCount = options.playerCount

    job = null
    buildQueue = [
      'buildRows',
      'generatePlayers',
      'generateWater',
      'generateTerritories',
      'assignTerritories',
      'cleanUpCells',
      'buildPolygons',
      'optimizePolygons',
      'assignTerritories'
    ].reverse()

    builder = =>
      if buildQueue.length == 0
        options.onBuildComplete() if typeof(options.onBuildProgress) == 'function'
      else
        job = buildQueue.pop()
        options.onBuildProgress(job) if job and typeof(options.onBuildProgress) == 'function'
        @[job](builder)

    builder()

  buildRows: (callback) ->
    @rows = []

    for mapY in [0..(@height - 1)]
      row = []
      for mapX in [0..(@width - 1)]
        row.push(new Cell(mapX, mapY))
      @rows.push(row)

    callback() if typeof(callback) == 'function'

  generatePlayers: (callback) ->
    @players   = []
    colorNames = _.keys(Player::colors)

    for i in [1..@playerCount]
      @players.push(new Player(colorNames.pop()))

    callback() if typeof(callback) == 'function'

  generateWater: (callback) ->
    @waterCells = []
    # TODO - Move this further down the init stack to use territories instead
    # size = Math.floor(Math.random() * 1000)/100
    # threshold = 0.44

    # @eachCell (cell) =>
    #   x = cell.mapX / @width
    #   y = cell.mapY / @height
    #   n = PerlinNoise.noise(size * x, size * y, 0.7)
    #   if n < threshold
    #     cell.type = 'water'
    #     @waterCells.push(cell)

    callback() if typeof(callback) == 'function'

  generateTerritories: (callback) ->
    @territories = []
    random = (min, max) -> min + Math.floor(Math.random() * (max - min))
    minSize = 7
    maxSize = 15
    emptyCells = []
    @eachCell (c) -> emptyCells.push(c) if c.type == 'empty'
    emptyCells = _(emptyCells).shuffle()

    runner = =>
      if emptyCells.length == 0
        callback() if typeof(callback) == 'function'
      else
        targetSize = random(minSize, maxSize)
        territory  = new Territory
        firstCell  = emptyCells.pop()
        firstCell.type = 'terrain'
        territory.cells.push(firstCell)

        # Once first cell is added to teritory continue adding cells until it
        # reaches the target size
        candidates = _(@territoryNeighbors(territory)).filter((c) -> c.type == 'empty')
        if candidates.length >= 6
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

        setTimeout(runner, 0)

    runner()

  cleanUpCells: (callback) ->
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

    callback() if typeof(callback) == 'function'

  buildPolygons: (callback) ->
    territoryIndexQueue = [0...@territories.length]
    runner = =>
      if territoryIndexQueue.length == 0
        callback() if typeof(callback) == 'function'
      else
        # Generate territory polygons as we're done adding cells to them
        @territories[territoryIndexQueue.pop()].buildPolygon()
        setTimeout(runner, 0)
    runner()

  optimizePolygons: (callback) ->
    territoryIndexQueue = [0...@territories.length]
    territoryCount = @territories.length
    runner = =>
      if territoryIndexQueue.length == 0
        callback() if typeof(callback) == 'function'
      else
        @territories[territoryIndexQueue.pop()].polygon.optimize(runner)
        if typeof(@options.onBuildProgress) == 'function'
          percent = Math.floor(((territoryCount - territoryIndexQueue.length)/territoryCount)*100)
          @options.onBuildProgress('optimizePolygons', percent)
    runner()

  assignTerritories: (callback) ->
    # TODO - Give smallest territories to water
    toGiveOut = _(@territories).shuffle()
    waterPortion = 0.4
    for i in [0..Math.floor(toGiveOut.length*waterPortion)]
      for cell in toGiveOut.pop()
        cell.type = 'water'
        waterCells.push(cell)
    while toGiveOut.length > 0
      for player in @players
        territory.owner = player if territory = toGiveOut.pop()

    callback() if typeof(callback) == 'function'