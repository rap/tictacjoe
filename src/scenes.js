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
      
      if(this.cellPattern(i, interval, cArray) == true) return true;

    }
  }

  this.cellPattern = function(i, interval, cArray) {
    for(var j = i + 1; j < cArray.length; j++) {
      if(cArray[j] == cArray[i] + interval) {

        for(var k = j + 1; k < cArray.length; k++) {
          if(cArray[k] == cArray[i] + 2*interval) {
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
    var bestMoveFlag = {
          id: null,
          moves: 0
        };

/*********************************************************************************
 ********************* code to determine immediate player win ********************
 *********************************************************************************/

    if(posX.length > 2) {

      for (var i = 0; i <= posX.length - 2; i++) {

        // vertical test first
        if (this.matchVert(i, 3, posX)) winFlag = true;

        // horizontal test next
        if (this.matchHoriz(i, 3, posX)) winFlag = true;

        // diagonal test
        if(posX[i] == 0 && this.cellPattern(i, 4, posX) == true) winFlag = true;
        if(posX[i] == 2 && this.cellPattern(i, 2, posX) == true) winFlag = true;
      }
    }
    
    if(winFlag) {
      Crafty.scene('Victory');
    } else {

/*********************************************************************************
 ********************* AI code to determine immediate any wins *******************
 *********************************************************************************/

      // then test for the AI being able to make a winning move
      if(posO.length >= 2) {

        for (var i = 0; i <= pos_.length; i++) {
          var tempO = this.posTransform(arrayO);

          // clone pos0, add current cell to it (to simulate choice), run tests
          // if tests check out on this fake array HALT!!!! AND COMMIT TO WINNING
          
          for (var j = 0; j < tempO.length; j++) {

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
          for (var j = 0; j < tempO.length; j++) {

            // vertical test first
            if (this.matchVert(i, 3, tempO)) winFlagAI = true;

            // horizontal test next
            if (this.matchHoriz(i, 3, tempO)) winFlagAI = true;

            // diagonal test
            if(tempO[i] == 0 && this.cellPattern(i, 4, tempO) == true) winFlagAI = true;
            if(tempO[i] == 2 && this.cellPattern(i, 2, tempO) == true) winFlagAI = true;
          }
        }
      }
        
      
    
      if(winFlagAI) {
        Crafty.scene('Defeat');
      } else {

/*******************************************************************************************
 *****************************  AI code to take next-best move *****************************
 *******************************************************************************************/
      
        
      // first let's look for a block
      
      if(posX.length >= 2) {

        for (var i = 0; i <= pos_.length; i++) {
          var tempX = this.posTransform(arrayX);
          

          //the same thing as before but with a bunch of copy/replacing 
          for (var j = 0; j < tempX.length; j++) {

            if (j == 0 && pos_[i] < tempX[j]) {
              // push this.coordArray_[i] onto beginning of tempCoordArrayX
              tempX.splice(0, 0, pos_[i]);
            } else if(tempX.length - 1 == j && pos_[i] > tempX[j]) {
              // push this.coordArray_[i] onto end of tempCoordArrayX
              tempX.push(pos_[i])
            } else if(pos_[i] > tempX[j] && pos_[i] < tempX[j + 1]) {
              // push it in between the two values
              tempX.splice(j + 1, 0, pos_[i]);
            }
          }

          for(var j = 0; j<tempX.length;j++){
            // vertical test first
           if (this.matchVert(j, 3, tempX)) {
                bestMoveFlag = {
                  id: array_[i],
                  moves: 9
                };
            }
            // horizontal test next
            if (this.matchHoriz(j, 3, tempX)) {
                 bestMoveFlag = {
                  id: array_[i],
                  moves: 9
                };
            }

            // diagonal test
           if(tempX[i] == 0 && this.cellPattern(j,4, tempX) == true) {
                      bestMoveFlag = {
                  id: array_[i],
                  moves: 9
                };
            }
            if(tempX[i] == 2 && this.cellPattern(j,2, tempX) == true) {
                      bestMoveFlag = {
                  id: array_[i],
                  moves: 9
                };
            }
         }
        }
      }
      
      
        // cache unusable rows and columns by determining which are in use by other player  
        for(var j = 0; j < posX.length; j++) {
          usedRows.push(Crafty(arrayX[j]).at().y);
          usedCols.push(Crafty(arrayX[j]).at().x);
          if (Crafty(arrayX[j])._dt == true) usedDT = true;
          if (Crafty(arrayX[j])._db == true) usedDB = true;
        }

        usedRows = _.uniq(usedRows.sort(function(a, b) { return a - b; }));
        usedCols = _.uniq(usedCols.sort(function(a, b) { return a - b; }));

        // if AI doesnt win, figure out what its best move is

        

        for (var i = 0; i < pos_.length; i++) {

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
        console.log(bestMoveFlag);
        // move to i
        Crafty(bestMoveFlag.id).removeComponent("Empty").addComponent("O");
      }
    }

  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('CellSet', this.moveCallback);
});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .text('YOU WIN THE GAME!')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);
 
  
  Crafty.e('2D, Canvas, Mouse, Color')
  .color("#ff1132")
  .attr({ x: 0, y: 0, w: Game.width(), h: Game.height() })
  .bind('Click', function(event) {
    Crafty.scene('Game');
  });

  // Give'em a round of applause!
  Crafty.audio.play('applause');

});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Defeat', function() {



  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .text('DUDE!!! YOU DEFINITELY LOST')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
    .css($text_css);

  Crafty.e('2D, Canvas, Mouse, Color')
    .color("#ff1132")
    .attr({ x: 0, y: 0, w: Game.width(), h: Game.height() })
    .bind('Click', function(event) {
      Crafty.scene('Game');
    });
 
  // Give'em a round of applause!
  Crafty.audio.play('applause');

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
  Crafty.load(['assets/tictactoe.png', 'assets/joes.jpg'], function(){
    // Once the image is loaded...
 
    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite
    Crafty.sprite(Game.map_grid.tile.width, 'assets/tictactoe.png', {
      spr_blank:    [0, 0],
      spr_o:        [0, 1]
    });

    Crafty.sprite(Game.map_grid.tile.width, 'assets/joes.jpg', {
      spr_joe0:    [0, 0],
      spr_joe1:    [0, 1],
      spr_joe2:    [0, 2],
      spr_joe3:    [0, 3],
      spr_joe4:    [0, 4],
      spr_joe5:    [0, 5],
      spr_joe6:    [0, 6],
      spr_joe7:    [0, 7],
      spr_joe8:    [0, 8],
      spr_joe9:    [0, 9]
    });

    // Now that our sprites are ready to draw, start the game
    Crafty.scene('Game');
  })
});

