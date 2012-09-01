class Tactical.Player

  colors:
    blue:   'rgba(77,113,134,0.5)'
    teal:   'rgba(40,66,83,0.5)'
    red:    'rgba(224,84,46,0.5)'
    yellow: 'rgba(244,167,32,0.5)'
    orage:  'rgba(239,140,18,0.5)'

  constructor: (colorName = '') ->
    @colorName = colorName
    @colorName = _.shuffle(_.keys(@colors))[0] unless @colors[colorName]
    @color     = @colors[@colorName]