// ============================================================
// script.js - ゲームのメインロジック
// canvas の初期化、ゲームループ、衝突検出、画面遷移などを管理する
// ============================================================

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// キャンバスのサイズと表示設定
canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.style.display         = 'block';
canvas.style.margin          = '0 auto';
canvas.style.backgroundColor = 'black';

// ランダムな整数を返すユーティリティ関数
let generateRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// === プレイヤースプライト設定 ===
const sprite_width  = 264,
      sprite_height = 24,
      rows          = 1,
      columns       = 11,
      single_width  = sprite_width / columns,  // 1フレームの横幅
      single_height = sprite_height / rows,    // 1フレームの縦幅
      framecount    = 11;                      // アニメーションのフレーム数

// === ゲーム状態変数 ===
let trackRight    = 0,        // 右向きアニメーションの行インデックス
    trackLeft     = 1,        // 左向きアニメーションの行インデックス
    cutframe      = 0,        // 現在のアニメーションフレーム番号
    srcX          = 0,        // スプライトシートの切り取り開始X
    srcY          = 1,        // スプライトシートの切り取り開始Y
    left          = false,    // 左向きフラグ
    right         = true,     // 右向きフラグ
    ismarioalive  = true,     // マリオが生きているか
    ismariohammer = false,    // マリオがハンマーを持っているか
    isGamePlaying = false,    // ゲームが進行中か
    isGameOver    = false,    // ゲームオーバー状態か
    speed         = MARIO_MOVE_SPEED, // マリオの移動速度
    score         = 0,        // 現在のスコア
    gameclearance,            // ゲームループのsetIntervalハンドル
    highscore,                // ハイスコア
    marioLives    = INITIAL_MARIO_LIVES; // 残りライフ数

// === 画像リソース ===
let banner_Image       = new Image();
let orangebarrel_Image = new Image();
let kong_Image         = new Image();
let hammer_Image       = new Image();

banner_Image.src       = "./images/donkeykongbanner.png";
orangebarrel_Image.src = "./images/Barrel0.png";
kong_Image.src         = "./images/DKGrin-1.png";
hammer_Image.src       = "./images/Hammermain.png";

// === サウンドリソース ===
let walkingSound   = new Audio('./sounds/walking2.wav'),
    startSound     = new Audio('./sounds/theme.wav'),
    collisionSound = new Audio('./sounds/death.wav');

// ゲームのメインループ（描画・更新を一定間隔で実行）
let gameLoop = () => {
  gameclearance = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayScore();

    // ハシゴを描画
    ladderArray.forEach((eachladder) => {
      eachladder.draw();
    });

    ladderArraynext.forEach((eachladdernext) => {
      eachladdernext.draw();
    });

    // プラットフォームを描画
    platformArray.forEach((eachplatform) => {
      eachplatform.draw();
    });

    // ハンマーを描画し、取得判定を行う
    hammerArray.forEach((eachhammer) => {
      eachhammer.draw();
      hammerCollision(eachhammer);
    });

    // プレイヤー・敵・その他オブジェクトを描画
    marioPlayer.draw();
    enemy.draw();
    pauline.drawpauline();
    drumimage.draw();
    fireimage.draw();
    gameWon();

    // 青タル（追跡型）の更新・描画・衝突判定
    for (let eachbluebarrel of barrelArraynext) {
      eachbluebarrel.updatebluebarrel();
      eachbluebarrel.draw();
      if (collisionDetectionBlue(eachbluebarrel) && !ismariohammer) {
        if (!ismarioalive) {
          setTimeout(() => {
            clearInterval(gameclearance);
          }, COLLISION_STOP_DELAY);
          isGameOver = true;
          break;
        }
      }
    }

    // 通常タル（ハシゴ経由）の更新・描画・衝突判定
    for (let eachbarrelladder of barrelArrayLadder) {
      eachbarrelladder.updatebarrelladder();
      eachbarrelladder.draw();
      if (collisionDetection(eachbarrelladder) && !ismariohammer) {
        if (!ismarioalive) {
          setTimeout(() => {
            clearInterval(gameclearance);
          }, COLLISION_STOP_DELAY);
          isGameOver = true;
          break;
        }
      }
    }

  }, 1000 / GAME_LOOP_FPS);
}

