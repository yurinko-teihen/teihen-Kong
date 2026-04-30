// ============================================================
// mario.js - マリオ（プレイヤー）の定義
// スプライト描画、移動・ジャンプ・ハシゴ昇降のロジックを含む
// ============================================================

// === マリオ用スプライト画像 ===
let mario_Image       = new Image();
let mariodead_Image   = new Image();
let mariohammer_Image = new Image();

mariohammer_Image.src = './images/mariohammer.png';
mario_Image.src       = './images/smallmariosheet-3.png';
mariodead_Image.src   = './images/mariodead.png';

// 重力と停止オフセット（ハシゴや着地時に動的に変更される）
let GRAVITY    = GRAVITY_DEFAULT,
    stopOffset = STOP_OFFSET_DEFAULT;

// === 通常マリオのスプライト設定 ===
const sprite_width_mario    = 296,
      sprite_height_mario   = 22,
      sprite_rows_mario     = 1,
      sprite_columns_mario  = 8,
      mario_framecount      = 8; // アニメーションのフレーム数

const mario_single_width  = sprite_width_mario  / sprite_columns_mario;
const mario_single_height = sprite_height_mario / sprite_rows_mario;

// === ハンマー装備時のスプライト設定 ===
const sprite_width_mariohammer   = 148,
      sprite_height_mariohammer  = 38,
      sprite_rows_mariohammer    = 1,
      sprite_columns_mariohammer = 4,
      mariohammer_framecount     = 4; // アニメーションのフレーム数

const mariohammer_single_width  = sprite_width_mariohammer  / sprite_columns_mariohammer;
const mariohammer_single_height = sprite_height_mariohammer / sprite_rows_mariohammer;


class MARIO {
  constructor(mario) {
    this.positionX = mario.positionX;
    this.positionY = mario.positionY;
    this.velocityY = mario.velocityY;
    this.velocityX = mario.velocityX;
    this.jumping   = true;
    this.ladder    = true;
    this.indexmario       = 0; // 通常マリオのアニメーションフレーム
    this.indexmariohammer = 0; // ハンマー装備時のアニメーションフレーム
    // 現在いるプラットフォームの右端X座標（右移動の限界として使用）
    this.currentPlatformRightEdge = canvas.width - single_width * 2;

    // 通常マリオのアニメーションフレームを一定間隔で進める
    setInterval(() => {
      this.indexmario++;
      if (this.indexmario >= mario_framecount) {
        this.indexmario = 0;
      }
    }, 100);

    // ハンマー装備時のアニメーションフレームを一定間隔で進める
    setInterval(() => {
      this.indexmariohammer++;
      if (this.indexmariohammer >= mariohammer_framecount) {
        this.indexmariohammer = 0;
      }
    }, 100);
  }

  // マリオをキャンバスに描画する（状態に応じてスプライトを切り替える）
  draw() {
    ctx.beginPath();
    // 通常状態
    if (ismarioalive && !ismariohammer) {
      ctx.drawImage(mario_Image, srcX, srcY, single_width, single_height,
        this.positionX, this.positionY,
        single_width * SPRITE_SCALE, single_height * SPRITE_SCALE);
    }
    // 死亡状態
    if (!ismarioalive) {
      ctx.drawImage(mariodead_Image,
        this.indexmario * mario_single_width, 0, mario_single_width, mario_single_height,
        this.positionX, this.positionY,
        mario_single_width * SPRITE_SCALE, sprite_height_mario * SPRITE_SCALE);
    }
    // ハンマー装備状態
    if (ismariohammer && ismarioalive) {
      ctx.drawImage(mariohammer_Image,
        this.indexmariohammer * mariohammer_single_width, 0,
        mariohammer_single_width, mariohammer_single_height,
        this.positionX, this.positionY - 10,
        mariohammer_single_width * SPRITE_SCALE, mariohammer_single_height * SPRITE_SCALE);
    }
    ctx.closePath();
  }

  // 右へ移動する（プラットフォームの端を超えないよう制限する）
  moveRight() {
    updateFrame();
    left = false;
    const rightLimit = Math.min(
      this.currentPlatformRightEdge - single_width * SPRITE_SCALE,
      canvas.width - single_width
    );
    if (this.positionX < rightLimit) {
      this.positionX += speed;
      if (this.positionX > rightLimit) {
        this.positionX = rightLimit;
      }
    }
  }

  // 左へ移動する（キャンバスの左端を超えないよう制限する）
  moveLeft() {
    updateFrame();
    left = true;
    if (this.positionX > single_width * 2) {
      this.positionX -= speed;
    }
  }

