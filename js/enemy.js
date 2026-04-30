// ============================================================
// enemy.js - 敵（ドンキーコング）とポリーンの定義
// スプライトのアニメーション描画を担当する
// ============================================================

// === 敵・ポリーン用スプライト画像 ===
let enemy_Image   = new Image();
let pauline_Image = new Image();

enemy_Image.src   = "./images/enemy-1.png";
pauline_Image.src = "./images/pauline.png";

// === ドンキーコングのスプライト設定 ===
const sprite_width_enemy  = 502,
      sprite_height_enemy = 92,
      sprite_rows         = 1,
      sprite_columns      = 5,
      enemy_framecount    = 5; // アニメーションのフレーム数

// === ポリーンのスプライト設定 ===
const sprite_width_pauline  = 97,
      sprite_height_pauline = 27,
      sprite_rows_pauline   = 1,
      sprite_columns_pauline = 4,
      pauline_framecount    = 4; // アニメーションのフレーム数

let enemy_single_width,   // 敵1フレームの横幅（画像ロード後に計算）
    enemy_single_height,  // 敵1フレームの縦幅（画像ロード後に計算）
    pauline_single_width, // ポリーン1フレームの横幅
    pauline_single_height; // ポリーン1フレームの縦幅

// 画像ロード後にフレームサイズを計算する
enemy_Image.addEventListener('load', (e) => {
  enemy_single_width  = sprite_width_enemy  / sprite_columns;
  enemy_single_height = sprite_height_enemy / sprite_rows;
});
pauline_Image.addEventListener('load', (e) => {
  pauline_single_width  = sprite_width_pauline  / sprite_columns_pauline;
  pauline_single_height = sprite_height_pauline / sprite_rows_pauline;
});

class ENEMY {
  constructor(positionX, positionY) {
    this.positionX   = positionX;
    this.positionY   = positionY;
    this.index       = 0; // 敵アニメーションのフレーム番号
    this.secondindex = 0; // ポリーンアニメーションのフレーム番号

    // 敵のアニメーションフレームを一定間隔で進める
    setInterval(() => {
      this.index++;
      if (this.index >= enemy_framecount) {
        this.index = 0;
      }
    }, 1000);

    // ポリーンのアニメーションフレームを一定間隔で進める
    setInterval(() => {
      this.secondindex++;
      if (this.secondindex >= pauline_framecount) {
        this.secondindex = 0;
      }
    }, 1000);
  }

  // ドンキーコングをキャンバスに描画する
  draw() {
    ctx.drawImage(enemy_Image,
      this.index * enemy_single_width, 0, enemy_single_width, enemy_single_height,
      this.positionX, this.positionY, enemy_single_width, sprite_height_enemy);
  }

  // ポリーンをキャンバスに描画する
  drawpauline() {
    ctx.drawImage(pauline_Image,
      this.secondindex * pauline_single_width, 0, pauline_single_width, pauline_single_height,
      this.positionX, this.positionY,
      pauline_single_width * SPRITE_SCALE, sprite_height_pauline * SPRITE_SCALE);
  }
}

// ドンキーコング（ステージ左上に配置）
let enemy  = new ENEMY(310, 8);
// ポリーン（マリオが救出する目標キャラクター）
let pauline = new ENEMY(40, 129);
