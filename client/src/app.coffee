Game    = require('game').Game
Polygon = require('polygon').Polygon

jQuery ->
  window.game = new Game

  cell1 = game.map.cellAt(0,0)
  cell2 = game.map.cellAt(1,0)

  polygon = new Polygon
  polygon.merge2(cell1)
  console.log 'cell1', polygon.vertices
  polygon.merge2(cell2)
  console.log 'cell2', polygon.vertices