class exports.Player

  colors:
    blue:   'rgb(77,113,134)'
    teal:   'rgb(40,66,83)'
    red:    'rgb(224,84,46)'
    yellow: 'rgb(244,167,32)'
    orage:  'rgb(239,140,18)'

  constructor: (colorName = '') ->
    @colorName = colorName
    @colorName = _.shuffle(_.keys(@colors))[0] unless @colors[colorName]
    @color     = @colors[@colorName]