// ============================================================
// hammer.js - ハンマーオブジェクトの定義
// マリオが取得できるハンマーアイテムを管理する
// ============================================================

let hammermario_Image = new Image();
hammermario_Image.src = "./images/Hammer.png";

class HAMMER {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
  }

  // ハンマーをキャンバスに描画する
  draw() {
    ctx.drawImage(hammermario_Image,
      this.positionX, this.positionY,
      single_width * SPRITE_SCALE, single_height * SPRITE_SCALE);
  }
}

// ゲーム開始時のハンマー配置（3か所）
let hammerone   = new HAMMER(HAMMER_ONE_X,   HAMMER_ONE_Y);
let hammertwo   = new HAMMER(HAMMER_TWO_X,   HAMMER_TWO_Y);
let hammerthree = new HAMMER(HAMMER_THREE_X, HAMMER_THREE_Y);

let hammerArray = [hammerone, hammertwo, hammerthree];
