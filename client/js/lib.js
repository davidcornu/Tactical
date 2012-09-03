
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
  var Map, Renderer;

  Renderer = require('renderer').Renderer;

  Map = require('map').Map;

  exports.Game = (function() {

    function Game(options) {
      if (options == null) {
        options = {};
      }
      _(options).extend({
        selector: '.main',
        playerCount: 5,
        mapWidth: 30,
        mapHeight: 40
      });
      this.$el = $(options.selector);
      this.map = new Map(options.mapWidth, options.mapHeight, options.playerCount);
      this.renderer = new Renderer(this.map);
      this.$el.html(this.renderer.canvas);
      this.renderer.drawMap();
      this._bindUserEvents();
    }

    Game.prototype._bindUserEvents = function() {};

    return Game;

  })();

}).call(this);
}, "map": function(exports, require, module) {(function() {
  var Cell, PerlinNoise, Player, Renderer, Territory;

  Cell = require('cell').Cell;

  Renderer = require('renderer').Renderer;

  Player = require('player').Player;

  PerlinNoise = require('perlin_noise').PerlinNoise;

  Territory = require('territory').Territory;

  exports.Map = (function() {

    function Map(width, height, playerCount) {
      if (width == null) {
        width = 30;
      }
      if (height == null) {
        height = 40;
      }
      this.width = width;
      this.height = height;
      this.playerCount = playerCount;
      this.buildRows();
      this.generatePlayers();
      this.generateWater();
      this.generateTerritories();
      this.assignTerritories();
    }

    Map.prototype.eachCell = function(callback) {
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
    };

    Map.prototype.buildRows = function() {
      var mapX, mapY, row, _i, _j, _ref, _ref1, _results;
      this.rows = [];
      _results = [];
      for (mapY = _i = 0, _ref = this.height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; mapY = 0 <= _ref ? ++_i : --_i) {
        row = [];
        for (mapX = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; mapX = 0 <= _ref1 ? ++_j : --_j) {
          row.push(new Cell(mapX, mapY));
        }
        _results.push(this.rows.push(row));
      }
      return _results;
    };

    Map.prototype._validMapCoords = function(mapX, mapY) {
      return mapX >= 0 && mapX < this.width && mapY >= 0 && mapY < this.height;
    };

    Map.prototype.cellAt = function(mapX, mapY) {
      if (this._validMapCoords(mapX, mapY)) {
        return this.rows[mapY][mapX];
      } else {
        return null;
      }
    };

    Map.prototype.cellAtPoint = function(pointX, pointY) {
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
    };

    Map.prototype.territoryAtPoint = function(pointX, pointY) {
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
    };

    Map.prototype.territoryForCell = function(cell) {
      var territory, _i, _len, _ref;
      _ref = this.territories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        territory = _ref[_i];
        if (_(territory.cells).include(cell)) {
          return territory;
        }
      }
      return null;
    };

    Map.prototype.neighboringCells = function(cell) {
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
    };

    Map.prototype.generatePlayers = function() {
      var colorNames, i, _i, _ref, _results;
      this.players = [];
      colorNames = _.keys(Player.prototype.colors);
      _results = [];
      for (i = _i = 1, _ref = this.playerCount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.players.push(new Player(colorNames.pop())));
      }
      return _results;
    };

    Map.prototype.generateWater = function() {
      var size, threshold,
        _this = this;
      this.waterCells = [];
      size = Math.floor(Math.random() * 1000) / 100;
      threshold = 0.44;
      return this.eachCell(function(cell) {
        var n, x, y;
        x = cell.mapX / _this.width;
        y = cell.mapY / _this.height;
        n = PerlinNoise.noise(size * x, size * y, 0.7);
        if (n < threshold) {
          cell.type = 'water';
          return _this.waterCells.push(cell);
        }
      });
    };

    Map.prototype.territoryNeighbors = function(territory) {
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
    };

    Map.prototype.generateTerritories = function() {
      var candidate, candidates, cell, emptyCells, emptyNeighbors, firstCell, index, islands, maxSize, minSize, neighbor, random, remainingCells, targetSize, territory, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _results;
      this.territories = [];
      random = function(min, max) {
        return min + Math.floor(Math.random() * (max - min));
      };
      minSize = 6;
      maxSize = 15;
      emptyCells = [];
      this.eachCell(function(c) {
        if (c.type === 'empty') {
          return emptyCells.push(c);
        }
      });
      emptyCells = _(emptyCells).shuffle();
      while (emptyCells.length > 0) {
        targetSize = random(minSize, maxSize);
        territory = new Territory;
        firstCell = emptyCells.pop();
        firstCell.type = 'terrain';
        territory.cells.push(firstCell);
        candidates = [];
        while (territory.cells.length < targetSize && emptyCells.length > 0) {
          if (candidates.length === 0) {
            emptyNeighbors = _(this.territoryNeighbors(territory)).filter(function(c) {
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
        if (territory.cells.length < minSize) {
          _ref = territory.cells;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            cell.type = 'empty';
          }
        } else {
          this.territories.push(territory);
        }
      }
      islands = [];
      _ref1 = this.territories;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        territory = _ref1[_j];
        emptyNeighbors = _(this.territoryNeighbors(territory)).filter(function(c) {
          return c.type === 'empty';
        });
        for (_k = 0, _len2 = emptyNeighbors.length; _k < _len2; _k++) {
          neighbor = emptyNeighbors[_k];
          neighbor.type = 'terrain';
          territory.cells.push(neighbor);
        }
        if (_(this.territoryNeighbors(territory)).all(function(c) {
          return c.type === 'water';
        })) {
          islands.push(territory);
        }
      }
      for (_l = 0, _len3 = islands.length; _l < _len3; _l++) {
        territory = islands[_l];
        this.territories.splice(this.territories.indexOf(territory), 1);
        _ref2 = territory.cells;
        for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
          cell = _ref2[_m];
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
      for (_n = 0, _len5 = remainingCells.length; _n < _len5; _n++) {
        cell = remainingCells[_n];
        cell.type = 'water';
        this.waterCells.push(cell);
      }
      _ref3 = this.territories;
      _results = [];
      for (_o = 0, _len6 = _ref3.length; _o < _len6; _o++) {
        territory = _ref3[_o];
        _results.push(territory.buildPolygon());
      }
      return _results;
    };

    Map.prototype.assignTerritories = function() {
      var player, territory, toGiveOut, _results;
      toGiveOut = _(this.territories).shuffle();
      _results = [];
      while (toGiveOut.length > 0) {
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = this.players;
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            player = _ref[_i];
            if (territory = toGiveOut.pop()) {
              _results1.push(territory.owner = player);
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return Map;

  })();

}).call(this);
}, "perlin_noise": function(exports, require, module) {(function() {

  exports.PerlinNoise = (function() {

    function PerlinNoise() {}

    PerlinNoise.fade = function(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    };

    PerlinNoise.lerp = function(t, a, b) {
      return a + t * (b - a);
    };

    PerlinNoise.grad = function(hash, x, y, z) {
      var h, u, v;
      h = hash & 15;
      u = h < 8 ? x : y;
      v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    PerlinNoise.scale = function(n) {
      return (1 + n) / 2;
    };

    PerlinNoise.noise = function(x, y, z) {
      var A, AA, AB, B, BA, BB, X, Y, Z, i, lerp1, lerp2, p, permutation, u, v, w, _i, _ref;
      p = new Array(512);
      permutation = (_ref = []).concat.apply(_ref, [[151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36], [103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0], [26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56], [87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166], [77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55], [46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132], [187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109], [198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126], [255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183], [170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43], [172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112], [104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162], [241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106], [157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93], [222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180]]);
      for (i = _i = 0; _i <= 256; i = ++_i) {
        p[256 + i] = p[i] = permutation[i];
      }
      X = Math.floor(x) & 255;
      Y = Math.floor(y) & 255;
      Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      u = this.fade(x);
      v = this.fade(y);
      w = this.fade(z);
      A = p[X] + Y;
      AA = p[A] + Z;
      AB = p[A + 1] + Z;
      B = p[X + 1] + Y;
      BA = p[B] + Z;
      BB = p[B + 1] + Z;
      lerp1 = this.lerp(v, this.lerp(u, this.grad(p[AA], x, y, z), this.grad(p[BA], x - 1, y, z)), this.lerp(u, this.grad(p[AB], x, y - 1, z), this.grad(p[BB], x - 1, y - 1, z)));
      lerp2 = this.lerp(v, this.lerp(u, this.grad(p[AA + 1], x, y, z - 1), this.grad(p[BA + 1], x - 1, y, z - 1)), this.lerp(u, this.grad(p[AB + 1], x, y - 1, z - 1), this.grad(p[BB + 1], x - 1, y - 1, z - 1)));
      return this.scale(this.lerp(w, lerp1, lerp2));
    };

    return PerlinNoise;

  })();

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

    Polygon.prototype.optimize = function() {
      var corrected, firstVertex, lastPoint, match, matchIndex, nextPoint, optimizedVertices,
        _this = this;
      if (this.vertices.length === 0) {
        this.optimized = true;
      }
      if (this.optimized) {
        return;
      }
      optimizedVertices = [];
      lastPoint = null;
      nextPoint = null;
      firstVertex = null;
      match = null;
      matchIndex = null;
      corrected = null;
      while (this.vertices.length > 0) {
        if (!lastPoint) {
          firstVertex = this.vertices.pop();
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
      }
      this.vertices = optimizedVertices;
      return this.optimized = true;
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
      this.map = map;
      this.canvas = document.createElement('canvas');
      this.setCanvasSize();
      this.ctx = this.canvas.getContext('2d');
    }

    Renderer.prototype.setCanvasSize = function() {
      var _this = this;
      this.canvas.setAttribute('width', 2 * this.padding + this.map.width * this.cellSize + this.cellSize / 2);
      return this.canvas.setAttribute('height', (function() {
        var base;
        base = 2 * _this.padding + 1.5 * Math.floor(_this.map.height / 2) * _this.cellSize;
        base += _this.map.height % 2 === 0 ? _this.cellSize / 4 : _this.cellSize;
        return base;
      })());
    };

    Renderer.prototype.drawMap = function() {
      var t;
      t = this.map.territories[0];
      this.drawPolygon(t.polygon);
      this.ctx.stroke();
      return this.resetCtx();
    };

    Renderer.prototype.drawCell = function(cell, color) {
      this.ctx.fillStyle = color;
      this.fillHexagon(cell.x + 1, cell.y + 1, this.cellSize - 2);
      if (cell.hover) {
        this.strokeHexagon(cell.x + 0.5, cell.y + 0.5, this.cellSize - 1);
      }
      if (cell.hasTroop) {
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.fillCircle(cell.x + this.cellSize / 2, cell.y + this.cellSize / 2, this.cellSize / 5);
      }
      return this.resetCtx();
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
      var cell, _i, _len, _ref;
      this.polygon = new Polygon;
      _ref = this.cells;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        this.polygon.merge(cell);
      }
      return this.polygon.optimize();
    };

    return Territory;

  })();

}).call(this);
}});
