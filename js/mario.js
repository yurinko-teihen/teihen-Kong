let mario_Image = new Image();
let mariodead_Image = new Image();
let mariohammer_Image = new Image();

mariohammer_Image.src = './images/mariohammer.png';
mario_Image.src = './images/smallmariosheet-3.png';
mariodead_Image.src = './images/mariodead.png';

let GRAVITY = 1,
stopOffset = 2,
isplatform ;

const sprite_width_mario = 296,
      sprite_height_mario = 22,
      sprite_rows_mario = 1,
      sprite_columns_mario = 8,
      mario_framecount = 8;

      const mario_single_width = sprite_width_mario/sprite_columns_mario;
      const mario_single_height = sprite_height_mario/sprite_rows_mario;

const sprite_width_mariohammer = 148,
      sprite_height_mariohammer = 38,
      sprite_rows_mariohammer = 1,
      sprite_columns_mariohammer = 4,
      mariohammer_framecount = 4;

const mariohammer_single_width = sprite_width_mariohammer/sprite_columns_mariohammer;
const mariohammer_single_height = sprite_height_mariohammer/sprite_rows_mariohammer;


class MARIO{
  constructor(mario){

    this.positionX = mario.positionX;
    this.positionY = mario.positionY;
    this.velocityY = mario.velocityY;
    this.velocityX = mario.velocityX;
    this.jumping = true;
    this.ladder = true;
    this.indexmario = 0;
    this.indexmariohammer = 0;
    this.currentPlatformRightEdge = canvas.width - single_width * 2;

    setInterval(() => {
     this.indexmario++;
     if (this.indexmario >= 8) {
       this.indexmario = 0;
     }
   }, 100)
   setInterval(() => {
    this.indexmariohammer++;
    if (this.indexmariohammer >= 4) {
      this.indexmariohammer = 0;
    }
  }, 100)
  }

  draw(){
    ctx.beginPath();
    if(ismarioalive && !ismariohammer )
    ctx.drawImage(mario_Image,srcX,srcY,single_width,single_height,this.positionX,this.positionY,single_width * 1.5,single_height * 1.5);
    if(!ismarioalive  ){
      ctx.drawImage(mariodead_Image, this.indexmario * mario_single_width,0, mario_single_width, mario_single_height, this.positionX, this.positionY, mario_single_width * 1.5, sprite_height_mario * 1.5);

    }
    if(ismariohammer && ismarioalive ){
    ctx.drawImage(mariohammer_Image, this.indexmariohammer * mariohammer_single_width,0, mariohammer_single_width, mariohammer_single_height, this.positionX, this.positionY - 10, mariohammer_single_width * 1.5, sprite_height_mariohammer * 1.5 );
  }
    ctx.closePath();
  }

  moveRight(){
    updateFrame();
    left = false;
    // rightLimit: keep Mario's sprite fully within the platform (1.5 = sprite scale factor)
    const rightLimit = Math.min(this.currentPlatformRightEdge - single_width * 1.5, canvas.width - single_width);
    if (this.positionX < rightLimit) {
      this.positionX += speed;
      if (this.positionX > rightLimit) {
        this.positionX = rightLimit;
      }
    }
  }

  moveLeft(){
    updateFrame();
    left = true;
    // Prevent Mario from moving beyond the left edge of the canvas
    // Stop twice the sprite width before the edge
    if (this.positionX > single_width * 2) {
      this.positionX -= speed;
    }
  }


  moveUp(eachladder){
    const ladderHeight = ladder_Image.height * eachladder.height;
    const ladderBottom = eachladder.positionY + ladderHeight;
    const isOnCurrentLadder = (this.positionX + single_width + 20) > eachladder.positionX &&
      this.positionX < (eachladder.positionX + ladder_Image.width) &&
      this.positionY < ladderBottom &&
      this.positionY + single_height * 1.5 > eachladder.positionY;

    if(!isOnCurrentLadder){
      return;
    }

    GRAVITY = 0;
    stopOffset = 8;
    this.positionY -= stopOffset;

    const marioFeet = this.positionY + single_height * 1.5;
    if (marioFeet <= eachladder.positionY) {
      const platformAbove = this.findPlatformAbove(eachladder);
      if (platformAbove) {
        this.positionY = platformAbove.positionY - single_height * 1.5;
        this.velocityY = 0;
        this.jumping = false;
        GRAVITY = 2;
        stopOffset = 2;
        this.currentPlatformRightEdge = platformAbove.positionX + platformAbove.platform_Image.width * platformAbove.width;
      }
    }
  }

    moveDown(eachladder){
      this.indexnext = 8;
      
      // Calculate the actual ladder height
      const ladderHeight = ladder_Image.height * eachladder.height;
      const ladderBottom = eachladder.positionY + ladderHeight;
      
      if((this.positionX + single_width +5  ) > eachladder.positionX && this.positionX < (eachladder.positionX + ladder_Image.width ) &&
       this.positionY + single_height < ladderBottom && this.positionY > eachladder.positionY  - 40 ){
        this.indexnext = ladderArray.indexOf(eachladder);
      }

      // Calculate the ladder height for the selected ladder
      const selectedLadderHeight = ladder_Image.height * ladderArray[this.indexnext].height;
      const selectedLadderTop = ladderArray[this.indexnext].positionY;
      
        if((this.positionX + single_width  ) > ladderArray[this.indexnext].positionX && this.positionX < (ladderArray[this.indexnext].positionX + ladder_Image.width) &&
        this.positionY > selectedLadderTop - 40 && 
        this.positionY < selectedLadderTop + selectedLadderHeight){

          GRAVITY = 0;
          stopOffset = 8;
          if(this.positionY  == 36 ){
            stopOffset = 0;
          }
        this.positionY += stopOffset;
      }
    }

