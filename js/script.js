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
canvas.style.backgroundColor = 'black';

// ランダムな整数を返すユーティリティ関数
let generateRandomNumber = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// 画像の読み込みを待つユーティリティ関数（エラーも解決として扱う）
const waitForImage = (img) =>
  new Promise(resolve => {
    if (img.complete) {
      resolve();
    } else {
      img.addEventListener('load',  resolve);
      img.addEventListener('error', resolve);
    }
  });

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
    trackLeft     = 0,        // 左向きアニメーションの行インデックス（同じ行を使い描画時に左右反転）
    cutframe      = 0,        // 現在のアニメーションフレーム番号
    srcX          = 0,        // スプライトシートの切り取り開始X
    srcY          = 0,        // スプライトシートの切り取り開始Y
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
    marioLives    = INITIAL_MARIO_LIVES, // 残りライフ数
    selectedDifficultyIndex = 1;        // 選択中の難易度インデックス（0-3）

// === 画像リソース ===
let banner_Image       = new Image();
let orangebarrel_Image = new Image();
let kong_Image         = new Image();
let hammer_Image       = new Image();

banner_Image.src       = "./images/donkeykongbanner.png";
orangebarrel_Image.src = "./images/Barrel0.png";
kong_Image.src         = "./images/DKGrin-1.png";
hammer_Image.src       = "./images/star.svg";

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