// ゲームクリア判定（マリオがポリーンに触れたか）
let gameWon = () => {
  const paulineWidth  = sprite_width_pauline / sprite_columns_pauline;
  const paulineHeight = sprite_height_pauline;

  if (marioPlayer.positionX < pauline.positionX + paulineWidth &&
      marioPlayer.positionX + single_width > pauline.positionX &&
      marioPlayer.positionY < pauline.positionY + paulineHeight &&
      marioPlayer.positionY + single_height > pauline.positionY) {
    afterGameWon();
    score += SCORE_WIN_BONUS;
  }
}

// ハンマー取得判定（マリオがハンマーに触れたとき）
let hammerCollision = (eachhammer) => {
  let index = 0;

  if (marioPlayer.positionX < eachhammer.positionX + hammer_Image.width &&
      marioPlayer.positionX + single_width > eachhammer.positionX &&
      marioPlayer.positionY < eachhammer.positionY + hammer_Image.height &&
      marioPlayer.positionY + single_height > eachhammer.positionY) {
    // ハンマーを配列から削除し、ハンマー状態をONにする
    index = hammerArray.indexOf(eachhammer);
    hammerArray.splice(index, 1);
    ismariohammer = true;

    // HAMMER_DURATION ms後にハンマー状態を解除する
    setTimeout(() => {
      ismariohammer = false;
    }, HAMMER_DURATION);
  }
}

// 各タル種別ごとの衝突検出ラッパー関数
let collisionDetection = (eachbarrelladder) => {
  return collisionDetectionBarrel(eachbarrelladder, barrelArrayLadder);
}
let collisionDetectionBlue = (eachbluebarrel) => {
  return collisionDetectionBarrel(eachbluebarrel, barrelArraynext);
}

// タルとマリオの衝突検出（共通処理）
let collisionDetectionBarrel = (barrel, barrelArray) => {
  const bw = barrel_single_width  * SPRITE_SCALE;
  const bh = barrel_single_height * SPRITE_SCALE;

  if (marioPlayer.positionX < barrel.positionX + bw &&
      marioPlayer.positionX + single_width > barrel.positionX &&
      marioPlayer.positionY < barrel.positionY + bh &&
      marioPlayer.positionY + single_height > barrel.positionY) {
    // ハイスコアを更新
    if (Number(localStorage.getItem('highscore') ?? 0) < score) {
      localStorage.setItem('highscore', score);
    }

    barrel.isbarrelcollision = true;
    const index = barrelArray.indexOf(barrel);
    barrelArray.splice(index, 1);
    score += SCORE_BARREL_HIT;

    if (!ismariohammer) {
      // ハンマーなし：ダメージ処理
      collisionSound.play();
      marioLives--;
      if (marioLives <= 0) {
        ismarioalive = false;
        afterCollision();
      }
    } else {
      // ハンマーあり：タルを破壊（ダメージなし）
      ismarioalive = true;
    }
    return true;
  }
  return false;
}

// スコアとライフをキャンバス上に表示する
let displayScore = () => {
  ctx.fillStyle = 'red';
  ctx.font = "20px Arial";
  let heartsText = '❤️'.repeat(marioLives);
  ctx.fillText(heartsText + " Score : " + score, SCORE_DISPLAY_X, SCORE_DISPLAY_Y);
}

// === タル管理 ===
let rafId; // 物理ループ（requestAnimationFrame）のフレームID
let barrelArrayLadder = [];
let barrelArraynext   = [];
let barrelpositionanimate,
    verticalbarrelanimate;

// タルのスポーンアニメーション開始
let barrelAnimation = () => {
  // 一定間隔で通常タルをスポーンさせる
  barrelpositionanimate = setInterval(() => {
    barrelArrayLadder.push(new BARREL(BARREL_SPAWN_X, BARREL_SPAWN_Y));

    // 上限を超えたら古いタルを削除する
    if (barrelArrayLadder.length > BARREL_MAX_COUNT) {
      barrelArrayLadder.splice(0, BARREL_REMOVE_COUNT);
    }
  }, BARREL_SPAWN_INTERVAL);

  // 一定間隔で青タルをスポーンさせる
  verticalbarrelanimate = setInterval(() => {
    barrelArraynext.push(new BARREL(BLUE_BARREL_SPAWN_X, BLUE_BARREL_SPAWN_Y, blue_barrel_Image));

    // 上限を超えたら最も古いタルを1つ削除する
    if (barrelArraynext.length > BLUE_BARREL_MAX_COUNT) {
      barrelArraynext.splice(0, 1);
    }
  }, BLUE_BARREL_SPAWN_INTERVAL);
}

