// ============================================================
// constants.js - ゲーム全体で使用する定数
// ============================================================

// === キャンバス ===
const CANVAS_WIDTH  = 650;  // キャンバスの横幅（ピクセル）
const CANVAS_HEIGHT = 840;  // キャンバスの縦幅（ピクセル）

// === ゲームループ ===
const GAME_LOOP_FPS = 8;    // ゲームループのフレームレート（fps）

// === スプライト共通 ===
const SPRITE_SCALE = 1.5;   // スプライトの描画倍率

// === マリオ ===
const MARIO_INIT_X      = 87;   // マリオの初期X座標
const MARIO_INIT_Y      = 724;  // マリオの初期Y座標
const MARIO_MOVE_SPEED  = 3;    // マリオの水平移動速度（ピクセル/フレーム）
const JUMP_VELOCITY     = 25;   // ジャンプ時にvelocityYから引く値
const GRAVITY_DEFAULT   = 1;    // デフォルト重力加速度
const GRAVITY_ON_PLATFORM = 2;  // プラットフォーム着地時の重力
const GRAVITY_ON_LADDER   = 0;  // ハシゴ昇降中の重力（無重力）
const LADDER_CLIMB_SPEED  = 8;  // ハシゴの昇降速度（ピクセル/フレーム）
const STOP_OFFSET_DEFAULT = 2;  // デフォルトの停止オフセット
const FRICTION            = 0.9; // 摩擦係数（速度の減衰率）
const INITIAL_MARIO_LIVES = 3;  // マリオの初期ライフ数

// === スコア ===
const SCORE_WIN_BONUS  = 100; // ゲームクリア時のボーナス得点
const SCORE_BARREL_HIT = 10;  // タルにぶつかった時の得点

// === タル（BARREL） ===
const BARREL_SPEED               = 7;    // タルの移動速度（ピクセル/フレーム）
const BARREL_SPAWN_INTERVAL      = 4000; // 通常タルのスポーン間隔（ms）
const BLUE_BARREL_SPAWN_INTERVAL = 3000; // 青タルのスポーン間隔（ms）
const BARREL_MAX_COUNT           = 10;   // 通常タルの最大数
const BLUE_BARREL_MAX_COUNT      = 7;    // 青タルの最大数
const BARREL_REMOVE_COUNT        = 4;    // 上限超過時に削除するタル数
const BARREL_SPAWN_X             = 310;  // 通常タルのスポーンX座標
const BARREL_SPAWN_Y             = 82;   // 通常タルのスポーンY座標
const BLUE_BARREL_SPAWN_X        = 310;  // 青タルのスポーンX座標（ドンキーコングと同じX）
const BLUE_BARREL_SPAWN_Y        = 140;  // 青タルのスポーンY座標
const BARREL_RIGHT_BOUNDARY      = 500;  // タル（右向き）の折り返しX座標
const BARREL_LEFT_BOUNDARY       = 110;  // タル（左向き）の折り返しX座標

// 通常タルが右方向に走るプラットフォームのY座標
const PLATFORM_Y_RIGHT = [170, 400, 635];
// 通常タルが左方向に走るプラットフォームのY座標
const PLATFORM_Y_LEFT  = [280, 525, 760];

// 青タルがプレイヤーを追跡する際に水平移動を開始するY座標（最下段のみ）
const BLUE_BARREL_TRACK_YS = [742];

// === ハンマー ===
const HAMMER_DURATION = 9000; // ハンマー効果の持続時間（ms）
// 各ハンマーの初期座標
const HAMMER_ONE_X   = 500, HAMMER_ONE_Y   = 545;
const HAMMER_TWO_X   = 80,  HAMMER_TWO_Y   = 430;
const HAMMER_THREE_X = 540, HAMMER_THREE_Y = 300;

// === タイマー遅延 ===
const COLLISION_STOP_DELAY = 500;  // 衝突後にゲームを停止するまでの遅延（ms）
const RESPAWN_DELAY        = 3500; // 死亡後の画面切り替え遅延（ms）
const GAME_WON_DELAY       = 2000; // クリア後の画面切り替え遅延（ms）

// === 衝突判定マージン ===
const COLLISION_MARGIN_X   = 20;  // 水平方向の衝突判定の余裕（ピクセル）
const COLLISION_MARGIN_Y_TOP = 40; // プラットフォーム上端からの垂直マージン
const COLLISION_MARGIN_Y_BOT = 5;  // プレイヤー下端からの垂直マージン（着地判定）
const COLLISION_JUMP_RANGE   = 100; // ジャンプ中の着地判定の垂直範囲

// === スコア表示位置 ===
const SCORE_DISPLAY_X = 450; // スコア表示のX座標
const SCORE_DISPLAY_Y = 40;  // スコア表示のY座標

// === ドラム缶・炎の配置 ===
const DRUM_X = 140; // ドラム缶のX座標（マリオ初期位置の右）
const DRUM_Y = 732; // ドラム缶のY座標（最下段プラットフォームの上）
// 炎はドラム缶の中央に重なるよう配置: DRUM_X + (drum幅16*1.5/2) - (炎幅21.5*1.5/2) ≈ DRUM_X - 4
const FIRE_X = DRUM_X - 4; // 炎のX座標（ドラム缶の中央上）
// 炎はドラム缶の上端に乗せる: DRUM_Y - (炎高さ23*1.5) ≈ DRUM_Y - 35
const FIRE_Y = DRUM_Y - 34; // 炎のY座標（ドラム缶の上端）
