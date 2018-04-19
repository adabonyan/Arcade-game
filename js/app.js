"use strict";

var GamePiece = function (sprite, x, y, speedX, speedY, score) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.score = score;
};

// Draw gamepiece on the screen, required method for game
GamePiece.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Enemy class
var Enemy = function (sprite, x, y, speedX) {
    GamePiece.call(this, sprite, x, y, speedX);
};

Enemy.prototype = Object.create(GamePiece.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
    if (this.x >= 500) {
        this.x = 0;
    }
    this.x += this.speedX;
};

//check for collision all the time using actual size enemies and player
//width:height player 84:83. enemy 100:71
Enemy.prototype.checkCollission = function(i) {
    if (this.x < player.x + 84 && this.x + 100 > player.x && this.y < player.y + 83 && 71 + this.y > player.y) {
        //Collision has occurred. Reset game
        player.resetPlayer();
        infoBoard.update("U just lost out");
        player.award();
    }
};

// Create enemies
var enemy1 = new Enemy('images/enemy-bug.png', -200, 135, 4);
var enemy2 = new Enemy('images/enemy-bug.png', -400, 225, 3);
var enemy3 = new Enemy('images/enemy-bug.png', 0, 300, 2);

// Place all enemy objects in an array called allEnemies
var allEnemies = [enemy1, enemy2, enemy3];

//Player class
var Player = function (sprite, x, y, speedX, speedY, score) {
    GamePiece.call(this, sprite, x, y, speedX, speedY);
    this.score = score;
};

Player.prototype = Object.create(GamePiece.prototype);
Player.prototype.constructor = Player;

//Create player
var player = new Player('images/char-pink-girl.png', 210, 500, 0, 0, 0);

var score = 0;
var gameInterval = 0;

//Default player position to start a new game, afetr collision and win
Player.prototype.resetPlayer = function() {
    this.x = 210;
    this.y = 500;
};

Player.prototype.startNewgame = function(startTime, stopTime) {
    this.startTime = startTime;
    this.stopTime = stopTime;

    var count = 0;
    gameInterval = setInterval(gameTimer, 500);

    function gameTimer() {
        for (var i = 0; i < allEnemies.length; i++) {
            allEnemies[i].checkCollission(i);
        }
        count += 500;   //0.5secs
        if (count >= 1000*60*5) {
            clearInterval(this.gameInterval);
            gameInterval = 0;    //double assurance clearInterval work
            player.speedX = 0;
            player.speedY = 0;
            player.resetPlayer();
            enemy1.speedX = 4;  //default startup speed
            enemy2.speedX = 3;  //default startup speed
            enemy3.speedX = 2;  //default startup speed
            infoBoard.update("Game over. Re-start");
            player.award();
        }
    }
};

//To keep award on screen as a game continues
Player.prototype.award = function() {
  if (score >= 100) {
    starMedal.render();
  }

  if (score >= 200) {
    blueGemMedal.render();
  }
};

Player.prototype.handleInput = (function(key, x, y) {
    //for each allowable key, set speed along x, y-axis
    var speedX, speedY;

    if (this.startTime > 0) {
        if (gameInterval === 0) {
            this.speedX = 0;    //immobilize player
            this.speedY = 0;    //immobilize player
            enemy1.speedX = 4;    //default startup speed
            enemy2.speedX = 3;    //default startup speed
            enemy3.speedX = 2;    //default startup speed
        } else {
            switch (key) {
                case 'left':
                  speedX = -50;
                  speedY = 0;
                  break;
                case 'up':
                  speedY = -50;
                  speedX = 0;
                  break;
                case 'right':
                  speedX = 50;
                  speedY = 0;
                  break;
                case 'down':
                  speedY = 50;
                  speedX = 0;
                  break;
                //Disable all other keyboard keys
                default:
                  speedY = 0;
                  speedX = 0;
            }

            this.x += speedX;
            this.y += speedY;

            player.traverseLimit();
            player.reward();
        }
    }
});

//Keep all entities on screen
Player.prototype.traverseLimit = (function(x, y) {
    if (this.x < 0) {
        this.x = 0;
    }

    if (this.x > 425) {
        this.x = 425;
    }

    if (this.y > 500) {
        this.y = 500;
    }
});

//Award points for each successful crossing
Player.prototype.reward = (function(x, y) {
    if (this.y <= 50) {
        //Give reward
        score+=10;
        this.resetPlayer();
        infoBoard.update("U are great");
    }

    //Level 1: Increase enemy speed
    if (score >= 100) {
        infoBoard.update("U are a Star");
        starMedal.render();
        enemy1.speedX = 6;
        enemy2.speedX = 4;
        enemy3.speedX = 3;
    }

     //Level 2: Increase enemy speed
    if (score >= 200) {
        infoBoard.update("U are a genius");
        blueGemMedal.render();
        enemy1.speedX = 8;
        enemy2.speedX = 6;
        enemy3.speedX = 4;
    }
});

//Game control button class
var Button = function (sprite, x, y) {
    GamePiece.call(this, sprite, x, y);
    this.startTime = 0;
    this.stopTime = 0;
};

Button.prototype = Object.create(GamePiece.prototype);
Button.prototype.constructor = Button;

var button = new Button('images/startButton.png', 0, 10);

//Time game for 5 minutes initiated by mouse click only on start button
//Reset & restart game with same button even when a game is not completed
//This reduces player's frustration if a game is not going well.
Button.prototype.startGame = (function() {
    var mouseX = event.pageX;
    var mouseY = event.pageY;

    if ((mouseX > 420 && mouseX <= 515) && (mouseY > 0 && mouseY <= 50)) {
        var startTime = new Date().getTime();
        var stopTime = startTime + (1000*60*1); //5 minutes to play game
        infoBoard.update("Have fun");
        score = 0;
        scoreBoard.render();
        player.resetPlayer();
        player.startNewgame(startTime, stopTime);
    }
});

document.addEventListener('click', function() {
    button.startGame();
});

//Set up info board
var InfoBoard = function(info) {
    this.txt = info;
};

InfoBoard.prototype.update = function(info) {
    this.txt = info;
    ctx.clearRect(0, 0, ctx.canvas.width, 50);  //Clears also score board
};

InfoBoard.prototype.render = function() {
    ctx.font = "20px San Serif";
    ctx.fillStyle = "black";
    ctx.fillText(this.txt, 105, 30);
};

var infoBoard = new InfoBoard("Press Start for a New game");

//Set up score board
var ScoreBoard = function(txt) {
    this.txt = txt;
};

ScoreBoard.prototype.render = function() {
    ctx.font = "20px San Serif";
    ctx.fillStyle = "red";
    ctx.fillText(this.txt + score, 330, 30);
};

var scoreBoard = new ScoreBoard("SCORE : ");

//Create medals
var Medal = function (sprite, x, y) {
    GamePiece.call(this, sprite, x, y);
};

Medal.prototype = Object.create(GamePiece.prototype);
Medal.prototype.constructor = Medal;

var starMedal = new Medal('images/Star.png', 455, 0);
var blueGemMedal = new Medal('images/blueGem.png', 455, 0);

//To move the player
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
