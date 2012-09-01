class Tactical.Player

  constructor: ->
    randC = -> Math.floor(Math.random() * 255)
    @color = "rgb(#{randC()},#{randC()},#{randC()})"
