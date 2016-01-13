/**
 * Created by ashish on 12/1/16.
 */
var KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  82: 'restart'
};

data.lives = 3;
data.bombs = 0;
data.maxBombs = 1;
data.sideLength = 40;
data.bombTimer = 1000;
data.bombStrength = 1;
data.smokeOut = 250;
data.imortal = false;
data.imortalTime = 300;

var scoreBoard = [
  {img: "img/logo/bomb.png", text: data.maxBombs},
  {img: "img/logo/hero.png", text: data.lives}
];
LAY.run({
  data: data,
  when: {
    keydown: function(e) {
      var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
      if (KEY_CODES[keyCode]) {
        if(data.lives && KEY_CODES[keyCode] !== "restart") {
          this.level("/Container").attr("data.onKeyPress").call(undefined, KEY_CODES[keyCode])
        }
        else {
          location.reload();
        }
      }
    }
  },
  "GameOver": {
    exist: LAY.take("/", "data.lives").eq(0),
    props: {
      centerX: 0,
      centerY: 0,
      backgroundColor: LAY.color("aliceblue"),
      textColor: LAY.color("red"),
      textSize: 40,
      textWeight: "bold",
      textPadding: 15,
      text: "Game Over"
    }
  },
  "Container": {
    data: {
      onKeyPress: function(){}
    },
    props: {
      centerX:0
    },
    "Controls": {
      "Rows": {
        props: {
          width: LAY.take("/", "data.sideLength").multiply(data.cols).add(10),
          text: LAY.take("", "row.content"),
          textPaddingLeft: 10,
          backgroundColor: LAY.color("whitesmoke")
        },
        many: {
          rows: [
            "Up => 'UP Key' | Down => 'Down Key' | Left => 'Left Key' | Right => 'Right Key'",
            "Place Bomb => 'Space Bar'",
            "Restart Game => 'R'"
          ]
        }
      }
    },
    "ScoreBoard": {
      props: {
        top: LAY.take("../Controls", "bottom").add(15)
      },
      "Rows": {
        props: {
          border: generateBorders(2, "white", "grey"),
          width: 50,
          height: 30,
          backgroundColor: LAY.color("skyblue")
        },
        many: {
          $load: function() {
            this.level("../Rows").rowsUpdate("dummy", false);
          },
          rows: scoreBoard,
          formation: "totheright",
          fargs: {
            totheright: {
              gap: 25
            }
          }
        },
        "Image": {
          $type: "image",
          props: {
            centerY:0,
            width: 20,
            imageUrl: LAY.take(".../", "row.img")
          }
        },
        "Text": {
          props: {
            centerY:0,
            left: LAY.take("../Image", "right").add(10),
            text: LAY.take(".../", "row.text")
          }
        }
      }
    },
    "Board": {
      props: {
        top: LAY.take("../ScoreBoard", "bottom").add(10),
        width: LAY.take("/", "data.sideLength").multiply(data.cols).add(10),
        height: LAY.take("/", "data.sideLength").multiply(data.rows).add(10),
        border: generateBorders(5, "black", "black")
      },
      "Grid": {
        props: {
          width: LAY.take("/", "data.sideLength"),
          height: LAY.take("", "width"),
          backgroundColor: LAY.color("green")
        },
        many: {
          $load: function () {
            var self = this;
            this.level("../Grid").rowsUpdate("hasBomb", false);
            this.level("/Container").data("onKeyPress", function (key) {
              switch (key) {
                case "space":
                  placeBomb.call(self);
                  break;
                case "left":
                  moveLeft.call(self);
                  break;
                case "up":
                  moveUp.call(self);
                  break;
                case "right":
                  moveRight.call(self);
                  break;
                case "down":
                  moveDown.call(self);
                  break;
              }
            });
          },
          rows: data.cells,
          formation: "grid",
          fargs: {
            grid: {
              columns: data.cols
            }
          }
        },
        "Image": {
          $type: "image",
          props: {
            width: LAY.take("/", "data.sideLength"),
            height: LAY.take("", "width")
          },
          transition: {
            all: {duration: 200}
          },
          states: {
            stone: {
              onlyif: LAY.take(".../", "row.isStoneWall"),
              props: {
                imageUrl: "img/40/stone.png"
              }
            },
            brick: {
              onlyif: LAY.take(".../", "row.isBrickWall"),
              props: {
                imageUrl: "img/40/brick.png"
              }
            },
            hero: {
              onlyif: LAY.take(".../", "row.hasHero").and(LAY.take(".../", "row.hasBomb").not()),
              props: {
                imageUrl: "img/40/hero.png"
              }
            },
            heroFire: {
              onlyif: LAY.take(".../", "row.hasHero").and(LAY.take(".../", "row.isOnFire")),
              props: {
                imageUrl: "img/40/heroFire.png"
              }
            },
            heroBomb: {
              onlyif: LAY.take(".../", "row.hasHero").and(LAY.take(".../", "row.hasBomb")),
              props: {
                imageUrl: "img/40/heroBomb.png"
              }
            },
            grass: {
              onlyif: LAY.take(".../", "row.isEmpty").and(LAY.take(".../", "row.isOnFire").not()),
              props: {
                imageUrl: "img/40/dirt.png"
              }
            },
            fire:{
              onlyif: LAY.take(".../", "row.isOnFire"),
              props: {
                imageUrl: "img/40/fire.png"
              }
            },
            bomb: {
              onlyif: LAY.take(".../", "row.hasBomb"),
              props: {
                imageUrl: "img/40/bomb.png"
              }
            }
          }
        }
      }
    },
    "Images": {
      $type: "image",
      many: {
        rows: ["stone", "dirt", "brick", "hero", "bomb", "heroBomb", "heroFire", "fire", "brickFire"]
      },
      props: {
        imageUrl: LAY.take(function(img) {
          return "img/40/" + img + ".png";
        }).fn(LAY.take("", "row.content"))
      }
    }
  }
});

