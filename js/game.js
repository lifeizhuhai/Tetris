//var game = new Phaser.Game(640, 480, Phaser.AUTO, '', {preload: preload, create: create, update: update});
var game = new Phaser.Game(640 * 2, 480, Phaser.AUTO, 'gameDiv');

//Global Variables
var BLOCK_SIDE = 23;
//var BLOCO_SPRITE_SCALE = BLOCK_SIDE / 32;
var MAX_BLOCK_COUNT_HORIZONTAL = 10;
var MAX_BLOCK_COUNT_VERTICAL = 20;
var MAX_INDEX_HORIZONTAL = 9;
var MAX_INDEX_VERTICAL = 19;
var DISPLAY_OFFSET_VERTICAL = 10;
var DISPLAY_OFFSET_HORIZONTAL = 205;
var NEXT_WINDOW_OFFSET_VERTICAL = 56;
var NEXT_WINDOW_OFFSET_HORIZONTAL = 504;
var HOLD_WINDOW_OFFSET_VERTICAL = 58;
var HOLD_WINDOW_OFFSET_HORIZONTAL = 66;

var tetraminos;
var blocos = [];

var board;

var boardDisplay;
var nextWindow;

var holdWindow;
var blocosColors = ["T", "L", "J", "O", "I", "Z", "S"];

var curX = 4, curX2 = 4;
var curY = 0, curY2 = 0;
var lastX = 0, lastX2 = 0;
var lastY = 0, lastY2 = 0;
var curPose = 0, curPose2 = 0;
var piece, piece2;
var holdPiece;
var nextPiece = [-1, -1, -1], nextPiece2 = [-1, -1, -1];
var pieceQueue = [], pieceQueue2 = [];
var pieceIndex, pieceIndex2;
var lastPieceIndex = 0, lastPieceIndex2 = 0;
var nextPieceIndex = [-1, -1, -1], nextPieceIndex2 = [-1, -1, -1];
var holdPieceIndex;
var rotateLock = false, rotateLock2 = false;
var movementLock = false, movementLock2 = false;
var movementDelayLock = false, movementDelayLock2 = false;
var movementIntervalDelay = 0.15, movementIntervalDelay2 = 0.15;
var movementInterval = 0.05;
var tickInterval = 500, tickInterval2 = 500;
var tickIntervalsoftDrop = 50;
var hAxis = 0, hAxis2 = 0;
var bgsNames;
var curBg = 3;
var bgs = [];
var timer = null, timer2 = null;
var ticktimer = null, ticktimer2 = null;
var lineCount = 0, lineCount2 = 0;
var speedUpGoal = 10, speedUpGoal2 = 10;
var linesToClear = [], linesToClear2 = [];
var lineClearX = 0;
var lineClearInterval = 50;
var lineClearTimer;
var lastSecondTimer, lastSecondTimer2;
var ghostY = 0, ghostY2 = 0;
var level = 1, level2 = 1;
var curScore = 0, curScore2 = 0;
var lineClearPts = [100, 300, 500, 800] // single, double, triple, tetris
var softDropPts = 1;
var hardDropPts = 2;
var tSpinPts = [800, 1200, 1600] //single, double, triple(but how?)
var comboIncrement = 50;
var curCombo = 0, curCombo2 = 0;
var labelArt;
var labelLines;
var labelScore, labelScore2;
var labelLevel;
var bg;
var fxPiecePlaced = null;
var fxLineClear = null;
var fxTetris = null;
var fxCombo = null;
var fxMove = null, fxMove2 = null;
var fxRotate = null, fxRotate2 = null;
var fxHold = null;
var music = null;
var trackNames = [];
var userKeys;
var countDownCount;
var countDownTimer;
var countDownTweens;
var countDownText;
var countDownButton;
var countDownButtonLabel;
var multiplierFeedbackText;
var tSpinText;
var levelUpEmitter, levelUpEmitter2;

//controls popup variables
var actionTexts;
var keysButtons;
var keysLabels;
var actionLabels;
var popupPanel;
var popupText;
var isPopupShown;
var waitingKeyPress;
var keyModified;
var tmpUserKeys;


var gameover;
var softDrop, softDrop2;
var hardDrop, hardDrop2;
var hardDropped, hardDropped2;
var hardDropLock, hardDropLock2;
var cleaningLines, cleaningLines2;
var waitingLineClear, waitingLineClear2;
var holdLock, holdLock2;
var lastValidMoveWasASpin, lastValidMoveWasASpin2;
var lastSecondActive, lastSecondActive2;
var lastSecondAdjustmentsActive, lastSecondAdjustmentsActive2;
var floorKicked, floorKicked2;
var preGameCountDown;
var nowPlaying;

var breadCrumbs = [];

game.state.add('boot', bootState);
game.state.add('load', loadState);
// game.state.add('play', playState);
// game.state.add('play2', playState2);
// game.state.add('singlePlayerPrep', singlePlayerPrepState);
// game.state.add('singlePlayerPrep2', singlePlayerPrepState2);
game.state.add('multiplay', multiplayState)
game.state.add('multiPlayerPrep', multiPlayerPrepState);
game.state.add('menu', menuState);
game.state.add('settings', settingsState);
game.state.add('changeBgSt', changeBgState);
game.state.add('credits', creditsState);
game.state.add('controls', controlsState);
game.state.add('soundMenu', soundMenuState);
game.state.add('leaderboard', leaderboardState);
game.state.add('gameover', gameoverState);
game.state.add('singlePlayerPaused', singlePlayerPausedState);

game.state.start('boot');