// 衝突後の処理（ライフが0になったとき）
let afterCollision = () => {
  ismarioalive  = false;
  ismariohammer = false;
  isGameOver    = true;

  // COLLISION_STOP_DELAY ms後にゲームループを停止する（死亡アニメーションを少し見せる）
  setTimeout(() => {
    clearInterval(gameclearance);
  }, COLLISION_STOP_DELAY);

  // RESPAWN_DELAY ms後にゲームオーバー画面へ遷移し、ハンマーをリセット
  setTimeout(() => {
    stopGameCanvas();
    resetHammers();
  }, RESPAWN_DELAY);

  // タルのスポーンを停止し、物理ループを止め、配列をクリア
  clearInterval(barrelpositionanimate);
  clearInterval(verticalbarrelanimate);
  window.cancelAnimationFrame(rafId);
  barrelArrayLadder = [];
  barrelArraynext   = [];
}

// ゲームクリア後の処理
let afterGameWon = () => {
  ismariohammer = false;

  // GAME_WON_DELAY ms後にクリア画面へ遷移し、ハンマーをリセット
  setTimeout(() => {
    gameWonCanvas();
    resetHammers();
  }, GAME_WON_DELAY);

  // ループとタルのスポーンを停止
  clearInterval(gameclearance);
  clearInterval(barrelpositionanimate);
  clearInterval(verticalbarrelanimate);
  window.cancelAnimationFrame(rafId);
  barrelArrayLadder = [];
  barrelArraynext   = [];
}

// マリオの状態をリセットする（リトライ・スタート時）
let updateAll = () => {
  marioPlayer.positionX = MARIO_INIT_X;
  marioPlayer.positionY = MARIO_INIT_Y;
  score         = 0;
  marioLives    = INITIAL_MARIO_LIVES;
  ismariohammer = false;
}

// ハンマー配列を初期状態（3個）に戻すユーティリティ
let resetHammers = () => {
  hammerArray = [
    new HAMMER(HAMMER_ONE_X,   HAMMER_ONE_Y),
    new HAMMER(HAMMER_TWO_X,   HAMMER_TWO_Y),
    new HAMMER(HAMMER_THREE_X, HAMMER_THREE_Y)
  ];
}

// スタート画面の描画
let drawStartScreen = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  startSound.play();
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(banner_Image,       canvas.width / 2 - banner_Image.width / 2,  canvas.height / 2 - banner_Image.height / 2 - 200);
  ctx.drawImage(orangebarrel_Image, canvas.width / 2 - banner_Image.width + 100, canvas.height / 2 - banner_Image.height / 2);
  ctx.drawImage(orangebarrel_Image, canvas.width - 200,                          canvas.height / 2 - banner_Image.height / 2);
  ctx.drawImage(kong_Image,         canvas.width - kong_Image.width * 3.7,       canvas.height / 2 - banner_Image.height / 2);
  ctx.drawImage(hammer_Image,       canvas.width - 430,                          canvas.height / 2 + 35);

  // バージョン表示
  ctx.save();
  ctx.font      = '18px Arial';
  ctx.fillStyle = 'yellow';
  ctx.fillText(`v1.4`, canvas.width - 40, canvas.height - 10);
  ctx.restore();

  // スタートメッセージ表示
  ctx.save();
  ctx.font      = '24px START GAME';
  ctx.fillStyle = 'red';
  ctx.strokeText(`START GAME`, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(`START GAME`,   canvas.width / 2 - 60, canvas.height / 2 + 50);
  ctx.restore();

  ctx.save();
  ctx.font      = '18px START GAME';
  ctx.fillStyle = 'white';
  ctx.fillText(`Press Enter.`, canvas.width / 2 - 30, canvas.height / 2 + 130);
  ctx.restore();
}

// スタート画面を表示し、Enterキーでゲームを開始する
let startGameCanvas = () => {
  // 画像がすべて読み込まれてからスタート画面を描画する
  Promise.all([
    new Promise(resolve => banner_Image.complete       ? resolve() : banner_Image.addEventListener('load', resolve)),
    new Promise(resolve => orangebarrel_Image.complete ? resolve() : orangebarrel_Image.addEventListener('load', resolve)),
    new Promise(resolve => kong_Image.complete         ? resolve() : kong_Image.addEventListener('load', resolve)),
    new Promise(resolve => hammer_Image.complete       ? resolve() : hammer_Image.addEventListener('load', resolve))
  ]).then(drawStartScreen);

  document.onkeypress = (e) => {
    if (e.keyCode == 13 && !isGamePlaying) {
      startGame();
      isGamePlaying = true;
    }
  }
}