  // ハシゴを登る（ハシゴ上にいる場合のみ有効）
  moveUp(eachladder) {
    const ladderHeight = ladder_Image.height * eachladder.height;
    const ladderBottom = eachladder.positionY + ladderHeight;
    // マリオがこのハシゴの範囲内にいるか確認
    const isOnCurrentLadder =
      (this.positionX + single_width + COLLISION_MARGIN_X) > eachladder.positionX &&
      this.positionX < (eachladder.positionX + ladder_Image.width) &&
      this.positionY < ladderBottom &&
      this.positionY + single_height * SPRITE_SCALE > eachladder.positionY;

    if (!isOnCurrentLadder) {
      return;
    }

    // ハシゴ上は重力を無効にして上昇する
    GRAVITY    = GRAVITY_ON_LADDER;
    stopOffset = LADDER_CLIMB_SPEED;
    this.positionY -= stopOffset;

    // ハシゴの上端に達したら上のプラットフォームにスナップする
    const marioFeet = this.positionY + single_height * SPRITE_SCALE;
    if (marioFeet <= eachladder.positionY) {
      const platformAbove = this.findPlatformAbove(eachladder);
      if (platformAbove) {
        this.positionY = platformAbove.positionY - single_height * SPRITE_SCALE;
        this.velocityY = 0;
        this.jumping   = false;
        GRAVITY        = GRAVITY_ON_PLATFORM;
        stopOffset     = STOP_OFFSET_DEFAULT;
        this.currentPlatformRightEdge =
          platformAbove.positionX + platformAbove.platform_Image.width * platformAbove.width;
      }
    }
  }

  // ハシゴを降りる
  moveDown(eachladder) {
    this.indexnext = 8;

    const ladderHeight = ladder_Image.height * eachladder.height;
    const ladderBottom = eachladder.positionY + ladderHeight;

    // マリオがこのハシゴの範囲内にいれば、そのハシゴのインデックスを使用する
    if ((this.positionX + single_width + COLLISION_MARGIN_Y_BOT) > eachladder.positionX &&
        this.positionX < (eachladder.positionX + ladder_Image.width) &&
        this.positionY + single_height < ladderBottom &&
        this.positionY > eachladder.positionY - COLLISION_MARGIN_Y_TOP) {
      this.indexnext = ladderArray.indexOf(eachladder);
    }

    const selectedLadderHeight = ladder_Image.height * ladderArray[this.indexnext].height;
    const selectedLadderTop    = ladderArray[this.indexnext].positionY;

    // 選択されたハシゴの範囲内なら重力を無効にして下降する
    if ((this.positionX + single_width) > ladderArray[this.indexnext].positionX &&
        this.positionX < (ladderArray[this.indexnext].positionX + ladder_Image.width) &&
        this.positionY > selectedLadderTop - COLLISION_MARGIN_Y_TOP &&
        this.positionY < selectedLadderTop + selectedLadderHeight) {
      GRAVITY    = GRAVITY_ON_LADDER;
      stopOffset = LADDER_CLIMB_SPEED;
      // 最上段のプラットフォームより上には移動しない
      if (this.positionY == 76) {
        stopOffset = 0;
      }
      this.positionY += stopOffset;
    }
  }

  // プラットフォームへの着地判定（ジャンプ後の衝突判定も含む）
  jump(eachplatform) {
    this.index = 0;

    // マリオがこのプラットフォームの上に乗っているか確認
    if ((this.positionX + single_width + COLLISION_MARGIN_X) > eachplatform.positionX &&
        this.positionX < (eachplatform.positionX + eachplatform.platform_Image.width * eachplatform.width) &&
        this.positionY + single_height * SPRITE_SCALE + COLLISION_MARGIN_Y_BOT < eachplatform.positionY + eachplatform.platform_Image.height &&
        this.positionY > eachplatform.positionY - COLLISION_MARGIN_Y_TOP &&
        this.velocityY >= 0) {
      this.index = platformArray.indexOf(eachplatform);
    }

    // プラットフォームに着地処理
    if ((this.positionX + single_width + COLLISION_MARGIN_X) > platformArray[this.index].positionX &&
        this.positionX < (platformArray[this.index].positionX + platformArray[this.index].platform_Image.width * platformArray[this.index].width) &&
        this.positionY + single_height * SPRITE_SCALE < platformArray[this.index].positionY + platformArray[this.index].platform_Image.height &&
        this.positionY > platformArray[this.index].positionY - COLLISION_JUMP_RANGE &&
        this.velocityY >= 0) {
      this.jumping   = false;
      this.positionY = platformArray[this.index].positionY - single_height * SPRITE_SCALE;
      this.velocityY = 0;
      GRAVITY        = GRAVITY_ON_PLATFORM;
      stopOffset     = STOP_OFFSET_DEFAULT;
      this.currentPlatformRightEdge =
        platformArray[this.index].positionX +
        platformArray[this.index].platform_Image.width * platformArray[this.index].width;
    }
  }

