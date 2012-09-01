// Generated by CoffeeScript 1.3.3
(function() {

  Tactical.Map = (function() {

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
          row.push(new Tactical.Cell(mapX, mapY));
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
      pointX -= Tactical.Renderer.prototype.padding;
      pointY -= Tactical.Renderer.prototype.padding;
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
      pointX -= Tactical.Renderer.prototype.padding;
      pointY -= Tactical.Renderer.prototype.padding;
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
      colorNames = _.keys(Tactical.Player.prototype.colors);
      _results = [];
      for (i = _i = 1, _ref = this.playerCount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.players.push(new Tactical.Player(colorNames.pop())));
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
        n = Tactical.PerlinNoise.noise(size * x, size * y, 0.7);
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
        territory = new Tactical.Territory;
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
