let canvas = document.getElementById('canvas');

let ctx = canvas.getContext('2d');

canvas.width = 650;
canvas.height = 800;
canvas.style.display = 'block';
canvas.style.margin = '0 auto';
// canvas.style.marginTop = 50 + 'px';
canvas.style.backgroundColor = 'black';

let generateRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const sprite_width = 264,
  sprite_height = 24,
  rows = 1,
  columns = 11,
  single_width = sprite_width / columns,
  single_height = sprite_height / rows,
  framecount = 11,
  SCORE_OFFSET = 100,
  SPRITE_SCALE = 1.5;

let trackRight = 0,
  trackLeft = 1,
  cutframe = 0,
  srcX = 0,
  srcY = 1,
  left = false,
  right = true,
  ismarioalive = true,
  ismariohammer = false,
  isGamePlaying = false,
  isGameOver = false,
  speed = 3,
  score = 0,
  gameclearance,
  highscore,
  marioLives = 3;

  let banner_Image = new Image();
  let orangebarrel_Image = new Image();
  let kong_Image = new Image();
  let hammer_Image = new Image();
  // let mariodead_Image = new Image();

  banner_Image.src = "./images/donkeykongbanner.png";
  orangebarrel_Image.src = "./images/Barrel0.png";
  kong_Image.src = "./images/DKGrin-1.png";
  hammer_Image.src = "./images/Hammermain.png";

  let walkingSound = new Audio('./sounds/walking2.wav'),
    startSound = new Audio('./sounds/theme.wav'),
    collisionSound = new Audio('./sounds/death.wav');
  // mariodead_Image.src = "./images/mariodead.png";

let gameLoop = () => {
  gameclearance = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayScore();

    ladderArray.forEach((eachladder) => {
      eachladder.draw();
    })

    ladderArraynext.forEach((eachladdernext) => {
      eachladdernext.draw();
    })

    platformArray.forEach((eachplatform) => {
      eachplatform.draw();
    })
    hammerArray.forEach((eachhammer) =>{
      eachhammer.draw();
      hammerCollision(eachhammer);
    })

    marioPlayer.draw();
    enemy.draw();
    pauline.drawpauline();
    drumimage.draw();
    fireimage.draw();
    gameWon();

    for(let eachbluebarrel of barrelArraynext) {
      eachbluebarrel.updatebluebarrel();
      eachbluebarrel.draw();
      if(collisionDetectionBlue(eachbluebarrel) && !ismariohammer){
        if(!ismarioalive){
          setTimeout(()=>{
            clearInterval(gameclearance);
          },500)
          isGameOver = true;
          break;
        }
      }
    }

    for(let eachbarrelladder of barrelArrayLadder) {
      eachbarrelladder.updatebarrelladder();
      eachbarrelladder.draw();
      if(collisionDetection(eachbarrelladder) && !ismariohammer){
        if(!ismarioalive){
          setTimeout(()=>{
            clearInterval(gameclearance);
          },500)
          isGameOver = true;
          break;
        }
      }

    }

  }, 1000 / 8);

}

let gameWon = ()=>{
  // Trigger win only when Mario actually touches Pauline
  const paulineWidth = sprite_width_pauline / sprite_columns_pauline;
  const paulineHeight = sprite_height_pauline;

  if(marioPlayer.positionX < pauline.positionX + paulineWidth &&
     marioPlayer.positionX + single_width > pauline.positionX &&
     marioPlayer.positionY < pauline.positionY + paulineHeight &&
     marioPlayer.positionY + single_height > pauline.positionY){
    afterGameWon();
    score += 100;
  }
}

let hammerCollision = (eachhammer)=>{
  let index = 0;

  if((marioPlayer.positionX < eachhammer.positionX + hammer_Image.width &&
     marioPlayer.positionX+ single_width >  eachhammer.positionX &&
     marioPlayer.positionY < eachhammer.positionY + hammer_Image.height &&
     marioPlayer.positionY + single_height > eachhammer.positionY )){
       index = hammerArray.indexOf(eachhammer);
       hammerArray.splice(index,1);

       ismariohammer = true;

       setTimeout(()=>{
         ismariohammer = false;

       },9000)
     }

}

let collisionDetection = (eachbarrelladder)=>{
  return collisionDetectionBarrel(eachbarrelladder, barrelArrayLadder);
}
let collisionDetectionBlue = (eachbluebarrel)=>{
  return collisionDetectionBarrel(eachbluebarrel, barrelArraynext);
}