  // ハシゴのすぐ上にあるプラットフォームを探す
  findPlatformAbove(eachladder) {
    const marioLeft  = this.positionX;
    const marioRight = this.positionX + single_width;

    return platformArray
      .filter((platform) => {
        const platformLeft  = platform.positionX;
        const platformRight = platform.positionX + platform.platform_Image.width * platform.width;
        return platform.positionY <= eachladder.positionY &&
          marioRight > platformLeft &&
          marioLeft  < platformRight;
      })
      .sort((a, b) => b.positionY - a.positionY)[0];
  }
}

// 移動時のスプライトフレームを更新する
let updateFrame = () => {
  ctx.clearRect(0, 0, single_width, single_height);

  cutframe = ++cutframe % framecount;
  srcX = cutframe * single_width;

  // 向きに応じてスプライトの行を切り替える
  if (left  && marioPlayer.positionX > 0) {
    srcY = trackLeft  * single_height;
  }
  if (right && marioPlayer.positionX < canvas.width - single_width) {
    srcY = trackRight * single_height;
  }
}

// マリオの初期トレイト（位置・速度）
let marioTrait = {
  positionX : MARIO_INIT_X,
  positionY : MARIO_INIT_Y,
  velocityY : 0,
  velocityX : 0,
  jumping   : true,
};

let marioPlayer = new MARIO(marioTrait);

// キーボード入力を管理するコントローラー
let controller = {
  keyListener: function(event) {
    const key_state = (event.type == "keydown") ? true : false;

    switch (event.keyCode) {
      case 37: // ← キー
        controller.left = key_state;
        break;
      case 65: // A キー（左移動）
        controller.left = key_state;
        break;
      case 32: // スペースキー（ジャンプ）
        controller.jump = key_state;
        break;
      case 39: // → キー
        controller.right = key_state;
        break;
      case 68: // D キー（右移動）
        controller.right = key_state;
        break;
      case 38: // ↑ キー（ハシゴを登る）
        controller.moveUp = key_state;
        break;
      case 40: // ↓ キー（ハシゴを降りる）
        controller.moveDown = key_state;
        break;
    }
  }
};

// メインの物理・入力処理ループ（requestAnimationFrameで毎フレーム実行）
let rafId;
let loop = function() {
  // 次フレームをスケジュール（先頭で登録することで cancelAnimationFrame が確実に機能する）
  rafId = window.requestAnimationFrame(loop);

  // 左右移動と効果音
  if (controller.left) {
    marioPlayer.moveLeft();
    walkingSound.play();
  }
  if (controller.right) {
    marioPlayer.moveRight();
    walkingSound.play();
  }

  // ハシゴの昇降（ジャンプ判定より先に処理し、ハシゴ上でのジャンプ貫通を防ぐ）
  if (controller.moveUp) {
    ladderArray.forEach((eachladder) => {
      marioPlayer.moveUp(eachladder);
      walkingSound.play();
    });
  }
  if (controller.moveDown) {
    ladderArray.forEach((eachladder) => {
      marioPlayer.moveDown(eachladder);
      walkingSound.play();
    });
  }

  // ジャンプ入力（地面にいるときのみ有効・ハシゴ昇降中は GRAVITY=0 のため無効）
  if (controller.jump && marioPlayer.jumping == false && GRAVITY != 0) {
    marioPlayer.velocityY -= JUMP_VELOCITY;
    marioPlayer.jumping = true;
  }

  // 物理演算（重力・速度・摩擦）
  marioPlayer.velocityY += GRAVITY;            // 重力を適用
  marioPlayer.positionX += marioPlayer.velocityX;
  marioPlayer.positionY += marioPlayer.velocityY;
  marioPlayer.velocityX *= FRICTION;           // 水平方向の摩擦
  marioPlayer.velocityY *= FRICTION;           // 垂直方向の摩擦

  // キャンバス下端から落下した場合はダメージ処理
  if (marioPlayer.positionY > canvas.height) {
    collisionSound.play();
    marioLives--;
    if (marioLives <= 0) {
      ismarioalive = false;
      afterCollision();
    } else {
      // ライフが残っている場合は初期位置に戻す
      marioPlayer.positionX = MARIO_INIT_X;
      marioPlayer.positionY = MARIO_INIT_Y;
      marioPlayer.velocityY = 0;
    }
  }

  // 全プラットフォームへの着地判定を実行
  platformArray.forEach((eachplatform) => {
    marioPlayer.jump(eachplatform);
  });
};

window.addEventListener("keydown", controller.keyListener);
window.addEventListener("keyup",   controller.keyListener);
rafId = window.requestAnimationFrame(loop);
