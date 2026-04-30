// ============================================================
// platform.js - プラットフォーム（PLATFORM）クラスの定義
// マリオが走り回る足場オブジェクトを管理する
// ============================================================

class PLATFORM {
  constructor(positionX, positionY, width = 35) {
    this.positionX      = positionX;
    this.positionY      = positionY;
    this.width          = width; // 画像1枚分の横幅を何回繰り返すか（タイル数）
    this.platform_Image = new Image();
    this.platform_Image.src = 'images/Floor.png';
  }

  // プラットフォームをキャンバスに描画する（横方向にタイルを繰り返す）
  draw() {
    ctx.beginPath();
    var pattern = ctx.createPattern(this.platform_Image, "repeat-x");
    ctx.fillStyle = pattern;
    ctx.save();
    ctx.translate(this.positionX, this.positionY);
    ctx.fillRect(0, 0, this.platform_Image.width * this.width, this.platform_Image.height);
    ctx.translate(-this.positionX, -this.positionY);
    ctx.restore();
  }
}

// === ステージのプラットフォーム配置 ===
// 最上段（ドンキーコングがいる段）
let platform    = new PLATFORM(300, 100, 8);
let platformSix = new PLATFORM(40,  170);

// 上から2段目
let platformFive = new PLATFORM(40,  280);

// 上から3段目
let platformFour = new PLATFORM(50,  400, 33);

// 上から4段目
let platformOne  = new PLATFORM(40,  525);

// 上から5段目
let platformTwo  = new PLATFORM(50,  635, 33);

// 最下段（マリオのスタート地点）
let platformThree = new PLATFORM(40, 760);

let platformArray = [
  platform, platformSix, platformFive, platformFour,
  platformOne, platformTwo, platformThree
];
