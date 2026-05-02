// ============================================================
// hammer.js - スターオブジェクトの定義
// マリオが取得できるスターアイテムを管理する
// ============================================================

let starmario_Image = new Image();
starmario_Image.src = "./images/star.svg";

class STAR {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
  }

  // スターをキャンバスに描画する
  draw() {
    ctx.drawImage(starmario_Image,
      this.positionX, this.positionY,
      single_width * SPRITE_SCALE, single_height * SPRITE_SCALE);
  }
}

// ゲーム開始時のスター配置（3か所）
let hammerone   = new STAR(HAMMER_ONE_X,   HAMMER_ONE_Y);
let hammertwo   = new STAR(HAMMER_TWO_X,   HAMMER_TWO_Y);
let hammerthree = new STAR(HAMMER_THREE_X, HAMMER_THREE_Y);

let starArray = [hammerone, hammertwo, hammerthree];
