let barrel_Image = new Image();
let blue_barrel_Image = new Image();

barrel_Image.src = "./images/barrelspritesheet.png";
blue_barrel_Image.src = "./images/BlueBarrelsprite.png";


const SPRITE_WIDTH_BARREL = 72,
  SPRITE_HEIGHT_BARREL = 18,
  BARREL_ROWS = 1,
  BARREL_COLUMNS = 4,
  BARREL_FRAMECOUNT = 4,
  BARREL_SCALE = 1.5;

let barrel_single_width,
  barrel_single_height,
  acceleration;

  barrel_Image.addEventListener('load', (e) => {
  barrel_single_width = SPRITE_WIDTH_BARREL / BARREL_COLUMNS;
  barrel_single_height = SPRITE_HEIGHT_BARREL / BARREL_ROWS;
});

class BARREL {
  constructor(positionX, positionY, barrel_image = barrel_Image) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.barrel_image = barrel_image;
    this.index = 0;
    this.indexblue = 0;
    this.isbarrelcollision = false;

    setInterval(() => {
      this.index++;
      if (this.index >= 4) {
        this.index = 0;
      }
    }, 200)
    setInterval(() => {
      this.indexblue++;
      if (this.indexblue >= 2) {
        this.indexblue = 0;
      }
    }, 200)
  }


  draw() {
    if (this.isbarrelcollision) return;
    if (this.barrel_image === blue_barrel_Image) {
      ctx.drawImage(this.barrel_image, this.indexblue * barrel_single_width, 0, barrel_single_width, barrel_single_height, this.positionX, this.positionY, barrel_single_width * BARREL_SCALE, barrel_single_height * BARREL_SCALE);
    } else {
      ctx.drawImage(this.barrel_image, this.index * barrel_single_width, 0, barrel_single_width, barrel_single_height, this.positionX, this.positionY, barrel_single_width * BARREL_SCALE, barrel_single_height * BARREL_SCALE);
    }
  }

  updatebarrelladder(){
    const barrelDrawHeight = barrel_single_height * BARREL_SCALE;
    const rightPlatformYs = [
      130 - barrelDrawHeight,  // 103
      360 - barrelDrawHeight,  // 333
      595 - barrelDrawHeight   // 568
    ];
    const leftPlatformYs = [
      240 - barrelDrawHeight,  // 213
      485 - barrelDrawHeight,  // 458
      720 - barrelDrawHeight   // 693
    ];
    const allPlatformYs = [...rightPlatformYs, ...leftPlatformYs].sort((a, b) => a - b);

    const onRightPlatform = rightPlatformYs.includes(this.positionY);
    const onLeftPlatform  = leftPlatformYs.includes(this.positionY);

    if (onRightPlatform && this.positionX < 500) {
      this.positionX += 7;
    } else if (onLeftPlatform && this.positionX > 110) {
      this.positionX -= 7;
    } else {
      // Falling: snap to the next platform below when we reach or pass it
      const nextY = allPlatformYs.find(y => y > this.positionY);
      if (nextY !== undefined && this.positionY + 7 >= nextY) {
        this.positionY = nextY;
      } else {
        this.positionY += 7;
      }
    }
  }

  updatebluebarrel() {
    if(this.positionX ==140 && !(this.positionY == 240 - barrel_single_height * BARREL_SCALE)){
    this.positionY += 7;
  }

        if(this.positionY  >= marioPlayer.positionY && (this.positionY == 702 || this.positionY == 590 || this.positionY == 485 || this.positionY == 352 || this.positionY == 240 ) ){
          this.positionX += 7;
        }


    if((marioPlayer.positionX + single_width +20  ) > platform.positionX && marioPlayer.positionX < (platform.positionX + platform.platform_Image.width * 32 ) &&
    marioPlayer.positionY + single_height + 5 < platform.positionY + platform.platform_Image.height   && marioPlayer.positionY > platform.positionY  - 40 ){
      this.index = platformArray.indexOf(platform);
    }

}
}