// スタートボタン・リトライボタンのクリック処理
window.handleStartRetry = () => {
  if (!isGamePlaying && !isGameOver) {
    // 初回スタート
    startGame();
    isGamePlaying = true;
  } else if (isGameOver) {
    // ゲームオーバー・クリア後のリトライ
    startGame();
    updateAll();
    isGameOver   = false;
    ismarioalive = true;
  }
}

// ゲームを開始する（BGM停止 → 画像ロード確認 → ループ開始）
let startGame = () => {
  startSound.pause();
  new Promise((resolve, reject) => {
    if (mario_Image.complete) {
      resolve();
    } else {
      mario_Image.addEventListener('load', resolve);
      mario_Image.addEventListener('error', reject);
    }
  })
  .catch(() => {}) // 画像の読み込みに失敗しても続行する
  .then(() => {
    barrelAnimation();
    gameLoop();
    // 物理ループを起動（afterCollision / afterGameWon で停止されていた場合も含む）
    rafId = window.requestAnimationFrame(loop);
  });
}

// ゲームオーバー画面を表示する
let stopGameCanvas = () => {
  collisionSound.pause();
  startSound.play();
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(kong_Image,   canvas.width - kong_Image.width * 3.7, canvas.height / 2 - banner_Image.height);
  ctx.drawImage(hammer_Image, canvas.width / 2 - 70,                 canvas.height / 2 - 15);

  // GAME OVER テキスト
  ctx.save();
  ctx.font      = '24px GAME GAME';
  ctx.fillStyle = 'green';
  ctx.strokeText(`GAME OVER`, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(`GAME OVER`,   canvas.width / 2 - 60, canvas.height / 2 - 80);
  ctx.restore();

  // スコア表示
  ctx.save();
  ctx.font      = '18px STOP GAME';
  ctx.fillStyle = 'white';
  ctx.fillText(`Scored : ` + score, canvas.width / 2 - 30, canvas.height / 2 - 50);
  ctx.restore();

  // RETRY テキスト
  ctx.save();
  ctx.font      = '24px STOP GAME';
  ctx.fillStyle = 'red';
  ctx.strokeText(`RETRY`, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(`RETRY`,   canvas.width / 2 - 20, canvas.height / 2);
  ctx.restore();

  ctx.save();
  ctx.font      = '18px STOP GAME';
  ctx.fillStyle = 'white';
  ctx.fillText(`Press Enter.`, canvas.width / 2 - 30, canvas.height / 2 + 130);
  ctx.restore();

  // Enterキーでリトライを可能にする
  document.onkeypress = (e) => {
    if (e.keyCode == 13 && isGameOver) {
      startGame();
      updateAll();
      isGameOver   = false;
      ismarioalive = true;
    }
  }
}

// クリア画面を表示する
let gameWonCanvas = () => {
  isGameOver = true;

  startSound.play();
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(kong_Image,   canvas.width - kong_Image.width * 3.7, canvas.height / 2 - banner_Image.height);
  ctx.drawImage(hammer_Image, canvas.width / 2 - 70,                 canvas.height / 2 - 15);

  // YOU WON テキスト
  ctx.save();
  ctx.font      = '24px YOU WON';
  ctx.fillStyle = 'green';
  ctx.strokeText(`YOU WON`, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(`YOU WON`,   canvas.width / 2 - 60, canvas.height / 2 - 80);
  ctx.restore();

  // スコア表示
  ctx.save();
  ctx.font      = '18px STOP GAME';
  ctx.fillStyle = 'white';
  ctx.fillText(`Scored : ` + score, canvas.width / 2 - 30, canvas.height / 2 - 50);
  ctx.restore();

  // REPLAY テキスト
  ctx.save();
  ctx.font      = '24px STOP GAME';
  ctx.fillStyle = 'red';
  ctx.strokeText(`REPLAY`, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(`REPLAY`,   canvas.width / 2 - 20, canvas.height / 2);
  ctx.restore();

  ctx.save();
  ctx.font      = '18px STOP GAME';
  ctx.fillStyle = 'white';
  ctx.fillText(`Press Enter.`, canvas.width / 2 - 30, canvas.height / 2 + 130);
  ctx.restore();

  // Enterキーでリプレイを可能にする
  document.onkeypress = (e) => {
    if (e.keyCode == 13 && isGameOver) {
      startGame();
      updateAll();
      isGameOver   = false;
      ismarioalive = true;
    }
  }
}

startGameCanvas();
