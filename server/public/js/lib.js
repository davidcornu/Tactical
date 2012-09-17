
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"cell": function(exports, require, module) {(function() {

  exports.Cell = (function() {

    Cell.prototype.size = 20;

    function Cell(mapX, mapY) {
      this.hasTroop = false;
      this.hover = false;
      this.type = 'empty';
      this.mapX = mapX;
      this.mapY = mapY;
      this.isOnEvenRow = (this.mapY + 1) % 2 === 0;
      this.x = this.mapX * this.size;
      this.y = this.mapY * this.size * 0.75;
      if (this.isOnEvenRow) {
        this.x += this.size / 2;
      }
      this.buildPoints();
      this.buildVertices();
    }

    Cell.prototype.containsPoint = function(pointX, pointY) {
      var inInnerBox, inOuterBox, yIntersect;
      inOuterBox = _([pointX > this.x, pointX < this.x + this.size, pointY > this.y, pointY < this.y + this.size]).all(_.identity);
      if (!inOuterBox) {
        return false;
      }
      inInnerBox = _([pointY > this.y + 0.25 * this.size, pointY < this.y + 0.75 * this.size]).all(_.identity);
      if (inInnerBox) {
        return true;
      }
      if (pointY < this.y + 0.5 * this.size) {
        yIntersect = Math.abs(-(pointX - this.x) / 2 + 0.25 * this.size) + this.y;
        return pointY > yIntersect;
      } else {
        yIntersect = -Math.abs(-(pointX - this.x) / 2 + 0.25 * this.size) + this.size + this.y;
        return pointY < yIntersect;
      }
    };

    Cell.prototype.neighboringCellCoords = function() {
      var targetY, targets, _i, _len, _ref;
      targets = [[this.mapX + 1, this.mapY], [this.mapX - 1, this.mapY]];
      _ref = [this.mapY - 1, this.mapY + 1];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        targetY = _ref[_i];
        targets.push([this.mapX, targetY]);
        if (this.isOnEvenRow) {
          targets.push([this.mapX + 1, targetY]);
        } else {
          targets.push([this.mapX - 1, targetY]);
        }
      }
      return targets;
    };

    Cell.prototype.relativePositionOf = function(cell) {
      var position;
      position = [];
      if (this.mapY === this.mapY) {
        position.push('middle');
      } else if (this.mapY < this.mapY) {
        position.push('top');
      } else {
        position.push('bottom');
      }
      if (this.isOnEvenRow) {
        position.push((this.mapX <= this.mapX ? 'left' : 'right'));
      } else {
        position.push((this.mapX < this.mapX ? 'left' : 'right'));
      }
      return position;
    };

    Cell.prototype.buildPoints = function() {
      return this.points = [[this.x + this.size / 2, this.y], [this.x + this.size, this.y + this.size / 4], [this.x + this.size, this.y + this.size * 0.75], [this.x + this.size / 2, this.y + this.size], [this.x, this.y + this.size * 0.75], [this.x, this.y + this.size / 4]];
    };

    Cell.prototype.buildVertices = function() {
      var i, next, points, _i, _ref, _results;
      points = this.points;
      this.vertices = [];
      _results = [];
      for (i = _i = 0, _ref = points.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        next = (i === points.length - 1 ? 0 : i + 1);
        _results.push(this.vertices.push([points[i], points[next]]));
      }
      return _results;
    };

    return Cell;

  })();

}).call(this);
}, "drawing_methods": function(exports, require, module) {(function() {

  exports.DrawingMethods = {
    drawHexagon: function(x, y, s) {
      x += this.padding;
      y += this.padding;
      this.ctx.moveTo(x + s / 2, y);
      this.ctx.beginPath();
      this.ctx.lineTo(x + s, y + s / 4);
      this.ctx.lineTo(x + s, y + (s / 4) * 3);
      this.ctx.lineTo(x + s / 2, y + s);
      this.ctx.lineTo(x, y + (s / 4) * 3);
      this.ctx.lineTo(x, y + s / 4);
      this.ctx.lineTo(x + s / 2, y);
      return this.ctx.closePath();
    },
    strokeHexagon: function(x, y, s) {
      this.drawHexagon(x, y, s);
      return this.ctx.stroke();
    },
    fillHexagon: function(x, y, s) {
      this.drawHexagon(x, y, s);
      return this.ctx.fill();
    },
    clearHexagon: function(x, y, s) {
      this.drawHexagon(x, y, s);
      this.ctx.clip();
      this.clear();
      return this.ctx.restore();
    },
    drawPolygon: function(polygon) {
      var lastPoint, vertex, _i, _len, _ref;
      this.ctx.beginPath();
      lastPoint = null;
      _ref = polygon.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        if (!lastPoint || (lastPoint && vertex[0][0] !== lastPoint[0] && vertex[0][1] !== lastPoint[1])) {
          this.ctx.moveTo(this.padding + vertex[0][0], this.padding + vertex[0][1]);
        }
        this.ctx.lineTo(this.padding + vertex[1][0], this.padding + vertex[1][1]);
        lastPoint = vertex[1];
      }
      return this.ctx.closePath();
    },
    strokePolygon: function(polygon) {
      this.drawPolygon(polygon);
      return this.ctx.stroke();
    },
    drawCircle: function(centerX, centerY, radius) {
      centerX += this.padding;
      centerY += this.padding;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      return this.ctx.closePath();
    },
    fillCircle: function(centerX, centerY, radius) {
      this.drawCircle(centerX, centerY, radius);
      return this.ctx.fill();
    },
    clear: function() {
      return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

}).call(this);
}, "game": function(exports, require, module) {(function() {
  var Map, Renderer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Renderer = require('renderer').Renderer;

  Map = require('map').Map;

  exports.Game = (function() {

    function Game(options) {
      var $loadState, $loading,
        _this = this;
      if (options == null) {
        options = {};
      }
      this._bindUserEvents = __bind(this._bindUserEvents, this);

      _(options).extend({
        selector: '.main',
        playerCount: 5,
        mapWidth: 30,
        mapHeight: 40
      });
      this.$el = $(options.selector);
      $loading = $('.loading');
      $loadState = $loading.find('.state');
      this.map = new Map({
        width: options.mapWidth,
        height: options.mapHeight,
        playerCount: options.playerCount,
        onBuildProgress: function(job, percent) {
          var message;
          message = (function() {
            switch (job) {
              case 'buildRows':
                return 'Building map';
              case 'generatePlayers':
                return 'Creating players';
              case 'generateWater':
                return 'Adding water';
              case 'generateTerritories':
                return 'Building territories';
              case 'cleanUpCells':
                return 'Cleaning up';
              case 'buildPolygons':
                return 'Establishing borders';
              case 'optimizePolygons':
                return 'Optimizing';
              case 'assignTerritories':
                return 'Assigning territories';
            }
          })();
          if (percent) {
            message += " - " + percent + "%";
          }
          return $loadState.html(message);
        },
        onBuildComplete: function() {
          _this.renderer = new Renderer(_this.map);
          _this.renderer.drawMap();
          _this.$el.html(_this.renderer.canvas);
          _this.$el.removeClass('hidden');
          $loading.remove();
          return _this._bindUserEvents();
        }
      });
    }

    Game.prototype._bindUserEvents = function() {
      var lastTerritory,
        _this = this;
      lastTerritory = null;
      return $(this.renderer.canvas).on('mousedown touchstart', function(e) {
        var cell, territory;
        cell = _this.map.cellAtPoint(e.offsetX, e.offsetY);
        if (cell) {
          territory = _this.map.territoryForCell(cell);
          if (territory) {
            if (lastTerritory && lastTerritory !== territory) {
              _this.renderer.drawTerritory(lastTerritory);
            }
            lastTerritory = territory;
            territory.hover = true;
            _this.renderer.drawTerritory(territory);
            return territory.hover = false;
          } else {
            if (lastTerritory) {
              return _this.renderer.drawTerritory(lastTerritory);
            }
          }
        }
      });
    };

    return Game;

  })();

}).call(this);
}, "map": function(exports, require, module) {(function() {
  var Cell, MapUtils, Player, Territory;

  MapUtils = require('map_utils').MapUtils;

  Cell = require('cell').Cell;

  Player = require('player').Player;

  Territory = require('territory').Territory;

  exports.Map = (function() {

    function Map(options) {
      var buildQueue, builder, job,
        _this = this;
      if (options == null) {
        options = {};
      }
      _(this).extend(MapUtils);
      _(options).extend({
        width: 30,
        height: 40,
        playerCount: 5
      });
      this.options = options;
      this.width = options.width;
      this.height = options.height;
      this.playerCount = options.playerCount;
      job = null;
      buildQueue = ['buildRows', 'generatePlayers', 'generateTerritories', 'assignTerritories', 'cleanUpCells', 'buildPolygons', 'optimizePolygons'];
      builder = function() {
        if (buildQueue.length === 0) {
          if (typeof options.onBuildProgress === 'function') {
            return options.onBuildComplete();
          }
        } else {
          job = buildQueue.shift();
          if (job && typeof options.onBuildProgress === 'function') {
            options.onBuildProgress(job);
          }
          return _this[job](builder);
        }
      };
      builder();
    }

    Map.prototype.buildRows = function(callback) {
      var mapX, mapY, row, _i, _j, _ref, _ref1;
      this.rows = [];
      for (mapY = _i = 0, _ref = this.height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; mapY = 0 <= _ref ? ++_i : --_i) {
        row = [];
        for (mapX = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; mapX = 0 <= _ref1 ? ++_j : --_j) {
          row.push(new Cell(mapX, mapY));
        }
        this.rows.push(row);
      }
      if (typeof callback === 'function') {
        return callback();
      }
    };

    Map.prototype.generatePlayers = function(callback) {
      var colorNames, i, _i, _ref;
      this.players = [];
      colorNames = _.keys(Player.prototype.colors);
      for (i = _i = 1, _ref = this.playerCount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        this.players.push(new Player(colorNames.pop()));
      }
      if (typeof callback === 'function') {
        return callback();
      }
    };

    Map.prototype.generateTerritories = function(callback) {
      var emptyCells, maxSize, minSize, random, runner,
        _this = this;
      this.territories = [];
      this.waterCells = [];
      random = function(min, max) {
        return min + Math.floor(Math.random() * (max - min));
      };
      minSize = 7;
      maxSize = 15;
      emptyCells = [];
      this.eachCell(function(c) {
        if (c.type === 'empty') {
          return emptyCells.push(c);
        }
      });
      emptyCells = _(emptyCells).shuffle();
      runner = function() {
        var candidate, candidates, cell, emptyNeighbors, firstCell, index, targetSize, territory, _i, _len, _ref;
        if (emptyCells.length === 0) {
          if (typeof callback === 'function') {
            return callback();
          }
        } else {
          targetSize = random(minSize, maxSize);
          territory = new Territory;
          firstCell = emptyCells.pop();
          firstCell.type = 'terrain';
          territory.cells.push(firstCell);
          candidates = _(_this.territoryNeighbors(territory)).filter(function(c) {
            return c.type === 'empty';
          });
          if (candidates.length >= 6) {
            while (territory.cells.length < targetSize && emptyCells.length > 0) {
              if (candidates.length === 0) {
                emptyNeighbors = _(_this.territoryNeighbors(territory)).filter(function(c) {
                  return c.type === 'empty';
                });
                candidates.push.apply(candidates, _(emptyNeighbors).shuffle());
              }
              if (candidates.length === 0) {
                break;
              }
              candidate = candidates.pop();
              candidate.type = 'terrain';
              territory.cells.push(candidate);
              index = emptyCells.indexOf(candidate);
              if (index >= 0) {
                emptyCells.splice(index, 1);
              }
            }
          }
          if (territory.cells.length < minSize) {
            _ref = territory.cells;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cell = _ref[_i];
              cell.type = 'empty';
            }
          } else {
            _this.territories.push(territory);
          }
          return setTimeout(runner, 0);
        }
      };
      return runner();
    };

    Map.prototype.cleanUpCells = function(callback) {
      var cell, emptyNeighbors, islands, neighbor, remainingCells, territory, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1;
      islands = [];
      _ref = this.territories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        territory = _ref[_i];
        emptyNeighbors = _(this.territoryNeighbors(territory)).filter(function(c) {
          return c.type === 'empty';
        });
        for (_j = 0, _len1 = emptyNeighbors.length; _j < _len1; _j++) {
          neighbor = emptyNeighbors[_j];
          neighbor.type = 'terrain';
          territory.cells.push(neighbor);
        }
        if (_(this.territoryNeighbors(territory)).all(function(c) {
          return c.type === 'water';
        })) {
          islands.push(territory);
        }
      }
      for (_k = 0, _len2 = islands.length; _k < _len2; _k++) {
        territory = islands[_k];
        this.territories.splice(this.territories.indexOf(territory), 1);
        _ref1 = territory.cells;
        for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
          cell = _ref1[_l];
          cell.type = 'water';
          this.waterCells.push(cell);
        }
      }
      remainingCells = [];
      this.eachCell(function(c) {
        if (c.type === 'empty') {
          return remainingCells.push(c);
        }
      });
      for (_m = 0, _len4 = remainingCells.length; _m < _len4; _m++) {
        cell = remainingCells[_m];
        cell.type = 'water';
        this.waterCells.push(cell);
      }
      if (typeof callback === 'function') {
        return callback();
      }
    };

    Map.prototype.assignTerritories = function(callback) {
      var cell, i, player, territory, toGiveOut, waterPortion, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
      toGiveOut = _(this.territories).sortBy(function(t) {
        return t.cells.length;
      });
      waterPortion = 0.1;
      for (i = _i = 0, _ref = Math.floor(toGiveOut.length * waterPortion); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        territory = toGiveOut.shift();
        _ref1 = territory.cells;
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          cell = _ref1[_j];
          cell.type = 'water';
          this.waterCells.push(cell);
        }
        this.territories.splice(this.territories.indexOf(territory), 1);
      }
      while (toGiveOut.length > 0) {
        _ref2 = this.players;
        for (_k = 0, _len1 = _ref2.length; _k < _len1; _k++) {
          player = _ref2[_k];
          if (territory = toGiveOut.shift()) {
            territory.owner = player;
          }
        }
      }
      if (typeof callback === 'function') {
        return callback();
      }
    };

    Map.prototype.buildPolygons = function(callback) {
      var runner, territoryIndexQueue, _i, _ref, _results,
        _this = this;
      territoryIndexQueue = (function() {
        _results = [];
        for (var _i = 0, _ref = this.territories.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      runner = function() {
        if (territoryIndexQueue.length === 0) {
          if (typeof callback === 'function') {
            return callback();
          }
        } else {
          _this.territories[territoryIndexQueue.pop()].buildPolygon();
          return setTimeout(runner, 0);
        }
      };
      return runner();
    };

    Map.prototype.optimizePolygons = function(callback) {
      var runner, territoryCount, territoryIndexQueue, _i, _ref, _results,
        _this = this;
      territoryIndexQueue = (function() {
        _results = [];
        for (var _i = 0, _ref = this.territories.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      territoryCount = this.territories.length;
      runner = function() {
        var percent;
        if (territoryIndexQueue.length === 0) {
          if (typeof callback === 'function') {
            return callback();
          }
        } else {
          _this.territories[territoryIndexQueue.pop()].polygon.optimize(runner);
          if (typeof _this.options.onBuildProgress === 'function') {
            percent = Math.floor(((territoryCount - territoryIndexQueue.length) / territoryCount) * 100);
            return _this.options.onBuildProgress('optimizePolygons', percent);
          }
        }
      };
      return runner();
    };

    return Map;

  })();

}).call(this);
}, "map_utils": function(exports, require, module) {(function() {
  var Renderer;

  Renderer = require('renderer').Renderer;

  exports.MapUtils = {
    eachCell: function(callback) {
      var cell, row, _i, _len, _ref, _results;
      if (typeof callback !== 'function') {
        return;
      }
      _ref = this.rows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
            cell = row[_j];
            _results1.push(callback(cell));
          }
          return _results1;
        })());
      }
      return _results;
    },
    _validMapCoords: function(mapX, mapY) {
      return mapX >= 0 && mapX < this.width && mapY >= 0 && mapY < this.height;
    },
    cellAt: function(mapX, mapY) {
      if (this._validMapCoords(mapX, mapY)) {
        return this.rows[mapY][mapX];
      } else {
        return null;
      }
    },
    cellAtPoint: function(pointX, pointY) {
      var cell, row, _i, _j, _len, _len1, _ref;
      pointX -= Renderer.prototype.padding;
      pointY -= Renderer.prototype.padding;
      _ref = this.rows;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
          cell = row[_j];
          if (cell.containsPoint(pointX, pointY)) {
            return cell;
          }
        }
      }
      return null;
    },
    territoryAtPoint: function(pointX, pointY) {
      var cell, territory, _i, _j, _len, _len1, _ref, _ref1;
      pointX -= Renderer.prototype.padding;
      pointY -= Renderer.prototype.padding;
      _ref = this.territories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        territory = _ref[_i];
        _ref1 = territory.cells;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          cell = _ref1[_j];
          if (cell.containsPoint(pointX, pointY)) {
            return territory;
          }
        }
      }
      return null;
    },
    territoryForCell: function(cell) {
      var territory, _i, _len, _ref;
      _ref = this.territories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        territory = _ref[_i];
        if (_(territory.cells).include(cell)) {
          return territory;
        }
      }
      return null;
    },
    neighboringCells: function(cell) {
      var neighbors, target, targets, _i, _len;
      targets = cell.neighboringCellCoords();
      neighbors = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        if (this._validMapCoords.apply(this, target)) {
          neighbors.push(this.cellAt.apply(this, target));
        }
      }
      return neighbors;
    },
    territoryNeighbors: function(territory) {
      var cell, neighbor, neighbors, _i, _j, _len, _len1, _ref, _ref1;
      neighbors = [];
      _ref = territory.cells;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        _ref1 = this.neighboringCells(cell);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          neighbor = _ref1[_j];
          if (!(_(neighbors).include(neighbor) || _(territory.cells).include(neighbor))) {
            neighbors.push(neighbor);
          }
        }
      }
      return neighbors;
    }
  };

}).call(this);
}, "player": function(exports, require, module) {(function() {

  exports.Player = (function() {

    Player.prototype.colors = {
      blue: 'rgb(77,113,134)',
      teal: 'rgb(40,66,83)',
      red: 'rgb(224,84,46)',
      yellow: 'rgb(244,167,32)',
      orage: 'rgb(239,140,18)'
    };

    function Player(colorName) {
      if (colorName == null) {
        colorName = '';
      }
      this.colorName = colorName;
      if (!this.colors[colorName]) {
        this.colorName = _.shuffle(_.keys(this.colors))[0];
      }
      this.color = this.colors[this.colorName];
    }

    return Player;

  })();

}).call(this);
}, "polygon": function(exports, require, module) {(function() {

  exports.Polygon = (function() {

    function Polygon() {
      this.vertices = [];
      this.optimized = false;
    }

    Polygon.prototype.matchVertices = function(a, b) {
      return (a[0][0] === b[0][0] && a[0][1] === b[0][1] && a[1][0] === b[1][0] && a[1][1] === b[1][1]) || (a[1][0] === b[0][0] && a[1][1] === b[0][1] && a[0][0] === b[1][0] && a[0][1] === b[1][1]);
    };

    Polygon.prototype.merge = function(polygon) {
      var v, _i, _len, _ref;
      if (!polygon.vertices) {
        throw new Error('Merge target does not have vertices');
      }
      _ref = polygon.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        this.vertices.push(v);
      }
      this.deduplicate();
      return this.optimized = false;
    };

    Polygon.prototype.merge2 = function(polygon) {
      var firstPoint, lastIndex, lastPoint, nextVertex, optimizedVertices, pointsMatch, vertexStartingWithPoint, walk, walkingSelf, _ref,
        _this = this;
      if (!polygon.vertices) {
        throw new Error('Merge target does not have vertices');
      }
      this.optimized = true;
      vertexStartingWithPoint = function(vertices, targetPoint) {
        var startingPoint, vertex, _i, _len;
        for (_i = 0, _len = vertices.length; _i < _len; _i++) {
          vertex = vertices[_i];
          startingPoint = vertex[0];
          if (startingPoint[0] === targetPoint[0] && startingPoint[1] === targetPoint[1]) {
            return vertex;
          }
        }
        return null;
      };
      pointsMatch = function(point1, point2) {
        if (!(point1 && point2)) {
          return false;
        }
        return point1[0] === point2[0] && point1[1] === point2[1];
      };
      if (this.vertices.length === 0) {
        (_ref = this.vertices).push.apply(_ref, polygon.vertices);
        return;
      }
      optimizedVertices = [];
      firstPoint = this.vertices[0][0];
      lastPoint = null;
      lastIndex = 0;
      nextVertex = null;
      walkingSelf = true;
      walk = function() {
        console.log('walking');
        if (pointsMatch(firstPoint, lastPoint)) {

        } else {
          if (!lastPoint) {
            lastPoint = firstPoint;
          }
          if (walkingSelf) {
            console.log('walking self');
            if (nextVertex = vertexStartingWithPoint(polygon.vertices, lastPoint)) {
              walkingSelf = false;
              lastIndex = polygon.vertices.indexOf(nextVertex);
              optimizedVertices.push(nextVertex);
            } else {
              lastIndex += 1;
              optimizedVertices.push(_this.vertices[lastIndex]);
            }
          } else {
            console.log('walking target');
            if (nextVertex = vertexStartingWithPoint(_this.vertices, lastPoint)) {
              walkingSelf = true;
              lastPoint = _this.vertices.indexOf(nextVertex);
              optimizedVertices.push(nextVertex);
            } else {
              lastIndex += 1;
              optimizedVertices.push(polygon.vertices[lastIndex]);
            }
          }
          return walk();
        }
      };
      return walk();
    };

    Polygon.prototype.deduplicate = function() {
      var duplicateIndexes, i1, i2, index, v1, v2, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      duplicateIndexes = [];
      _ref = this.vertices;
      for (i1 = _i = 0, _len = _ref.length; _i < _len; i1 = ++_i) {
        v1 = _ref[i1];
        _ref1 = this.vertices;
        for (i2 = _j = 0, _len1 = _ref1.length; _j < _len1; i2 = ++_j) {
          v2 = _ref1[i2];
          if ((i1 !== i2) && (duplicateIndexes.indexOf(i2) < 0) && this.matchVertices(v1, v2)) {
            duplicateIndexes.push(i2);
          }
        }
      }
      _ref2 = _(duplicateIndexes).sortBy(_.identity).reverse();
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        index = _ref2[_k];
        _results.push(this.vertices.splice(index, 1));
      }
      return _results;
    };

    Polygon.prototype.optimize = function(callback) {
      var corrected, firstVertex, lastPoint, match, matchIndex, nextPoint, optimizedVertices, runner,
        _this = this;
      if (this.vertices.length === 0) {
        this.optimized = true;
      }
      if (this.optimized) {
        if (typeof callback === 'function') {
          callback();
        }
        return;
      }
      optimizedVertices = [];
      lastPoint = null;
      nextPoint = null;
      firstVertex = null;
      match = null;
      matchIndex = null;
      corrected = null;
      runner = function() {
        if (_this.vertices.length === 0) {
          _this.vertices = optimizedVertices;
          _this.optimized = true;
          if (typeof callback === 'function') {
            return callback();
          }
        } else {
          if (!lastPoint) {
            firstVertex = _this.vertices.pop();
            optimizedVertices.push(firstVertex);
            lastPoint = firstVertex[1];
          }
          nextPoint = (function() {
            var i, v, _i, _len, _ref;
            match = null;
            matchIndex = null;
            corrected = null;
            _ref = _this.vertices;
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              v = _ref[i];
              if (lastPoint[0] === v[0][0] && lastPoint[1] === v[0][1]) {
                corrected = [v[0], v[1]];
                match = v[1];
                matchIndex = i;
              } else if (lastPoint[0] === v[1][0] && lastPoint[1] === v[1][1]) {
                corrected = [v[1], v[0]];
                match = v[0];
                matchIndex = i;
              }
              if (match && matchIndex && corrected) {
                break;
              }
            }
            if (corrected) {
              optimizedVertices.push(corrected);
            }
            if (matchIndex) {
              _this.vertices.splice(matchIndex, 1);
            }
            return match;
          })();
          lastPoint = nextPoint ? nextPoint : null;
          return setTimeout(runner, 0);
        }
      };
      return runner();
    };

    return Polygon;

  })();

}).call(this);
}, "renderer": function(exports, require, module) {(function() {
  var Cell, DrawingMethods;

  DrawingMethods = require('drawing_methods').DrawingMethods;

  Cell = require('cell').Cell;

  exports.Renderer = (function() {

    Renderer.prototype.cellSize = Cell.prototype.size;

    Renderer.prototype.padding = 10;

    function Renderer(map) {
      _(this).extend(DrawingMethods);
      this.retina = window.devicePixelRatio > 1;
      this.map = map;
      this.canvas = document.createElement('canvas');
      this.setCanvasSize();
      this.ctx = this.canvas.getContext('2d');
      if (this.retina) {
        this.ctx.scale(2, 2);
      }
    }

    Renderer.prototype.setCanvasSize = function() {
      var baseHeight, baseWidth, multiplier,
        _this = this;
      baseWidth = 2 * this.padding + this.map.width * this.cellSize + this.cellSize / 2;
      baseHeight = (function() {
        var base;
        base = 2 * _this.padding + 1.5 * Math.floor(_this.map.height / 2) * _this.cellSize;
        base += _this.map.height % 2 === 0 ? _this.cellSize / 4 : _this.cellSize;
        return base;
      })();
      $(this.canvas).css('width', baseWidth);
      $(this.canvas).css('height', baseHeight);
      multiplier = this.retina ? 2 : 1;
      this.canvas.setAttribute('width', baseWidth * multiplier);
      return this.canvas.setAttribute('height', baseHeight * multiplier);
    };

    Renderer.prototype.drawMap = function() {
      var cell, territory, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.map.waterCells;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        this.drawCell(cell, 'rgba(0,0,150,0.05)');
      }
      _ref1 = this.map.territories;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        territory = _ref1[_j];
        _results.push(this.drawTerritory(territory));
      }
      return _results;
    };

    Renderer.prototype.drawCell = function(cell, color) {
      this.ctx.fillStyle = color;
      this.fillHexagon(cell.x + 1, cell.y + 1, this.cellSize - 2);
      this.ctx.lineWidth = 2;
      if (cell.hover) {
        this.strokeHexagon(cell.x, cell.y, this.cellSize);
      }
      if (cell.hasTroop) {
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.fillCircle(cell.x + this.cellSize / 2, cell.y + this.cellSize / 2, this.cellSize / 5);
      }
      return this.resetCtx();
    };

    Renderer.prototype.drawTerritory = function(territory) {
      var cell, color, _i, _len, _ref, _results;
      this.drawPolygon(territory.polygon);
      if (territory.owner) {
        this.ctx.fillStyle = territory.owner.color;
      } else {
        this.ctx.fillStyle = 'rgba(0,0,150,0.05)';
      }
      this.ctx.fill();
      this.resetCtx();
      this.drawPolygon(territory.polygon);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
      this.resetCtx();
      _ref = territory.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        color = territory.hover ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)';
        _results.push(this.drawCell(cell, color));
      }
      return _results;
    };

    Renderer.prototype.resetCtx = function() {
      this.ctx.fillStyle = 'white';
      this.ctx.strokeStyle = 'black';
      return this.ctx.lineWidth = 1;
    };

    return Renderer;

  })();

}).call(this);
}, "territory": function(exports, require, module) {(function() {
  var Polygon;

  Polygon = require('polygon').Polygon;

  exports.Territory = (function() {

    function Territory() {
      this.cells = [];
      this.owner = null;
    }

    Territory.prototype.internalNeighborsOf = function(cell) {
      var c, neighbors, target, targets, _i, _j, _len, _len1, _ref;
      targets = cell.neighboringCellCoords();
      neighbors = [];
      _ref = this.cells;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        for (_j = 0, _len1 = targets.length; _j < _len1; _j++) {
          target = targets[_j];
          if (target[0] === c.mapX && target[1] === c.mapY) {
            neighbors.push(c);
          }
        }
      }
      return neighbors;
    };

    Territory.prototype.outerBordersOf = function(cell) {
      var externalBorders, internalBorders, neighbor, possibleBorders, _i, _len, _ref;
      possibleBorders = [['top', 'left'], ['top', 'right'], ['middle', 'left'], ['middle', 'right'], ['botton', 'left'], ['bottom', 'right']];
      internalBorders = [];
      _ref = this.internalNeighborsOf(cell);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        neighbor = _ref[_i];
        internalBorders.push(cell.relativePositionOf(neighbor));
      }
      externalBorders = _(possibleBorders).reject(function(b) {
        var iB, _j, _len1;
        for (_j = 0, _len1 = internalBorders.length; _j < _len1; _j++) {
          iB = internalBorders[_j];
          if (iB[0] === b[0] && iB[1] === b[1]) {
            return true;
          }
        }
        return false;
      });
      return externalBorders;
    };

    Territory.prototype.buildPolygon = function() {
      var cell, _i, _len, _ref, _results;
      this.polygon = new Polygon;
      _ref = this.cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        _results.push(this.polygon.merge(cell));
      }
      return _results;
    };

    return Territory;

  })();

}).call(this);
}});