    jump(eachplatform){
      this.index = 0;

      if((this.positionX + single_width +20  ) > eachplatform.positionX && this.positionX < (eachplatform.positionX + eachplatform.platform_Image.width * eachplatform.width ) &&
      this.positionY + single_height * 1.5 + 5 < eachplatform.positionY + eachplatform.platform_Image.height   && this.positionY > eachplatform.positionY  - 40 &&
      this.velocityY >= 0){
        this.index = platformArray.indexOf(eachplatform);
      }

      if((this.positionX + single_width +20  ) > platformArray[this.index].positionX && this.positionX < (platformArray[this.index].positionX + platformArray[this.index].platform_Image.width * platformArray[this.index].width ) &&
      this.positionY + single_height * 1.5 < platformArray[this.index].positionY + platformArray[this.index].platform_Image.height   && this.positionY > platformArray[this.index].positionY  - 100 &&
      this.velocityY >= 0){

        this.jumping = false;
        this.positionY = platformArray[this.index].positionY - single_height * 1.5;
        this.velocityY = 0;
        GRAVITY =2  ;
        stopOffset = 2;
        this.currentPlatformRightEdge = platformArray[this.index].positionX + platformArray[this.index].platform_Image.width * platformArray[this.index].width;

      }
    }

    findPlatformAbove(eachladder){
      const marioLeft = this.positionX;
      const marioRight = this.positionX + single_width;

      return platformArray
        .filter((platform) => {
          const platformLeft = platform.positionX;
          const platformRight = platform.positionX + platform.platform_Image.width * platform.width;
          return platform.positionY <= eachladder.positionY &&
            marioRight > platformLeft &&
            marioLeft < platformRight;
        })
        .sort((a, b) => b.positionY - a.positionY)[0];
    }
  }

updateFrame = ()=>{
  ctx.clearRect(0,0,single_width,single_height);

  cutframe = ++cutframe % framecount;
  srcX = cutframe * single_width;

  if(left && marioPlayer.positionX > 0 ){
  		srcY = trackLeft * single_height;
  				}
  if(right && marioPlayer.positionX<canvas.width-single_width){
  		srcY = trackRight * single_height;
  				}
}

let marioTrait = {
  positionX : 87,
  positionY : 684,
  velocityY : 0,
  velocityX : 0,
  jumping :true,
};

let marioPlayer = new MARIO(marioTrait);

// marioPlayer.draw();

let controller = {
  keyListener:function(event) {

  const key_state = (event.type == "keydown")?true:false;

  switch(event.keyCode) {

      case 37:// left key
        controller.left = key_state;
      break;
      case 65:
      controller.left = key_state;
      break;
      case 32:// up key
        controller.jump = key_state;
      break;
      case 39:// right key
        controller.right = key_state;
      break;
      case 68:
      controller.right = key_state;
      break;
      case 38:
      controller.moveUp = key_state;
      break;
      case 40:
      controller.moveDown = key_state;
      break;

    }
}
};

let loop = function() {

  if (controller.jump && marioPlayer.jumping == false && GRAVITY != 0) {

    marioPlayer.velocityY -= 25;
    marioPlayer.jumping = true;
    // marioPlayer.velocityY += 1.5;
  }

  if (controller.left ) {
    marioPlayer.moveLeft();
    walkingSound.play();

  }

  if (controller.right) {
    marioPlayer.moveRight();
    walkingSound.play();
  }

  if(controller.moveUp){
    ladderArray.forEach((eachladder)=>{
      marioPlayer.moveUp(eachladder);
      walkingSound.play();

    })
  }

  if(controller.moveDown){
    ladderArray.forEach((eachladder)=>{
      marioPlayer.moveDown(eachladder);
      walkingSound.play();

    })
  }

  marioPlayer.velocityY += GRAVITY ;// gravity
  marioPlayer.positionX += marioPlayer.velocityX;
  marioPlayer.positionY += marioPlayer.velocityY;
  marioPlayer.velocityX *= 0.9;// friction
  marioPlayer.velocityY *= 0.9;// friction

  // If Mario falls off the bottom of the canvas, treat it as a death
  if (marioPlayer.positionY > canvas.height) {
    collisionSound.play();
    marioLives--;
    if (marioLives <= 0) {
      ismarioalive = false;
      afterCollision();
    } else {
      marioPlayer.positionX = 87;
      marioPlayer.positionY = 684;
      marioPlayer.velocityY = 0;
    }
  }

  platformArray.forEach((eachplatform)=>{
    marioPlayer.jump(eachplatform);
  })

  window.requestAnimationFrame(loop);

};

window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);
