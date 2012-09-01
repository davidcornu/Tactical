class Tactical.Polygon

  constructor: ->
    @vertices = []

  matchVertices: (a, b) ->
    standard = _([
      a[0][0] == b[0][0],
      a[0][1] == b[0][1],
      a[1][0] == b[1][0],
      a[1][1] == b[1][1]
    ]).all(_.identity)

    reverse = _([
      a[1][0] == b[0][0],
      a[1][1] == b[0][1],
      a[0][0] == b[1][0],
      a[0][1] == b[1][1]
    ]).all(_.identity)

    return (standard or reverse)

  hasVertex: (b) ->
    for a in @vertices
      return true if @matchVertices(a,b)
    return false

  removeVertex: (b) ->
    index = do =>
      for a, i in @vertices
        return i if @matchVertices(a,b)
      return null
    @vertices.splice(index, 1) if index

  merge: (polygon) ->
    for vertex in polygon.vertices
      if @hasVertex(vertex)
        @removeVertex(vertex)
      else
        @vertices.push(vertex)
    return @vertices

