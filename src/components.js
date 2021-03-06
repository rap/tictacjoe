// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },
 
  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

Crafty.c('Empty', {
  _val: "",
  init: function() {
    this.requires('spr_blank');
  },
  val: function(state) {
    return this._val;
  }
});

Crafty.c('X', {
  _val: "",
  joeArray: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  init: function() {
    // reload the array if the user plays enough games to empty it
    if (this.joeArray.length < 1) this.joeArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // remove the number from the array so we don't get any duplicates
    var joeVal = this.joeArray.splice(Crafty.math.randomInt(0, this.joeArray.length - 1), 1);
    var joeSprite = 'spr_joe' + joeVal;
    
    this.requires(joeSprite);
    this._val = "x";
  },
  val: function(state) {
    return this._val;
  }
});

Crafty.c('O', {
  _val: "",
  init: function() {
    this.requires('spr_o');
    this._val = "o";
  },
  val: function(state) {
    return this._val;
  }
});

Crafty.c('Diagonality', {
  _dt: false,
  _db: false,
  init: function() {},
  setDT: function(state) {
    this._dt = state;
    return this;
  },
  setDB: function(state) {
    this._db = state;
    return this;
  }
});

Crafty.c('Cell', {
  _position: 0,
  init: function() {
    this.requires('2D, Canvas, Grid, Mouse, Color, Diagonality, Empty')
      .color("#969696")
      .bind('MouseOver', function(data) {
        this.color("#696969");
      })
      .bind('MouseOut', function(data) {
        this.color("#969696");
      })
      .bind('Click', function(data){
        if(this.has("Empty")) this.cellToggle();
      });
  },

  position: function() {
    return this._position;
  },

  setPosition: function(x, y) {
    this._position = (x * 3) + y;
    return this;
  },

  cellToggle: function() {
    if(this.has("Empty")) {
      this.removeComponent("Empty").addComponent("X");
    }

    Crafty.trigger('CellSet', this);
  }

});
