// ============================================================
// obsctacle.js - 障害物（炎・ドラム缶）の定義
// スタート地点付近に置かれる炎とドラム缶オブジェクトを管理する
// ============================================================

// === 炎・ドラム缶用スプライト画像 ===
let fire_Image = new Image();
let drum_Image = new Image();
fire_Image.src = "./images/fire.png";
drum_Image.src = "./images/drum-1.png";

// === 炎のスプライト設定 ===
let fire_single_width,
    fire_single_height;
const image_columns      = 2,   // 炎スプライトシートの列数
      image_rows         = 1,   // 炎スプライトシートの行数
      sprite_width_fire  = 43,  // スプライトシート全体の横幅
      sprite_height_fire = 23;  // スプライトシート全体の縦幅

// 画像ロード後に炎の1フレームサイズを計算する
fire_Image.addEventListener('load', (e) => {
  fire_single_width  = sprite_width_fire  / image_columns;
  fire_single_height = sprite_height_fire / image_rows;
});

class FIRE {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.index = 0; // アニメーションのフレーム番号

    // 炎のアニメーションフレームを一定間隔で切り替える
    setInterval(() => {
      this.index++;
      if (this.index >= image_columns) {
        this.index = 0;
      }
    }, 1000);
  }

  // 炎をキャンバスに描画する
  draw() {
    ctx.drawImage(fire_Image,
      this.index * fire_single_width, 0, fire_single_width, fire_single_height,
      this.positionX, this.positionY,
      fire_single_width * SPRITE_SCALE, sprite_height_fire * SPRITE_SCALE);
  }
}

// 炎のインスタンス（マリオのスタート地点付近に配置）
let fireimage = new FIRE(MARIO_INIT_X, 720);

class DRUM {
  constructor(positionX, positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
  }

  // ドラム缶をキャンバスに描画する
  draw() {
    ctx.drawImage(drum_Image,
      this.positionX, this.positionY,
      drum_Image.width * SPRITE_SCALE, drum_Image.height * SPRITE_SCALE);
  }
}

// ドラム缶のインスタンス（炎の下に配置）
let drumimage = new DRUM(MARIO_INIT_X, 732);
