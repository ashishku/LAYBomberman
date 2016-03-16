/**
 * Created by ashish on 12/1/16.
 */
var data = (function(_, rows, cols) {
  var maxBricks = Math.ceil(rows*cols*20/100);
  var emptyCells = [];
  var cells = _.map(_.range(rows*cols), function(i) {
    var r = Math.floor(i/cols);
    var c = i - r*cols;

    if(c === cols-2 && r === rows - 2) {
      emptyCells.push(i);
      return {hasBomb: false, hasHero: true, isStoneWall: false, isBrickWall: false, isEmpty: false, isOnFire: false, power: null};
    }
    if(r === 0 || r === rows-1 || c === 0 || c === cols-1) {
      return {hasBomb: false, hasHero: false, isStoneWall: true, isBrickWall: false, isEmpty: false, isOnFire: false, power: null};
    }
    if(!(r%2)  && !(c%2)) {
      return {hasBomb: false, hasHero: false, isStoneWall: true, isBrickWall: false, isEmpty: false, isOnFire: false, power: null};
    }

    return {hasBomb: false, hasHero: false, isStoneWall: false, isBrickWall: false, isEmpty: true, isOnFire: false, power: null};
  });

  switch (_.random(1, 3)) {
    case 1:
      emptyCells.push(emptyCells[0] - 1);
      emptyCells.push(emptyCells[0] - 2);
      break;
    case 2:
      emptyCells.push(emptyCells[0] - cols);
      emptyCells.push(emptyCells[0] - 2*cols);
      break;
    case 3:
      emptyCells.push(emptyCells[0] - 1);
      emptyCells.push(emptyCells[0] - cols);
      break;
  }
  var bricks = 0;
  while (bricks < maxBricks) {
    if(putBrickWall(Math.floor(Math.random() * rows * cols))) {
      bricks++;
    }
  }
  _.each(_.range(_.random(1, 3)), function() {
    var powerAdded = false;
    while(!powerAdded) {
      var cell = _.random(0, cells.length-1);
      if(cells[cell].isBrickWall && !cells[cell].power) {
        cells[cell].power = ['life', 'strength', 'bomb'][_.random(0, 2)];
        powerAdded = true;
      }
    }
  });

  function putBrickWall(c) {
    if(cells[c].isStoneWall) {
      return false;
    }
    if(_.indexOf(emptyCells, c) > -1) {
      return false;
    }

    cells[c].isBrickWall = true;
    cells[c].isEmpty = false;
    return true;
  }

  return {
    rows: rows,
    cols: cols,
    cells: cells
  };
}(_, 15, 17));