let collisionDetectionBarrel = (barrel, barrelArray)=>{
  const bw = barrel_single_width * SPRITE_SCALE;
  const bh = barrel_single_height * SPRITE_SCALE;

  if(marioPlayer.positionX < barrel.positionX + bw &&
     marioPlayer.positionX + single_width > barrel.positionX &&
     marioPlayer.positionY < barrel.positionY + bh &&
     marioPlayer.positionY + single_height > barrel.positionY)
  {
    if (localStorage.getItem('highscore') < score) {
      localStorage.setItem('highscore', score);
    }

    barrel.isbarrelcollision = true;
    const index = barrelArray.indexOf(barrel);
    barrelArray.splice(index, 1);
    score += 10;

    if(!ismariohammer){
      collisionSound.play();
      marioLives--;
      if (marioLives <= 0) {
        ismarioalive = false;
        afterCollision();
      }
    } else {
      ismarioalive = true;
    }
    return true;
  }
  return false;
}

let displayScore = ()=>{
  ctx.fillStyle = 'red';
  ctx.font = "20px Arial";
  let heartsText = '❤️'.repeat(marioLives);
  ctx.fillText(heartsText + " Score : " + score ,450,40);
}


let barrelArray = [];
let barrelArrayLadder = [];
let barrelArraynext = [];
let barrelpositionanimate,
verticalbarrelanimate;

let barrelAnimation = ()=>{
  barrelpositionanimate = setInterval(() => {
  barrelArrayLadder.push(new BARREL(310, 42));

  if (barrelArrayLadder.length > 10 ) {
    barrelArrayLadder.splice(0, 4);
  }
}, 4000);

verticalbarrelanimate = setInterval(() => {
  barrelArraynext.push(new BARREL(140, 100, blue_barrel_Image));
  if(barrelArraynext.length > 7){
    barrelArraynext.splice(0,1);
  }

}, 3000);
}

let afterCollision = ()=>{
  ismarioalive = false;
  ismariohammer = false;

    setTimeout(()=>{
      stopGameCanvas();
      hammerArray = [new HAMMER(500,505),new HAMMER(80,390)];

    },3500);

  clearInterval(barrelpositionanimate);
  clearInterval(verticalbarrelanimate);

  window.cancelAnimationFrame(loop);
  barrelArrayLadder = [];
  barrelArraynext = [];
}

let afterGameWon = ()=>{
  ismariohammer = false;
  setTimeout(()=>{
    gameWonCanvas();
    hammerArray = [new HAMMER(500,505),new HAMMER(80,390)];

  },2000);

  clearInterval(gameclearance);
  clearInterval(barrelpositionanimate);
  clearInterval(verticalbarrelanimate);

  window.cancelAnimationFrame(loop);
  barrelArrayLadder = [];
  barrelArraynext = [];

}

let updateAll = ()=>{
  marioPlayer.positionX = 87 ;
  marioPlayer.positionY = 684;
  score = 0;
  marioLives = 3;
  ismariohammer = false;
}

let drawStartScreen = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  startSound.play();
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0, canvas.width,canvas.height);
  ctx.drawImage(banner_Image, canvas.width/2 - banner_Image.width/2 ,canvas.height / 2 - banner_Image.height / 2 - 200);
  ctx.drawImage(orangebarrel_Image, canvas.width/2 - banner_Image.width + 100 ,canvas.height / 2 - banner_Image.height / 2 );
  ctx.drawImage(orangebarrel_Image, canvas.width - 200 ,canvas.height / 2 - banner_Image.height / 2 );
  ctx.drawImage(kong_Image, canvas.width - kong_Image.width * 3.7 ,canvas.height / 2 - banner_Image.height / 2 );
  ctx.drawImage(hammer_Image, canvas.width - 430,canvas.height / 2 +  35 );

  ctx.save();
  ctx.font = '24px START GAME';
  ctx.fillStyle = 'red';

  ctx.strokeText(`START GAME`, canvas.width / 2  , canvas.height / 2);
  ctx.fillText(`START GAME`, canvas.width / 2 - 60  , canvas.height / 2 + 50);
  ctx.restore();

  ctx.save();
  ctx.font = '18px START GAME';
  ctx.fillStyle = 'white';
  ctx.fillText(`Press Enter.`, canvas.width / 2 -30  , canvas.height / 2 + 130);
  ctx.restore();
}

let startGameCanvas = () => {
  // Wait for images to load before drawing
  Promise.all([
    new Promise(resolve => banner_Image.complete ? resolve() : banner_Image.addEventListener('load', resolve)),
    new Promise(resolve => orangebarrel_Image.complete ? resolve() : orangebarrel_Image.addEventListener('load', resolve)),
    new Promise(resolve => kong_Image.complete ? resolve() : kong_Image.addEventListener('load', resolve)),
    new Promise(resolve => hammer_Image.complete ? resolve() : hammer_Image.addEventListener('load', resolve))
  ]).then(drawStartScreen);

  document.onkeypress = (e) => {
    if (e.keyCode == 13 && !isGamePlaying) {
      startGame();
      isGamePlaying = true;
    }
  }
}

