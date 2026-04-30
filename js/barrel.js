// ============================================================
// barrel.js - タル（BARREL）クラスの定義
// 通常タルのハシゴ転落ロジックと青タルの追跡ロジックを含む
// ============================================================

// === タル用スプライト画像 ===
let barrel_Image      = new Image();
let blue_barrel_Image = new Image();

barrel_Image.src      = "./images/barrelspritesheet.png";
blue_barrel_Image.src = "./images/BlueBarrelsprite.png";

// === タルのスプライト設定 ===
const SPRITE_WIDTH_BARREL  = 72,
      SPRITE_HEIGHT_BARREL = 18,
      BARREL_ROWS          = 1,
      BARREL_COLUMNS       = 4,
      BARREL_FRAMECOUNT    = 4,   // 通常タルのアニメーションフレーム数
      BLUE_BARREL_FRAMECOUNT = 2; // 青タルのアニメーションフレーム数

let barrel_single_width,  // タル1フレームの横幅（画像ロード後に計算）
    barrel_single_height; // タル1フレームの縦幅（画像ロード後に計算）

// 画像ロード後にタルの1フレームサイズを計算する
barrel_Image.addEventListener('load', (e) => {
  barrel_single_width  = SPRITE_WIDTH_BARREL  / BARREL_COLUMNS;
  barrel_single_height = SPRITE_HEIGHT_BARREL / BARREL_ROWS;
});

class BARREL {
  constructor(positionX, positionY, barrel_image = barrel_Image) {
    this.positionX         = positionX;
    this.positionY         = positionY;
    this.barrel_image      = barrel_image;
    this.index             = 0; // 通常タルのアニメーションフレーム
    this.indexblue         = 0; // 青タルのアニメーションフレーム
    this.isbarrelcollision = false; // 衝突済みフラグ

    // 通常タルのアニメーションフレームを一定間隔で進める
    setInterval(() => {
      this.index++;
      if (this.index >= BARREL_FRAMECOUNT) {
        this.index = 0;
      }
    }, 200);

    // 青タルのアニメーションフレームを一定間隔で進める
    setInterval(() => {
      this.indexblue++;
      if (this.indexblue >= BLUE_BARREL_FRAMECOUNT) {
        this.indexblue = 0;
      }
    }, 200);
  }

  // タルをキャンバスに描画する（衝突済みの場合はスキップ）
  draw() {
    if (this.isbarrelcollision) return;

    if (this.barrel_image === blue_barrel_Image) {
      // 青タル用フレームで描画
      ctx.drawImage(this.barrel_image,
        this.indexblue * barrel_single_width, 0, barrel_single_width, barrel_single_height,
        this.positionX, this.positionY,
        barrel_single_width * SPRITE_SCALE, barrel_single_height * SPRITE_SCALE);
    } else {
      // 通常タル用フレームで描画
      ctx.drawImage(this.barrel_image,
        this.index * barrel_single_width, 0, barrel_single_width, barrel_single_height,
        this.positionX, this.positionY,
        barrel_single_width * SPRITE_SCALE, barrel_single_height * SPRITE_SCALE);
    }
  }

  // 通常タルの移動更新（プラットフォーム上を転がり、端で落下する）
  updatebarrelladder() {
    // タルがY方向でスナップするプラットフォームのY座標
    // （barrel_single_height 分上にオフセットしてプラットフォームの上に乗せる）
    const rightPlatformYs = PLATFORM_Y_RIGHT.map(y => y - barrel_single_height * SPRITE_SCALE);
    const leftPlatformYs  = PLATFORM_Y_LEFT.map(y  => y - barrel_single_height * SPRITE_SCALE);
    const allPlatformYs   = [...rightPlatformYs, ...leftPlatformYs].sort((a, b) => a - b);

    const onRightPlatform = rightPlatformYs.includes(this.positionY);
    const onLeftPlatform  = leftPlatformYs.includes(this.positionY);

    if (onRightPlatform && this.positionX < BARREL_RIGHT_BOUNDARY) {
      // 右向きプラットフォーム上を右へ移動
      this.positionX += BARREL_SPEED;
    } else if (onLeftPlatform && this.positionX > BARREL_LEFT_BOUNDARY) {
      // 左向きプラットフォーム上を左へ移動
      this.positionX -= BARREL_SPEED;
    } else {
      // プラットフォームの端に達したら次のプラットフォームへ落下
      const nextY = allPlatformYs.find(y => y > this.positionY);
      if (nextY !== undefined && this.positionY + BARREL_SPEED >= nextY) {
        this.positionY = nextY;
      } else {
        this.positionY += BARREL_SPEED;
      }
    }
  }

  // 青タルの移動更新（縦に落下しながらプレイヤーを追跡する）
  updatebluebarrel() {
    // スポーン地点から落下を開始する（最初の左プラットフォームに達するまで）
    if (this.positionX == BLUE_BARREL_SPAWN_X &&
        !(this.positionY == PLATFORM_Y_LEFT[0] - barrel_single_height)) {
      this.positionY += BARREL_SPEED;
    }

    // 特定のY座標に達したらプレイヤーのY座標を目指して右へ移動する
    if (this.positionY >= marioPlayer.positionY &&
        BLUE_BARREL_TRACK_YS.includes(this.positionY)) {
      this.positionX += BARREL_SPEED;
    }
  }
}