function generateBorders(w, c1, c2) {
  return {
    top: generateBorder("solid", w, c1),
    left: generateBorder("solid", w, c1),
    bottom: generateBorder("solid", w, c2),
    right: generateBorder("solid", w, c2),
  };
}

function generateBorder(s, w, c) {
  return { style: s, width: w, color: LAY.color(c) };
}

function placeBomb() {
  if(data.bombs < data.maxBombs) {
    var heroAt = _.findIndex(data.cells, function (cell) {
      return cell.hasHero;
    });
    if (!data.cells[heroAt].hasBomb) {
      data.cells[heroAt].hasBomb = true;
      this.level("../Grid").rowsCommit(data.cells);

      var self = this;
      setTimeout(function () {
        data.bombs--;
        haveABlast.call(self, heroAt);
      }, this.level("/").attr("data.bombTimer"));

      data.bombs++;
    }
  }
}

function haveABlast(bombAt) {
  var self = this;
  var burnoutsZones = getBurnOutZones(bombAt, self.level("/").attr("data.bombStrength"));
  _.each(burnoutsZones, function(zone){
    if(data.cells[zone].hasBomb) {
      data.cells[zone].hasBomb = false;
    }
    if(data.cells[zone].isBrickWall) {
      data.cells[zone].isBrickWall = false;
    }
    data.cells[zone].isOnFire = true;
    checkIfHeroIsInjured.call(self, zone);
  });

  self.level("../Grid").rowsCommit(data.cells);

  setTimeout(function() {
    _.each(burnoutsZones, function(zone) {
      data.cells[zone].isOnFire = false;
      data.cells[zone].isEmpty = true;
    });
    self.level("../Grid").rowsCommit(data.cells);
  }, self.level("/").attr("data.smokeOut"));
}

function getBurnOutZones(bombAt, strength) {
  var zones = [bombAt];
  var shields = {left: false, right: false, up: false, down: false};
  _.each(_.range(1, strength+1), function(i) {
    addZone(bombAt-i, "left");
    addZone(bombAt+i, "right");
    addZone(bombAt-i*data.cols, "up");
    addZone(bombAt+i*data.cols, "down");
  });
  return zones;

  function addZone(cell, shield) {
    if(cell<0 || cell>data.rows*data.cols) {
      return;
    }
    var burnout = canBurnOut(cell, shields[shield]);
    if(burnout > 1) {
      zones.push(cell);
    }
    if(burnout === 1 || burnout === 2) {
      shields[shield] = true;
    }
  }
  function canBurnOut(cell, shield) {
    if(shield) {
      return 0;
    }
    else if(data.cells[cell].isStoneWall) {
      return 1;
    }
    else if(data.cells[cell].isBrickWall) {
      return 2;
    }
    else {
      return 3;
    }
  }
}

function checkIfHeroIsInjured(cell) {
  if(!data.imortal) {
    if (data.cells[cell].hasHero && data.cells[cell].isOnFire) {
      data.lives--;
      data.imortal = true;

      setTimeout(function() {
        data.imortal = false;
      }, data.imortalTime);
    }

    this.level("/").data("lives", data.lives);
    scoreBoard[0].text = data.lives;
    this.level("/Container/ScoreBoard/Rows").rowsCommit(scoreBoard);
  }
}

function moveHero(c) {
  var heroAt = _.findIndex(data.cells, function(cell) {
    return cell.hasHero;
  });
  var cellToMove = data.cells[heroAt+c];
  if(!cellToMove.isStoneWall && !cellToMove.isBrickWall && !cellToMove.hasBomb) {
    if(!data.cells[heroAt].hasBomb) {
      data.cells[heroAt].isEmpty = true;
    }
    data.cells[heroAt].hasHero = false;
    cellToMove.hasHero = true;
    cellToMove.isEmpty = false;
    this.level("../Grid").rowsCommit(data.cells);
  }

  checkIfHeroIsInjured.call(this, heroAt+c);
}
function moveLeft() {
  moveHero.call(this, -1);
}
function moveUp() {
  moveHero.call(this, -data.cols);
}
function moveRight() {
  moveHero.call(this, 1);
}
function moveDown() {
  moveHero.call(this, data.cols);
}