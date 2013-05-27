Crafty.scene('Game', function() {
 
  // Place a cell at every square on our grid of 3x3 tiles
  for (var x = 0; x < Game.map_grid.width; x++) {
    for (var y = 0; y < Game.map_grid.height; y++) {
        // Place a cell entity at the current tile
        var newCell = Crafty.e("Cell").at(x, y);
        newCell.setPosition(x, y);
    }
  }

  for (var x = 0; x < Crafty("Cell").length; x++) {
    var tempcell = Crafty(Crafty("Cell")[x]);

    // set diagonality
    tempcell.setDT(tempcell.at().x == tempcell.at().y);
    tempcell.setDB(tempcell.at().x == (Game.map_grid.width - 1) - tempcell.at().y);
  }

  //********** functions below **********//

  this.posTransform = function(cArray) {
    var returnArray = [];

    for(var x = 0; x < cArray.length; x++) {
      returnArray.push(Crafty(cArray[x]).position());
    }

    return returnArray;
  }

  this.matchVert = function(i, interval, cArray) {

    // tests everything in first row
    if(cArray[i] == 0 || cArray[i] == interval || cArray[i] == interval * 2) {
      if(cArray[i + 1] == (cArray[i] + 1)) {
        if(cArray[i + 2] == (cArray[i] + 2)) {
          return true;
        }
      }
    }

    return false;
  }

  this.matchHoriz = function(i, interval, cArray) {
    // tests everything in first col
    if(cArray[i] >= 0 && cArray[i] <= interval - 1) {
      
      if(this.cellPattern(interval, cArray) == true) return true;

    }
  }

  this.cellPattern = function(interval, cArray) {
    for(j = i + 1; j < cArray.length; j++) {
      if(cArray[j] == cArray[i] + interval) {

        for(k = j + 1; k < cArray.length; k++) {
          if(cArray[k] == cArray[j] + interval) {
            return true;
          }
        }

      }
    }

    return false;
  }

  this.moveCallback = this.bind('CellSet', function(data) {

    var winFlag = false,
        winFlagAI = false,
        arrayX = Crafty("X"),
        arrayO = Crafty("O"),
        array_ = Crafty("Empty"),
        usedRows = [],
        usedCols = [],
        usedDT = false,
        usedDB = false;

    // set up position coordinate arrays for x, o, and blank
    var posX = this.posTransform(arrayX),
        posO = this.posTransform(arrayO),
        pos_ = this.posTransform(array_);

    // test for user's win condition
    if(posX.length > 2) {

      for (i = 0; i <= posX.length - 2; i++) {

        // vertical test first
        if (this.matchVert(i, 3, posX)) winFlag = true;

        // horizontal test next
        if (this.matchHoriz(i, 3, posX)) winFlag = true;

        // diagonal test
        if(posX[i] == 0 && this.cellPattern(4, posX) == true) winFlag = true;
        if(posX[i] == 2 && this.cellPattern(2, posX) == true) winFlag = true;
      }
    }
    // TODO: do something if user wins
    // console.log(winFlag);



    // then test for the AI being able to make a winning move
    if(posO.length >= 2) {

      var tempO = posO;

      for (i = 0; i <= pos_.length; i++) {

        // clone pos0, add current cell to it (to simulate choice), run tests
        // if tests check out on this fake array HALT!!!! AND COMMIT TO WINNING
        
        for (j = 0; j < tempO.length, j++;) {
          if (j == 0 && pos_[i] < tempO[j]) {
            // push this.coordArray_[i] onto beginning of tempCoordArrayO
            tempO.splice(0, 0, pos_[i]);
          } else if(tempO.length - 1 == j && pos_[i] > tempO[j]) {
            // push this.coordArray_[i] onto end of tempCoordArrayO
            tempO.push(pos_[i])
          } else if(pos_[i] > tempO[j] && pos_[i] < tempO[j + 1]) {
            // push it in between the two values
            tempO.splice(j + 1, 0, pos_[i]);
          }
          
        }

        // vertical test first
        if (this.matchVert(i, 3, tempO)) winFlagAI = true;

        // horizontal test next
        if (this.matchHoriz(i, 3, tempO)) winFlagAI = true;

        // diagonal test
        if(tempO[i] == 0 && this.cellPattern(4, tempO) == true) winFlagAI = true;
        if(tempO[i] == 2 && this.cellPattern(2, tempO) == true) winFlagAI = true;
      }
    }

    // TODO: do something with winFlagAI



    // cache unusable rows and columns by determining which are in use by other player  
    for(j = 0; j < posX.length; j++) {
      usedRows.push(Crafty(arrayX[j]).at().y);
      usedCols.push(Crafty(arrayX[j]).at().x);
      if (Crafty(arrayX[j])._dt == true) usedDT = true;
      if (Crafty(arrayX[j])._db == true) usedDB = true;
    }

    usedRows = _.uniq(usedRows.sort(function(a, b) { return a - b; }));
    usedCols = _.uniq(usedCols.sort(function(a, b) { return a - b; }));

    // if AI doesnt win, figure out what its best move is

    var bestMoveFlag = {
      id: null,
      moves: 0
    };

    for (i = 0; i < pos_.length; i++) {

      var curCell = Crafty(array_[i]),
          tempMoveFlag = {
            id: array_[i],
            moves: 0
          };

      // figure out if a win is possible in v or in h
      if(_.intersection([curCell.at().y], usedRows).length < 1) tempMoveFlag.moves = tempMoveFlag.moves + 1;
      if(_.intersection([curCell.at().x], usedCols).length < 1) tempMoveFlag.moves = tempMoveFlag.moves + 1;

      // if diagonal, figure out if diag wins are still possible
      if(curCell._dt && curCell._dt != usedDT) tempMoveFlag.moves = tempMoveFlag.moves + 1;
      if(curCell._db && curCell._db != usedDB) tempMoveFlag.moves = tempMoveFlag.moves + 1;

      // if potential move sum > bestMoveFlag moves val, push i and moves to flag
      if(bestMoveFlag.moves < tempMoveFlag.moves) {
        bestMoveFlag = tempMoveFlag;
      }
    }

    // move to i
    Crafty(bestMoveFlag.id).removeComponent("Empty").addComponent("O");

  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('CellSet', this.show_victory);
});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .text('All villages visited!')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);
 
  // Give'em a round of applause!
  Crafty.audio.play('applause');

  // After a short delay, watch for the player to press a key, then restart
  // the game when a key is pressed
  var delay = true;
  setTimeout(function() { delay = false; }, 5000);

  this.restart_game = this.bind('KeyDown', function() {
    if (!delay) {
      Crafty.scene('Game');
    }
  });
}, function() {
  this.unbind('KeyDown', this.restart_game);
});


// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
  // Draw some text for the player to see in case the file
  //  takes a noticeable amount of time to load
  Crafty.e('2D, DOM, Text')
    .text('Loading; please wait...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);
 
  // Load our sprite map image
  Crafty.load(['assets/tictactoe.png'], function(){
    // Once the image is loaded...
 
    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite
    Crafty.sprite(100, 'assets/tictactoe.png', {
      spr_blank:    [0, 0],
      spr_x:        [1, 0],
      spr_o:        [0, 1]
    });

    // Now that our sprites are ready to draw, start the game
    Crafty.scene('Game');
  })
});