// Function to handle start/retry button clicks
window.handleStartRetry = () => {
  if (!isGamePlaying && !isGameOver) {
    // Start game for the first time
    startGame();
    isGamePlaying = true;
  } else if (isGameOver) {
    // Retry after game over or win
    startGame();
    updateAll();
    isGameOver = false;
    ismarioalive = true;
  }
}
let startGame = ()=>{
  startSound.pause();
  new Promise((resolve, reject) => {
    if (mario_Image.complete) {
      resolve();
    } else {
      mario_Image.addEventListener('load', resolve);
      mario_Image.addEventListener('error', reject);
    }
  })
  .catch(() => {}) // proceed even if image fails to load
  .then(() => {
    barrelAnimation();
    gameLoop();
  });
}

let stopGameCanvas = () => {

    collisionSound.pause();
    startSound.play();
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width,canvas.height);
    ctx.drawImage(kong_Image, canvas.width - kong_Image.width * 3.7 ,canvas.height / 2 - banner_Image.height);
    ctx.drawImage(hammer_Image, canvas.width / 2 - 70,canvas.height / 2 - 15 );

    ctx.save();
    ctx.font = '24px GAME GAME';
    ctx.fillStyle = 'green';
    ctx.strokeText(`GAME OVER`, canvas.width / 2   , canvas.height / 2 );
    ctx.fillText(`GAME OVER`, canvas.width / 2 - 60  , canvas.height / 2 - 80 );
    ctx.restore();

    ctx.save();
    ctx.font = '18px STOP GAME';
    ctx.fillStyle = 'white';
    ctx.fillText(`Scored : ` + score, canvas.width / 2 - 30   , canvas.height / 2 - 50);
    // ctx.fillText(`High Score : ${localStorage.getItem('highscore') || 0}`, canvas.width / 2 + 50   , canvas.height / 2 - 50);

    ctx.restore();

    ctx.save();
    ctx.font = '24px STOP GAME';
    ctx.fillStyle = 'red';

    ctx.strokeText(`RETRY`, canvas.width / 2   , canvas.height / 2);
    ctx.fillText(`RETRY`, canvas.width / 2 - 20  , canvas.height / 2 );
    ctx.restore();

    ctx.save();
    ctx.font = '18px STOP GAME';
    ctx.fillStyle = 'white';
    ctx.fillText(`Press Enter.`, canvas.width / 2 - 30  , canvas.height / 2 + 130);
    ctx.restore();


  document.onkeypress = (e) => {
    if (e.keyCode == 13 && isGameOver) {
      startGame();

      updateAll();
      isGameOver = false;
      ismarioalive = true;

    }
  }
}

let gameWonCanvas = () => {
  isGameOver = true;

    startSound.play();
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width,canvas.height);
    ctx.drawImage(kong_Image, canvas.width - kong_Image.width * 3.7 ,canvas.height / 2 - banner_Image.height);
    ctx.drawImage(hammer_Image, canvas.width / 2 - 70,canvas.height / 2 - 15 );

    ctx.save();
    ctx.font = '24px YOU WON';
    ctx.fillStyle = 'green';
    ctx.strokeText(`YOU WON`, canvas.width / 2   , canvas.height / 2 );
    ctx.fillText(`YOU WON`, canvas.width / 2 - 60  , canvas.height / 2 - 80 );
    ctx.restore();

    ctx.save();
    ctx.font = '18px STOP GAME';
    ctx.fillStyle = 'white';
    ctx.fillText(`Scored : ` + score, canvas.width / 2 - 30   , canvas.height / 2 - 50);
    // ctx.fillText(`High Score : ${localStorage.getItem('highscore') || 0}`, canvas.width / 2 + 50   , canvas.height / 2 - 50);

    ctx.restore();

    ctx.save();
    ctx.font = '24px STOP GAME';
    ctx.fillStyle = 'red';

    ctx.strokeText(`REPLAY`, canvas.width / 2   , canvas.height / 2);
    ctx.fillText(`REPLAY`, canvas.width / 2 - 20  , canvas.height / 2 );
    ctx.restore();

    ctx.save();
    ctx.font = '18px STOP GAME';
    ctx.fillStyle = 'white';
    ctx.fillText(`Press Enter.`, canvas.width / 2 -30  , canvas.height / 2 + 130);
    ctx.restore();


  document.onkeypress = (e) => {
    if (e.keyCode == 13 && isGameOver) {
      startGame();
      // afterCollision();
      updateAll();
      // afterGameWon();

      isGameOver = false;
    }
  }
}

startGameCanvas();