// スター取得判定（マリオがスターに触れたとき）
let hammerCollision = (eachhammer) => {
  let index = 0;
  const starW = single_width  * SPRITE_SCALE;
  const starH = single_height * SPRITE_SCALE;

  if (marioPlayer.positionX < eachhammer.positionX + starW &&
      marioPlayer.positionX + single_width > eachhammer.positionX &&
      marioPlayer.positionY < eachhammer.positionY + starH &&
      marioPlayer.positionY + single_height > eachhammer.positionY) {
    // スターを配列から削除し、スター状態をONにする
    index = hammerArray.indexOf(eachhammer);
    hammerArray.splice(index, 1);
    ismariohammer = true;

    // 既存のタイマーをクリアして時間をリセットする
    if (hammerTimerId !== null) {
      clearTimeout(hammerTimerId);
    }
    // HAMMER_DURATION ms後にスター状態を解除する
    hammerTimerId = setTimeout(() => {
      ismariohammer = false;
      hammerTimerId = null;
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

    if (!ismariohammer) {
      // ハンマーなし：ダメージ処理
      marioLives--;
      if (marioLives <= 0) {
        collisionSound.play();
        ismarioalive = false;
        afterCollision();
      }
    } else {
      // ハンマーあり：タルを破壊（ダメージなし）
      score += SCORE_BARREL_HIT;
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
  const heartsText = '❤️'.repeat(marioLives);
  ctx.fillText(`${heartsText} Score : ${score}`, SCORE_DISPLAY_X, SCORE_DISPLAY_Y);
}

// === タル管理 ===
let rafId; // 物理ループ（requestAnimationFrame）のフレームID
let hammerTimerId = null; // スター効果タイマーのハンドル（リセット用）
let barrelArrayLadder = [];
let barrelArraynext   = [];
let barrelpositionanimate,
    verticalbarrelanimate;

// タルスポーン・物理ループをすべて停止し、タル配列をクリアする
let stopAllLoops = () => {
  clearInterval(barrelpositionanimate);
  clearInterval(verticalbarrelanimate);
  window.cancelAnimationFrame(rafId);
  barrelArrayLadder = [];
  barrelArraynext   = [];
};

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

  stopAllLoops();
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
  stopAllLoops();
}

// マリオの状態をリセットする（リトライ・スタート時）
let updateAll = () => {
  marioPlayer.positionX = MARIO_INIT_X;
  marioPlayer.positionY = MARIO_INIT_Y;
  score         = 0;
  marioLives    = DIFFICULTIES[selectedDifficultyIndex].lives;
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
  ctx.fillText(`v1.6`, canvas.width - 40, canvas.height - 10);
  ctx.restore();

  // START GAME テキスト
  ctx.save();
  ctx.font      = '24px Arial';
  ctx.fillStyle = 'red';
  ctx.strokeText(`START GAME`, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(`START GAME`,   canvas.width / 2 - 60, canvas.height / 2 + 30);
  ctx.restore();

  // 難易度選択
  ctx.save();
  ctx.font      = '18px Arial';
  ctx.fillStyle = 'yellow';
  ctx.fillText(`難易度選択:`, canvas.width / 2 - 60, canvas.height / 2 + 80);
  ctx.restore();

  const optionStartY = canvas.height / 2 + 110;
  const optionGap    = 32;
  DIFFICULTIES.forEach((diff, i) => {
    ctx.save();
    ctx.font = '20px Arial';
    if (i === selectedDifficultyIndex) {
      ctx.fillStyle = 'orange';
      ctx.fillText('▶', canvas.width / 2 - 95, optionStartY + i * optionGap);
    } else {
      ctx.fillStyle = 'white';
    }
    ctx.fillText(diff.name, canvas.width / 2 - 70, optionStartY + i * optionGap);
    ctx.restore();
  });

  ctx.save();
  ctx.font      = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`↑↓で選択、Enterでスタート`, canvas.width / 2 - 90, canvas.height / 2 + 260);
  ctx.restore();
}

// スタート画面を表示し、キー操作でゲームを開始する
let startGameCanvas = () => {
  // 画像がすべて読み込まれてからスタート画面を描画する
  Promise.all([
    waitForImage(banner_Image),
    waitForImage(orangebarrel_Image),
    waitForImage(kong_Image),
    waitForImage(hammer_Image)
  ]).then(() => {
    startSound.play().catch(() => {});
    drawStartScreen();
  });

  // 難易度選択の↑↓ナビゲーション
  window.onkeydown = (e) => {
    if (isGamePlaying) return;
    if (e.key === 'ArrowUp' || e.keyCode === 38) {
      selectedDifficultyIndex = (selectedDifficultyIndex - 1 + DIFFICULTIES.length) % DIFFICULTIES.length;
      drawStartScreen();
    } else if (e.key === 'ArrowDown' || e.keyCode === 40) {
      selectedDifficultyIndex = (selectedDifficultyIndex + 1) % DIFFICULTIES.length;
      drawStartScreen();
    }
  };

  // Enterキーでスタート・リトライ（全状態に共通）
  document.onkeypress = (e) => {
    if (e.keyCode == 13) {
      window.handleStartRetry();
    }
  };
}

// スタートボタン・リトライボタンのクリック処理
window.handleStartRetry = () => {
  if (!isGamePlaying && !isGameOver) {
    // 初回スタート
    updateAll();
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
  waitForImage(mario_Image).then(() => {
    barrelAnimation();
    gameLoop();
    // 物理ループを起動（afterCollision / afterGameWon で停止されていた場合も含む）
    rafId = window.requestAnimationFrame(loop);
  });
}

// ゲームオーバー・クリア画面の共通描画処理
let drawEndScreen = (titleText, actionText) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(kong_Image,   canvas.width - kong_Image.width * 3.7, canvas.height / 2 - banner_Image.height);
  ctx.drawImage(hammer_Image, canvas.width / 2 - 70,                 canvas.height / 2 - 15);

  ctx.save();
  ctx.font      = '24px Arial';
  ctx.fillStyle = 'green';
  ctx.strokeText(titleText, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(titleText,   canvas.width / 2 - 60, canvas.height / 2 - 80);
  ctx.restore();

  ctx.save();
  ctx.font      = '18px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Scored : ${score}`, canvas.width / 2 - 30, canvas.height / 2 - 50);
  ctx.restore();

  ctx.save();
  ctx.font      = '24px Arial';
  ctx.fillStyle = 'red';
  ctx.strokeText(actionText, canvas.width / 2,      canvas.height / 2);
  ctx.fillText(actionText,   canvas.width / 2 - 20, canvas.height / 2);
  ctx.restore();

  ctx.save();
  ctx.font      = '18px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Press Enter.`, canvas.width / 2 - 30, canvas.height / 2 + 130);
  ctx.restore();
}

// ゲームオーバー画面を表示する
let stopGameCanvas = () => {
  collisionSound.pause();
  startSound.play();
  drawEndScreen('GAME OVER', 'RETRY');
}

// クリア画面を表示する
let gameWonCanvas = () => {
  isGameOver = true;
  startSound.play();
  drawEndScreen('YOU WON', 'REPLAY');
}

startGameCanvas();
