Renderer = require('renderer').Renderer
Map      = require('map').Map

class exports.Game

  constructor: (options = {}) ->
    _(options).extend
      selector: '.main'
      playerCount: 5
      mapWidth: 30
      mapHeight: 40

    @$el = $(options.selector)
    $loading = $('.loading')
    $loadState = $loading.find('.state')
    @map = new Map
      width: options.mapWidth
      height: options.mapHeight
      playerCount: options.playerCount
      onBuildProgress: (job, percent) ->
        message = do ->
          switch job
            when 'buildRows'            then 'Building map'
            when 'generatePlayers'      then 'Creating players'
            when 'generateWater'        then 'Adding water'
            when 'generateTerritories'  then 'Building territories'
            when 'cleanUpCells'         then 'Cleaning up'
            when 'buildPolygons'        then 'Establishing borders'
            when 'optimizePolygons'     then 'Optimizing'
            when 'assignTerritories'    then 'Assigning territories'
        message += " - #{percent}%" if percent
        $loadState.html(message)

      onBuildComplete: =>
        @renderer = new Renderer(@map)
        @renderer.drawMap()
        @$el.html(@renderer.canvas)
        @$el.removeClass('hidden')
        $loading.remove()
        @_bindUserEvents()

  _bindUserEvents: =>
    lastTerritory = null
    $(@renderer.canvas).on 'mousedown touchstart', (e) =>
      cell = @map.cellAtPoint(e.offsetX, e.offsetY)
      if cell
        territory = @map.territoryForCell(cell)
        if territory
          @renderer.drawTerritory(lastTerritory) if lastTerritory and lastTerritory != territory
          lastTerritory = territory
          territory.hover = true
          # cell.hover = true
          @renderer.drawTerritory(territory)
          # cell.hover = false
          territory.hover = false
        else
          @renderer.drawTerritory(lastTerritory) if lastTerritory

    # $(@renderer.canvas).on 'click', (e) =>
    #   e.preventDefault()
    #   territory = @map.territoryAtPoint(e.offsetX, e.offsetY)
    #   console.log JSON.stringify(territory.polygon.vertices)
