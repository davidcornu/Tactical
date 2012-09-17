class exports.Polygon

  constructor: ->
    @vertices = []
    @optimized = false

  matchVertices: (a, b) ->
    (a[0][0] == b[0][0] and
     a[0][1] == b[0][1] and
     a[1][0] == b[1][0] and
     a[1][1] == b[1][1]) or
    (a[1][0] == b[0][0] and
     a[1][1] == b[0][1] and
     a[0][0] == b[1][0] and
     a[0][1] == b[1][1])

  merge: (polygon) ->
    throw new Error('Merge target does not have vertices') unless polygon.vertices
    @vertices.push(v) for v in polygon.vertices
    @deduplicate()
    @optimized = false

  merge2: (polygon) ->
    throw new Error('Merge target does not have vertices') unless polygon.vertices

    @optimized = true

    vertexStartingWithPoint = (vertices, targetPoint) ->
      for vertex in vertices
        startingPoint = vertex[0]
        if startingPoint[0] == targetPoint[0] and startingPoint[1] == targetPoint[1]
          return vertex
      return null

    pointsMatch = (point1, point2) ->
      return false unless point1 && point2
      point1[0] == point2[0] && point1[1] == point2[1]

    if @vertices.length == 0
      @vertices.push(polygon.vertices...)
      return

    optimizedVertices = []
    firstPoint  = @vertices[0][0]
    lastPoint   = null
    lastIndex   = 0
    nextVertex  = null
    walkingSelf = true

    walk = =>
      if pointsMatch(firstPoint, lastPoint)
        return
      else
        lastPoint = firstPoint unless lastPoint
        if walkingSelf
          if nextVertex = vertexStartingWithPoint(polygon.vertices, lastPoint)
            walkingSelf = false
            lastIndex   = polygon.vertices.indexOf(nextVertex)
            optimizedVertices.push(nextVertex)
          else
            lastIndex += 1
            optimizedVertices.push(@vertices[lastIndex])
        else
          if nextVertex = vertexStartingWithPoint(@vertices, lastPoint)
            walkingSelf = true
            lastPoint   = @vertices.indexOf(nextVertex)
            optimizedVertices.push(nextVertex)
          else
            lastIndex += 1
            optimizedVertices.push(polygon.vertices[lastIndex])
        walk()

    walk()

  deduplicate: ->
    duplicateIndexes = []
    for v1, i1 in @vertices
      for v2, i2 in @vertices
        if (i1 != i2) and (duplicateIndexes.indexOf(i2) < 0) and @matchVertices(v1, v2)
          duplicateIndexes.push(i2)
    @vertices.splice(index, 1) for index in _(duplicateIndexes).sortBy(_.identity).reverse()

  optimize: (callback) ->
    @optimized = true if @vertices.length == 0
    if @optimized
      callback() if typeof(callback) == 'function'
      return

    optimizedVertices = []
    lastPoint   = null
    nextPoint   = null
    firstVertex = null
    match       = null
    matchIndex  = null
    corrected   = null

    runner = =>
      if @vertices.length == 0
        @vertices  = optimizedVertices
        @optimized = true
        callback() if typeof(callback) == 'function'
      else
        unless lastPoint
          firstVertex = @vertices.pop()
          optimizedVertices.push(firstVertex)
          lastPoint = firstVertex[1]

        nextPoint = do =>
          match      = null
          matchIndex = null
          corrected  = null
          for v, i in @vertices
            if lastPoint[0] == v[0][0] and lastPoint[1] == v[0][1]
              corrected  = [v[0], v[1]]
              match      = v[1]
              matchIndex = i
            else if lastPoint[0] == v[1][0] and lastPoint[1] == v[1][1]
              corrected  = [v[1], v[0]]
              match      = v[0]
              matchIndex = i
            break if match && matchIndex && corrected

          optimizedVertices.push(corrected) if corrected
          @vertices.splice(matchIndex, 1)   if matchIndex
          return match

        lastPoint = if nextPoint then nextPoint else null

        setTimeout(runner, 0)

    runner()

