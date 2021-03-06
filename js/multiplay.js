var multiplayState = {
	create: function(){
		console.log("multi");
		game.stage.backgroundColor = "#000000";
		resetNav();
		initKeys();
		bg = game.add.sprite(0, 0, 'bg'+curBg);
		bg2 = game.add.sprite(640, 0, 'bg'+curBg);
		game.add.sprite(0, 0, 'board');
		game.add.sprite(640, 0, 'board');
		createBoardDisplay();
		createNextWindow();
		createHoldWindow();
		tetraminos = game.cache.getJSON('tetraminosJSON');
		if(!nowPlaying){
			initPieces();
			initPieces2();
		}
		createTexts();
		createSounds();
		createPauseButton();
		createParticleEmitters();
		hardDropped = false;
		floorKicked = false;
		startCountDown();		
	},

	update: function(){
		if(preGameCountDown){
			//wait
		} else if(!isGameOver()){
			if(cleaningLines){
				if(!waitingLineClear){
					waitingLineClear = true;
					curCombo += 1;
					lineClearTimer = game.time.events.loop(Phaser.Timer.SECOND * lineClearInterval / 1000, lineClear, this);
					if(lastValidMoveWasASpin && lastPieceIndex==0 && testTSpin()){ //if it is a t, if the last valid move was a rotation and if the t-spin verification is OK
						score(tSpinPts[linesToClear.length - 1] * level + (comboIncrement * curCombo));
						showTspinAnimation(lastX, lastY);
					} else {
						score(lineClearPts[linesToClear.length - 1] * level + (comboIncrement * curCombo));
					}
					
					if(curCombo > 1){
						fxCombo.play();
						showMultiplier(lastX, lastY);
					}
					if(linesToClear.length == 4){
						fxTetris.play();
					} else {
						fxLineClear.play();
					}
				}
			} else if(!gameover){
				getInput();
				if(hardDrop){
					while(testDrop()){
						score(hardDropPts);
						clearPiece();
						curY++;
						drawPiece();
					}
					hardDrop = false;
					hardDropped = true;
					testTick();
				}
				updateTickSpeed();
				updateBoardDisplayed();
				updateNextWindow();
			}

			// player 2
			if(cleaningLines2){
				if(!waitingLineClear2){
					waitingLineClear2 = true;
					curCombo2 += 1;
					lineClearTimer2 = game.time.events.loop(Phaser.Timer.SECOND * lineClearInterval / 1000, lineClear2, this);
					if(lastValidMoveWasASpin2 && lastPieceIndex2==0 && testTSpin2()){ //if it is a t, if the last valid move was a rotation and if the t-spin verification is OK
						score2(tSpinPts[linesToClear2.length - 1] * level2 + (comboIncrement * curCombo2));
						showTspinAnimation(lastX2, lastY2);
					} else {
						score2(lineClearPts[linesToClear2.length - 1] * level2 + (comboIncrement * curCombo2));
					}
					
					if(curCombo2 > 1){
						fxCombo.play();
						showMultiplier2(lastX2, lastY2);
					}
					if(linesToClear2.length == 4){
						fxTetris.play();
					} else {
						fxLineClear.play();
					}
				}
			} else if(!gameover2) {
				getInput2();
				if(hardDrop2){
					while(testDrop2()){
						score2(hardDropPts);
						clearPiece2();
						curY2++;
						drawPiece2();
					}
					hardDrop2 = false;
					hardDropped2 = true;
					testTick();
				}
				updateTickSpeed2();
				updateBoardDisplayed2();
				updateNextWindow2();
			}
		} else {
			clearNextWindow();
			clearBoardDisplay();
			softDrop = false;
			nowPlaying = false;
			game.state.start('gameover');
		}
	}
};

function blocoOff(x, y){ 
	boardDisplay[y][x].frameName = 'OFF';
}

function blocoOff2(x, y){ 
	boardDisplay2[y][x].frameName = 'OFF';
}

function blocoOn(x, y){ //lits bloco at position x, y
	var colorIndex = board[y][x];
	if(colorIndex == -2){
		boardDisplay[y][x].frameName = 'GHOST';
	} else {
		colorIndex -= 10;
		if(colorIndex < 0){
			colorIndex += 10;
		}
		boardDisplay[y][x].frameName = blocosColors[colorIndex];
	}
}

function blocoOn2(x, y){ //lits bloco at position x, y
	var colorIndex = board2[y][x];
	if(colorIndex == -2){
		boardDisplay2[y][x].frameName = 'GHOST';
	} else {
		colorIndex -= 10;
		if(colorIndex < 0){
			colorIndex += 10;
		}
		boardDisplay2[y][x].frameName = blocosColors[colorIndex];
	}
}

function bringLinesDown(){
	var prevLine;
	for(var k = 0; k < linesToClear.length; k ++ ){
		for(var i = linesToClear[k]; i > 0; i--){
			prevLine = i -1;
			for(var j=0; j< MAX_BLOCK_COUNT_HORIZONTAL; j++){
				board[i][j] = board[prevLine][j];
				if(board[i][j] < 10){
					board[i][j] = -1;
				}
			}
		}
		lineCount++;
		updateLabelLines();
	}
	for(i = 0; i < 10; i++){
		board[0][i] = -1;
	}
	cleaningLines = false;
	waitingLineClear = false;
	linesToClear = [];
	game.time.events.remove(lineClearTimer);
	curY = -1; //gambiarra
	
	testTick();
}

function bringLinesDown2(){
	var prevLine;
	for(var k = 0; k < linesToClear2.length; k ++ ){
		for(var i = linesToClear2[k]; i > 0; i--){
			prevLine = i -1;
			for(var j=0; j< MAX_BLOCK_COUNT_HORIZONTAL; j++){
				board2[i][j] = board2[prevLine][j];
				if(board2[i][j] < 10){
					board2[i][j] = -1;
				}
			}
		}
		lineCount2++;
		updateLabelLines2();
	}
	for(i = 0; i < 10; i++){
		board2[0][i] = -1;
	}
	cleaningLines2 = false;
	waitingLineClear2 = false;
	linesToClear2 = [];
	game.time.events.remove(lineClearTimer2);
	curY2 = -1; //gambiarra
	
	testTick2();
}

function clearBoardDisplay(){
	for(var i = 0; i < MAX_BLOCK_COUNT_HORIZONTAL; i++){
		for(var j = 0; j < MAX_BLOCK_COUNT_VERTICAL; j++){
			blocoOff(i, j);
		}
	}
}

function clearGhost(){
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
		tmpX = piece.poses[curPose][i][0] + curX ;
		tmpY = piece.poses[curPose][i][1] + ghostY;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			break;
		} else if(board[tmpY][tmpX] == -2){
			board[tmpY][tmpX] = -1;
		}
	}
}

function clearGhost2(){
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
		tmpX = piece2.poses[curPose2][i][0] + curX2 ;
		tmpY = piece2.poses[curPose2][i][1] + ghostY2;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			break;
		} else if(board2[tmpY][tmpX] == -2){
			board2[tmpY][tmpX] = -1;
		}
	}
}

function clearHoldWindow(){
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 4; j++){
			holdWindow[j][i].frameName = "OFF";
		}
	}
}

function clearHoldWindow2(){
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 4; j++){
			holdWindow2[j][i].frameName = "OFF";
		}
	}
}

function clearNextWindow(){
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 12; j++){
			nextWindow[j][i].frameName = "OFF";
		}
	}
}

function clearNextWindow2(){
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 12; j++){
			nextWindow2[j][i].frameName = "OFF";
		}
	}
}

function clearPiece(){
	clearGhost();
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
		tmpX = piece.poses[curPose][i][0] + curX ;
		tmpY = piece.poses[curPose][i][1] + curY;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			// do nothing
		} else {
			board[tmpY][tmpX] = -1;
		}
	}
}

function clearPiece2(){
	clearGhost2();
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
		tmpX = piece2.poses[curPose2][i][0] + curX2 ;
		tmpY = piece2.poses[curPose2][i][1] + curY2;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			// do nothing
		} else {
			board2[tmpY][tmpX] = -1;
		}
	}
}

function startCountDown(){
	preGameCountDown = true;
	countDownCount = 3;
	countDownText = game.add.text(game.world.width / 2, game.world.height / 2, getText("SinglePlayerGame", 6), getStyle("countDown"));
	countDownText.anchor.set(0.5, 0.5);
	countDownText.alpha = 1;
	
	countDownButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 70, "medium_button", readyButton, this, 1, 2, 0);
	countDownButton.anchor.set(0.5, 0.5);
	countDownButtonLabel = game.add.text(game.world.width / 2, (game.world.height / 2) + 70, getText("SinglePlayerGame", 8), getStyle("button_regular"));
	countDownButtonLabel.anchor.set(0.5, 0.5);

	quitButton = game.add.button(game.world.width / 2, (game.world.height / 2) + 120, "medium_button", goBack, this, 1, 2, 0);
	quitButton.anchor.set(0.5, 0.5);
	quitButtonLabel = game.add.text(game.world.width / 2, (game.world.height / 2) + 120, getText("Standard", 2), getStyle("button_regular"));
	quitButtonLabel.anchor.set(0.5, 0.5);
}

function countDown(){
	if(countDownCount > -1){
		tmpTime = 0;
		if(countDownText.alpha <= 0.1){
			countDownText.fontSize = 128;
			if(countDownCount == 0){
				countDownText.text = getText("SinglePlayerGame", 7);
			} else {
				countDownText.text = countDownCount;
			}
			game.add.tween(countDownText).to({alpha: 1, fontSize:128}, 100, "Linear", true);
			tmpTime = 600;
		} else {
			countDownCount--;
			game.add.tween(countDownText).to({alpha: 0, fontSize: 160}, 400, "Linear", true);
			tmpTime = 400;
		}
		game.time.events.remove(countDownTimer);
		countDownTimer = game.time.events.loop(tmpTime, countDown, this);
	} else {
		game.time.events.remove(countDownTimer);
		preGameCountDown = false;
		music.loopFull(music.volume);
		testTick();
		testTick2();
	}

}

function createBoardDisplay(){
	//create grid with blocos
	for(var i = 0; i < MAX_BLOCK_COUNT_HORIZONTAL; i++){
		for(var j = 0; j < MAX_BLOCK_COUNT_VERTICAL; j++){
			boardDisplay[j][i] = game.add.sprite(DISPLAY_OFFSET_HORIZONTAL + (i * BLOCK_SIDE), DISPLAY_OFFSET_VERTICAL + (j * BLOCK_SIDE), 'blocoatlas', 'OFF');
		}
	}

	for(var i = 0; i < MAX_BLOCK_COUNT_HORIZONTAL; i++){
		for(var j = 0; j < MAX_BLOCK_COUNT_VERTICAL; j++){
			boardDisplay2[j][i] = game.add.sprite(DISPLAY_OFFSET_HORIZONTAL + 640 + (i * BLOCK_SIDE), DISPLAY_OFFSET_VERTICAL + (j * BLOCK_SIDE), 'blocoatlas', 'OFF');
		}
	}
}

function createHoldWindow(){
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 4; j++){
			holdWindow[j][i] = game.add.sprite(HOLD_WINDOW_OFFSET_HORIZONTAL + (i * BLOCK_SIDE) , HOLD_WINDOW_OFFSET_VERTICAL + (j * BLOCK_SIDE), 'blocoatlas', 'OFF');
		}
	}

	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 4; j++){
			holdWindow2[j][i] = game.add.sprite(HOLD_WINDOW_OFFSET_HORIZONTAL + 640 + (i * BLOCK_SIDE) , HOLD_WINDOW_OFFSET_VERTICAL + (j * BLOCK_SIDE), 'blocoatlas', 'OFF');
		}
	}
}

function createNextWindow(){
	var nextMargin = 0;
	var marginIncrement = 3;
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 12; j++){
			if((j) % 4 == 0 && j > 3){
				nextMargin += marginIncrement;
			}
			nextWindow[j][i] = game.add.sprite(NEXT_WINDOW_OFFSET_HORIZONTAL + (i * BLOCK_SIDE) , NEXT_WINDOW_OFFSET_VERTICAL + (j * BLOCK_SIDE) + nextMargin, 'blocoatlas', 'OFF');
		}
		nextMargin = 0;
	}

	nextMargin = 0;
	marginIncrement = 3;
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 12; j++){
			if((j) % 4 == 0 && j > 3){
				nextMargin += marginIncrement;
			}
			nextWindow2[j][i] = game.add.sprite(NEXT_WINDOW_OFFSET_HORIZONTAL + 640 + (i * BLOCK_SIDE) , NEXT_WINDOW_OFFSET_VERTICAL + (j * BLOCK_SIDE) + nextMargin, 'blocoatlas', 'OFF');
		}
		nextMargin = 0;
	}
}

function createParticleEmitters(){
	levelUpEmitter = game.add.emitter(100, 410, 100);
	levelUpEmitter.makeParticles('upArrow');
	levelUpEmitter.minParticleSpeed.set(0, -30);
	levelUpEmitter.maxParticleSpeed.set(0, 0);
	levelUpEmitter.gravity = -200;
	levelUpEmitter.width = 159;
	levelUpEmitter.setRotation(0, 0);
	levelUpEmitter.children.forEach( function(p) {
		p.tint = 0x00dd00;
	});
}

function createPauseButton(){
	pauseButton = game.add.button(5, 5, "small_button", pauseGame, this, 1,2,0);
	pauseButtonIcon = game.add.sprite(5, 5, "pause_icon");
	pauseButtonIcon.tint = 0x222222;
}
function pauseGame(){
	show("singlePlayerPaused");
}


function createTexts(){
	var bgArtStyle = getStyle("bg_art");
    var bgArtText = bgsTexts[curBg];
    labelArt = game.add.text(0, 0, bgArtText, bgArtStyle);
    labelArt.setTextBounds(463, 378, 154, 92);
    labelArt2 = game.add.text(0, 0, bgArtText, bgArtStyle);
    labelArt2.setTextBounds(463 + 640, 378, 154, 92);

	var scoreStyle = getStyle("text_single_player");
    var scoreText = curScore;
    labelScore = game.add.text(0, 0, scoreText, scoreStyle);
    labelScore.setTextBounds(23, 348, 159, 23);
    labelScore2 = game.add.text(0, 0, scoreText, scoreStyle);
    labelScore2.setTextBounds(23 + 640, 348, 159, 23);

    var levelText = level;
    labelLevel = game.add.text(0, 0, levelText, scoreStyle);
    labelLevel.setTextBounds(23, 397, 159, 23);
    labelLevel2 = game.add.text(0, 0, levelText, scoreStyle);
    labelLevel2.setTextBounds(23 + 640, 397, 159, 23);

	var linesText = lineCount;
    labelLines = game.add.text(0, 0, linesText, scoreStyle);
    labelLines.setTextBounds(23, 446, 159, 23);
    labelLines2 = game.add.text(0, 0, linesText, scoreStyle);
    labelLines2.setTextBounds(23 + 640, 446, 159, 23);

    var labelGameStyle = getStyle("text_single_player_label");
    l = game.add.text(0, 0, getText("SinglePlayerGame", 0), labelGameStyle);
    l.setTextBounds(23, 28, 159, 23);
    l2 = game.add.text(0, 0, getText("SinglePlayerGame", 0), labelGameStyle);
    l2.setTextBounds(23 + 640, 28, 159, 23);

    l = game.add.text(0, 0, getText("SinglePlayerGame", 1), labelGameStyle);
    l.setTextBounds(463, 28, 159, 23);
    l2 = game.add.text(0, 0, getText("SinglePlayerGame", 1), labelGameStyle);
    l2.setTextBounds(463 + 640, 28, 159, 23);

    l = game.add.text(0, 0, getText("SinglePlayerGame", 2), labelGameStyle);
    l.setTextBounds(463, 350, 159, 23);
    l2 = game.add.text(0, 0, getText("SinglePlayerGame", 2), labelGameStyle);
    l2.setTextBounds(463 + 640, 350, 159, 23);

    l = game.add.text(0, 0, getText("SinglePlayerGame", 3), labelGameStyle);
    l.setTextBounds(23, 320, 159, 23);
    l2 = game.add.text(0, 0, getText("SinglePlayerGame", 3), labelGameStyle);
    l2.setTextBounds(23 + 640, 320, 159, 23);

    l = game.add.text(0, 0, getText("SinglePlayerGame", 4), labelGameStyle);
    l.setTextBounds(23, 372, 159, 23);
    l2 = game.add.text(0, 0, getText("SinglePlayerGame", 4), labelGameStyle);
    l2.setTextBounds(23 + 640, 372, 159, 23);

    l = game.add.text(0, 0, getText("SinglePlayerGame", 5), labelGameStyle);
    l.setTextBounds(23, 422, 159, 23);
    l2 = game.add.text(0, 0, getText("SinglePlayerGame", 5), labelGameStyle);
    l2.setTextBounds(23 + 640, 422, 159, 23);

    multiplierFeedbackText = game.add.text(0, 0, "", getStyle("multiplier"));
    multiplierFeedbackText.anchor.setTo(0.5, 0.5);
    multiplierFeedbackText.alpha = 0;

    multiplierFeedbackText2 = game.add.text(640, 0, "", getStyle("multiplier"));
    multiplierFeedbackText2.anchor.setTo(0.5, 0.5);
    multiplierFeedbackText2.alpha = 0;

    tSpinText = game.add.text(0, 0, "T-Spin", getStyle("multiplier"));
    tSpinText.anchor.setTo(0.5, 0.5);
    tSpinText.alpha = 0;
    tSpinText2 = game.add.text(640, 0, "T-Spin", getStyle("multiplier"));
    tSpinText2.anchor.setTo(0.5, 0.5);
    tSpinText2.alpha = 0;
}

function drawGhost(){
	ghostY = curY;
	while(testGhostDrop()){
		ghostY++;
		if(ghostY >= MAX_BLOCK_COUNT_VERTICAL){
			ghostY--;
			break;
		}
	}
	if(ghostY < MAX_BLOCK_COUNT_VERTICAL){
		for(var i = 0; i < 4; i++){
			tmpX = piece.poses[curPose][i][0] + curX ;
			tmpY = piece.poses[curPose][i][1] + ghostY;
			if(tmpX < 0 || tmpY < 0){
				// do nothing
			} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
				// do nothing
			} else {
				board[tmpY][tmpX] = -2;//ghost index
			}
		}
	}
}

function drawGhost2(){
	ghostY2 = curY2;
	while(testGhostDrop2()){
		ghostY2++;
		if(ghostY2 >= MAX_BLOCK_COUNT_VERTICAL){
			ghostY2--;
			break;
		}
	}
	if(ghostY2 < MAX_BLOCK_COUNT_VERTICAL){
		for(var i = 0; i < 4; i++){
			tmpX = piece2.poses[curPose2][i][0] + curX2 ;
			tmpY = piece2.poses[curPose2][i][1] + ghostY2;
			if(tmpX < 0 || tmpY < 0){
				// do nothing
			} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
				// do nothing
			} else {
				board2[tmpY][tmpX] = -2;//ghost index
			}
		}
	}
}

function drawPiece(){
	drawGhost();
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
		tmpX = piece.poses[curPose][i][0] + curX ;
		tmpY = piece.poses[curPose][i][1] + curY;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			// do nothing
		} else {
			board[tmpY][tmpX] = pieceIndex;
		}
	}
}

function drawPiece2(){
	drawGhost2();
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
		tmpX = piece2.poses[curPose2][i][0] + curX2 ;
		tmpY = piece2.poses[curPose2][i][1] + curY2;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			// do nothing
		} else {
			board2[tmpY][tmpX] = pieceIndex;
		}
	}
}

function getInput(){
	hAxis = 0;
	//if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
	if(game.input.keyboard.isDown(Phaser.Keyboard.A)){
		hAxis --;
	} else if(game.input.keyboard.isDown(Phaser.Keyboard.D)){
		hAxis++;
	} else {
		unlockMovement();
		movementDelayLock = false;
	}

	if(hAxis > 0){
		if(!movementLock){
			moveRight();
		}
	} else if(hAxis < 0){
		if(!movementLock){
			moveLeft();
		}
	} else {
		unlockMovement();
		movementDelayLock = false;
	}
	
	if(game.input.keyboard.isDown(Phaser.Keyboard.W)){
		if(!rotateLock){
			rotateClockWise();
			rotateLock = true;
		}
	} else if(game.input.keyboard.isDown(Phaser.Keyboard.Z)){
		if(!rotateLock){
			rotateCounterClockWise();
			rotateLock = true;
		}
	} else {
		rotateLock = false;
	}

	

	// if(game.input.keyboard.isDown(Phaser.Keyboard.S)){
	// 	if(!softDrop){
	// 		killSoftDropTimer();
	// 		softDrop = true;
	// 		testTick();
	// 	}
	// } else {
	// 	if(softDrop)
	// 	{
	// 		killSoftDropTimer();
	// 		softDrop = false;
	// 		testTick();
	// 	}
	// }

	if(game.input.keyboard.isDown(Phaser.Keyboard.S)){
		if (!hardDropLock){
			hardDropLock = true;
			hardDrop = true;
			hardDropped = false;
			lastValidMoveWasASpin = false;
		}
	} else {
		if(hardDropLock){
			hardDropLock = false;
		}
	}

	if(game.input.keyboard.isDown(Phaser.Keyboard.X)){
		if(!holdLock){
			holdLock = true;
			hold();
		}
	}
}

function getInput2(){
	hAxis2 = 0;
	//if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
	if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
		hAxis2--;
	} else if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
		hAxis2++;
	} else {
		unlockMovement2();
		movementDelayLock2 = false;
	}

	if(hAxis2 > 0){
		if(!movementLock2){
			moveRight2();
		}
	} else if(hAxis2 < 0){
		if(!movementLock2){
			moveLeft2();
		}
	} else {
		unlockMovement2();
		movementDelayLock2 = false;
	}
	
	if(game.input.keyboard.isDown(Phaser.Keyboard.UP)){
		if(!rotateLock2){
			rotateClockWise2();
			rotateLock2 = true;
		}
	} else if(game.input.keyboard.isDown(Phaser.Keyboard.J)){
		if(!rotateLock2){
			rotateCounterClockWise2();
			rotateLock2 = true;
		}
	} else {
		rotateLock2 = false;
	}

	

	// if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
	// 	if(!softDrop2){
	// 		killSoftDropTimer2();
	// 		softDrop2 = true;
	// 		testTick2();
	// 	}
	// } else {
	// 	if(softDrop2)
	// 	{
	// 		killSoftDropTimer2();
	// 		softDrop2 = false;
	// 		testTick2();
	// 	}
	// }

	if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){
		if (!hardDropLock2){
			hardDropLock2 = true;
			hardDrop2 = true;
			hardDropped2 = false;
			lastValidMoveWasASpin2 = false;
		}
	} else {
		if(hardDropLock2){
			hardDropLock2 = false;
		}
	}

	if(game.input.keyboard.isDown(Phaser.Keyboard.K)){
		if(!holdLock2){
			holdLock2 = true;
			hold2();
		}
	}
}

function getPiece(){
	piece = nextPiece[0];
	pieceIndex = nextPieceIndex[0];

	nextPieceIndex[0] = nextPieceIndex[1];
	nextPieceIndex[1] = nextPieceIndex[2];
	nextPieceIndex[2] = pieceQueue.pop();

	nextPiece[0] = nextPiece[1];
	nextPiece[1] = nextPiece[2];
	nextPiece[2] = tetraminos.tetraminos[nextPieceIndex[2]];
	
	curPose = 0;

	if(pieceQueue.length == 0){
		fillPieceQueue();
	}
}

function getPiece2(){
	piece2 = nextPiece2[0];
	pieceIndex2 = nextPieceIndex2[0];

	nextPieceIndex2[0] = nextPieceIndex2[1];
	nextPieceIndex2[1] = nextPieceIndex2[2];
	nextPieceIndex2[2] = pieceQueue2.pop();

	nextPiece2[0] = nextPiece2[1];
	nextPiece2[1] = nextPiece2[2];
	nextPiece2[2] = tetraminos.tetraminos[nextPieceIndex2[2]];
	
	curPose2 = 0;

	if(pieceQueue2.length == 0){
		fillPieceQueue2();
	}
}

function hold(){
	clearPiece();
	if(holdPiece == null){
		holdPiece = piece;
		holdPieceIndex = pieceIndex;
		newPiece();
	} else {
		foo = holdPiece;
		holdPiece = piece;
		piece = foo;

		bar = holdPieceIndex;
		holdPieceIndex = pieceIndex;
		pieceIndex = bar;

		curY = -1;
		curX = 4;
		curPose = 0;
	}
	clearHoldWindow();
	updateHoldWindow();
	fxHold.play();
}

function hold2(){
	clearPiece2();
	if(holdPiece2 == null){
		holdPiece2 = piece2;
		holdPieceIndex2 = pieceIndex;
		newPiece2();
	} else {
		foo2 = holdPiece;
		holdPiece2 = piece2;
		piece2 = foo2;

		bar2 = holdPieceIndex2;
		holdPieceIndex2 = pieceIndex2;
		pieceIndex2 = bar2;

		curY2 = -1;
		curX2 = 4;
		curPose2 = 0;
	}
	clearHoldWindow2();
	updateHoldWindow2();
	fxHold.play();
}

function fillPieceQueue(){
	pieceQueue = [];
	while(pieceQueue.length < 7){
		test = game.rnd.integerInRange(0, 6);
		count = 0;
		for(i = 0; i<pieceQueue.length;i++){
			if(pieceQueue[i] == test){
				count++;
				break;
			}
		}
		if(count == 0){
			pieceQueue.push(test);
		}
	}
}

function fillPieceQueue2(){
	pieceQueue2 = [];
	while(pieceQueue2.length < 7){
		test = game.rnd.integerInRange(0, 6);
		count = 0;
		for(i = 0; i<pieceQueue2.length;i++){
			if(pieceQueue2[i] == test){
				count++;
				break;
			}
		}
		if(count == 0){
			pieceQueue2.push(test);
		}
	}
}

function initPieces(){
	fillPieceQueue();
	pieceIndex = pieceQueue.pop();
	piece = tetraminos.tetraminos[pieceIndex];
	for(var i = 0; i < 3; i++){
		nextPieceIndex[i] = pieceQueue.pop();
		nextPiece[i] = tetraminos.tetraminos[nextPieceIndex[i]];
	}
	curPose = 0;
}

function initPieces2(){
	fillPieceQueue2();
	pieceIndex2 = pieceQueue2.pop();
	piece2 = tetraminos.tetraminos[pieceIndex2];
	for(var i = 0; i < 3; i++){
		nextPieceIndex2[i] = pieceQueue2.pop();
		nextPiece2[i] = tetraminos.tetraminos[nextPieceIndex2[i]];
	}
	curPose2 = 0;
}

function killSoftDropTimer(){
	if(ticktimer != null){
		game.time.events.remove(ticktimer);
	}
}

function killSoftDropTimer2(){
	if(ticktimer2 != null){
		game.time.events.remove(ticktimer2);
	}
}

function lineClear(){
	for(var i = 0; i < linesToClear.length; i++ ){
		board[linesToClear[i][lineClearX]] = -1;
		blocoOff(lineClearX, linesToClear[i]);
	}
	if(lineClearX >= MAX_INDEX_HORIZONTAL){
		bringLinesDown();
	} else {
		lineClearX++;
	}
}

function lineClear2(){
	for(var i = 0; i < linesToClear2.length; i++ ){
		board2[linesToClear2[i][lineClearX2]] = -1;
		blocoOff2(lineClearX2, linesToClear2[i]);
	}
	if(lineClearX2 >= MAX_INDEX_HORIZONTAL){
		bringLinesDown2();
	} else {
		lineClearX2++;
	}
}

function moveRight(){
	if(testMoveRight()){
		clearPiece();
		curX ++;
		drawPiece();
	}
	unlockMovement();
	interval = 0;
	if(movementDelayLock){
		interval = movementInterval;
	} else {
		interval = movementIntervalDelay;
		movementDelayLock = true;
	}
	movementLock = true;
	timer = game.time.events.loop(Phaser.Timer.SECOND * interval, unlockMovement, this);
	fxMove.play();
}

function moveRight2(){
	if(testMoveRight2()){
		clearPiece2();
		curX2 ++;
		drawPiece2();
	}
	unlockMovement2();
	interval = 0;
	if(movementDelayLock2){
		interval = movementInterval;
	} else {
		interval = movementIntervalDelay2;
		movementDelayLock2 = true;
	}
	movementLock2 = true;
	timer2 = game.time.events.loop(Phaser.Timer.SECOND * interval, unlockMovement2, this);
	fxMove.play();
}

function moveLeft(){
	if(testMoveLeft()){
		clearPiece();
		curX --;
		drawPiece();
	}	
	unlockMovement();
	interval = 0;
	if(movementDelayLock){
		interval = movementInterval;
	} else {
		interval = movementIntervalDelay;
		movementDelayLock = true;
	}
	movementLock = true;
	timer = game.time.events.loop(Phaser.Timer.SECOND * interval, unlockMovement, this);
	fxMove.play();
}

function moveLeft2(){
	if(testMoveLeft2()){
		clearPiece2();
		curX2 --;
		drawPiece2();
	}	
	unlockMovement2();
	interval = 0;
	if(movementDelayLock2){
		interval = movementInterval;
	} else {
		interval = movementIntervalDelay2;
		movementDelayLock2 = true;
	}
	movementLock2 = true;
	timer2 = game.time.events.loop(Phaser.Timer.SECOND * interval, unlockMovement2, this);
	fxMove.play();
}

function newPiece(){
	getPiece();
	curY = -1;
	curX = 4;
}

function newPiece2(){
	getPiece2();
	curY2 = -1;
	curX2 = 4;
}

function placeOnBoard(){
	//unecessary testings
	var tmpX;
	var tmpY;
	lastSecondActive = false;
	floorKicked = false;
	for(var i = 0; i < 4; i++){
		tmpX = piece.poses[curPose][i][0] + curX ;
		tmpY = piece.poses[curPose][i][1] + curY;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			// do nothing
		} else {
			board[tmpY][tmpX] = pieceIndex + 10;
		}
	}
	if(holdLock){
		holdLock = false;
	}
	fxPiecePlaced.play();
	lastX = curX;
	lastY= curY;
	lastPieceIndex = pieceIndex;
}

function placeOnBoard2(){
	//unecessary testings
	var tmpX;
	var tmpY;
	lastSecondActive2 = false;
	floorKicked2 = false;
	for(var i = 0; i < 4; i++){
		tmpX = piece2.poses[curPose2][i][0] + curX2 ;
		tmpY = piece2.poses[curPose2][i][1] + curY2;
		if(tmpX < 0 || tmpY < 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			// do nothing
		} else {
			board2[tmpY][tmpX] = pieceIndex2 + 10;
		}
	}
	if(holdLock2){
		holdLock2 = false;
	}
	fxPiecePlaced.play();
	lastX2 = curX2;
	lastY2= curY2;
	lastPieceIndex2 = pieceIndex2;
}

function printBoard(){
	var line = "";
	for (var i = 0; i < MAX_BLOCK_COUNT_VERTICAL; i++){
		line = i + " - ";
		for (var j = 0; j < MAX_BLOCK_COUNT_HORIZONTAL; j++){
			line+= board[i][j] + "|";
		}
		console.log(line);
	}
}

function readyButton(){
	nowPlaying = true;
	countDownText.alpha = 0;
	countDown();
	countDownButton.pendingDestroy = true;
	countDownButtonLabel.pendingDestroy = true;
	quitButton.pendingDestroy = true;
	quitButtonLabel.pendingDestroy = true;
}

function rotateClockWise(){
	if(testRotateClockWise(curX, curY)){
		clearPiece();
		curPose++;
		if(curPose > 3){
			curPose = 0;
		}
		drawPiece();
		fxRotate.play();
	} else if(!floorKicked && testRotateClockWise(curX, curY -1)){ //test floor Kick
		clearPiece();
		curPose++;
		curY--;
		floorKicked = true;
		if(curPose > 3){
			curPose = 0;
		}
		drawPiece();
		fxRotate.play();
	} else if(!testWallKicks(true)){
		if(curY +1 <= MAX_INDEX_VERTICAL){
			if(testRotateClockWise(curX, curY + 1)){ //test down kick
				clearPiece();
				curY++;
				curPose++;
				if(curPose > 3){
					curPose = 0;
				}
				drawPiece();
				fxRotate.play();
			}
		}
	}
}

function rotateClockWise2(){
	if(testRotateClockWise2(curX2, curY2)){
		clearPiece2();
		curPose2++;
		if(curPose2 > 3){
			curPose2 = 0;
		}
		drawPiece2();
		fxRotate.play();
	} else if(!floorKicked2 && testRotateClockWise2(curX2, curY2 -1)){ //test floor Kick
		clearPiece2();
		curPose2++;
		curY2--;
		floorKicked2 = true;
		if(curPose2 > 3){
			curPose2 = 0;
		}
		drawPiece2();
		fxRotate.play();
	} else if(!testWallKicks2(true)){
		if(curY2 +1 <= MAX_INDEX_VERTICAL){
			if(testRotateClockWise2(curX2, curY2 + 1)){ //test down kick
				clearPiece2();
				curY2++;
				curPose2++;
				if(curPose2 > 3){
					curPose2 = 0;
				}
				drawPiece2();
				fxRotate.play();
			}
		}
	}
}

function rotateCounterClockWise(){
	if(testRotateCounterClockWise(curX, curY)){
		clearPiece();
		curPose--;
		if(curPose < 0){
			curPose = 3;
		}
		drawPiece();
		fxRotate.play();
	} else if( !floorKicked && testRotateCounterClockWise(curX, curY - 1)){
		clearPiece();
		curPose--;
		curY --;
		if(curPose < 0){
			curPose = 3;
		}
		drawPiece();
		fxRotate.play();
	} else if( !floorKicked && testRotateCounterClockWise(curX, curY - 2)){
		clearPiece();
		curPose--;
		curY --;
		if(curPose < 0){
			curPose = 3;
		}
		drawPiece();
		fxRotate.play();
	} else if(!testWallKicks(false)){
		if(curY +1 <= MAX_INDEX_VERTICAL){
			if(testRotateCounterClockWise(curX, curY + 1)){ //test down kick
				clearPiece();
				curY++;
				curPose++;
				if(curPose > 3){
					curPose = 0;
				}
				drawPiece();
				fxRotate.play();
			} else {
				testWallKicksDownKicked(false);
			}
		}
	}
}

function rotateCounterClockWise2(){
	if(testRotateCounterClockWise2(curX2, curY2)){
		clearPiece2();
		curPose2--;
		if(curPose2 < 0){
			curPose = 3;
		}
		drawPiece2();
		fxRotate.play();
	} else if( !floorKicked2 && testRotateCounterClockWise2(curX2, curY2 - 1)){
		clearPiece2();
		curPose2--;
		curY2 --;
		if(curPose2 < 0){
			curPose2 = 3;
		}
		drawPiece2();
		fxRotate.play();
	} else if( !floorKicked2 && testRotateCounterClockWise2(curX2, curY2 - 2)){
		clearPiece2();
		curPose2--;
		curY2 --;
		if(curPose2 < 0){
			curPose2 = 3;
		}
		drawPiece2();
		fxRotate.play();
	} else if(!testWallKicks2(false)){
		if(curY2 +1 <= MAX_INDEX_VERTICAL){
			if(testRotateCounterClockWise2(curX2, curY2 + 1)){ //test down kick
				clearPiece2();
				curY2++;
				curPose2++;
				if(curPose2 > 3){
					curPose2 = 0;
				}
				drawPiece2();
				fxRotate.play();
			} else {
				testWallKicksDownKicked2(false);
			}
		}
	}
}

function score(pts){
	curScore += pts;
	updateLabelScore();
}

function score2(pts){
	curScore2 += pts;
	updateLabelScore2();
}

function testDrop(){
	var tmpX;
	var tmpY;
	if(curY < MAX_INDEX_VERTICAL){
		for(var i = 0; i < 4; i++){
			tmpX = piece.poses[curPose][i][0] + curX;
			tmpY = piece.poses[curPose][i][1] + curY + 1;

			if(tmpX < 0 ||  tmpY< 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			return false;
		} else if(board[tmpY][tmpX] >= 10){
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}

function testDrop2(){
	var tmpX;
	var tmpY;
	if(curY < MAX_INDEX_VERTICAL){
		for(var i = 0; i < 4; i++){
			tmpX = piece2.poses[curPose2][i][0] + curX2;
			tmpY = piece2.poses[curPose2][i][1] + curY2 + 1;

			if(tmpX < 0 ||  tmpY< 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			return false;
		} else if(board2[tmpY][tmpX] >= 10){
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}

function testGameOver(){
	if(curY == -1){
		gameover = true;
		return true;
	}
	
	return false;
}

function testGameOver2(){
	if(curY2 == -1){
		gameover2 = true;
		return true;
	}
	
	return false;
}

function isGameOver(){
	return gameover && gameover2;
}

function testGhostDrop(){
	var tmpX;
	var tmpY;
	if(curY < MAX_INDEX_VERTICAL){
		for(var i = 0; i < 4; i++){
			tmpX = piece.poses[curPose][i][0] + curX;
			tmpY = piece.poses[curPose][i][1] + ghostY + 1;

			if(tmpX < 0 ||  tmpY< 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			return false;
		} else if(board[tmpY][tmpX] >= 10){
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}

function testGhostDrop2(){
	var tmpX;
	var tmpY;
	if(curY2 < MAX_INDEX_VERTICAL){
		for(var i = 0; i < 4; i++){
			tmpX = piece2.poses[curPose2][i][0] + curX2;
			tmpY = piece2.poses[curPose2][i][1] + ghostY2 + 1;

			if(tmpX < 0 ||  tmpY< 0){
			// do nothing
		} else if(tmpX > MAX_INDEX_HORIZONTAL || tmpY > MAX_INDEX_VERTICAL){
			return false;
		} else if(board2[tmpY][tmpX] >= 10){
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}

function testLineClear(){
	for(var i=0; i < MAX_BLOCK_COUNT_VERTICAL; i++){
		for(var j=0; j < MAX_BLOCK_COUNT_HORIZONTAL; j++){
			lineCleared = true;
			if(board[i][j] <= -1){
				lineCleared = false;
				break;
			}
		}
		if(lineCleared){
			linesToClear.push(i);
		}
	}
	if(linesToClear.length > 0){
		cleaningLines = true;
		lineClearX = 0
		return true;
	}
	curCombo = 0;
	return false;
}

function testLineClear2(){
	for(var i=0; i < MAX_BLOCK_COUNT_VERTICAL; i++){
		for(var j=0; j < MAX_BLOCK_COUNT_HORIZONTAL; j++){
			lineCleared2 = true;
			if(board2[i][j] <= -1){
				lineCleared2 = false;
				break;
			}
		}
		if(lineCleared2){
			linesToClear2.push(i);
		}
	}
	if(linesToClear2.length > 0){
		cleaningLines2 = true;
		lineClearX2 = 0
		return true;
	}
	curCombo2 = 0;
	return false;
}

function testMoveLeft(){
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
			tmpX = piece.poses[curPose][i][0] + curX - 1;
			tmpY = piece.poses[curPose][i][1] + curY;
		if(tmpX >= 0){ // test if there is room to go left
			if(tmpY < 0){ //if offscreen
				//do nothing
			} else if(board[tmpY][tmpX] >= 10){
				return false;
			}
		} else {
			return false;
		}
	}
	lastValidMoveWasASpin = false;
	return true;
}

function testMoveLeft2(){
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
			tmpX = piece2.poses[curPose2][i][0] + curX2 - 1;
			tmpY = piece2.poses[curPose2][i][1] + curY2;
		if(tmpX >= 0){ // test if there is room to go left
			if(tmpY < 0){ //if offscreen
				//do nothing
			} else if(board2[tmpY][tmpX] >= 10){
				return false;
			}
		} else {
			return false;
		}
	}
	lastValidMoveWasASpin2 = false;
	return true;
}

function testMoveRight(){
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
			tmpX = piece.poses[curPose][i][0] + curX + 1;
			tmpY = piece.poses[curPose][i][1] + curY;
		if(tmpX <= MAX_INDEX_HORIZONTAL){ // test if there is room to go right
			if(tmpY < 0){ //if offscreen
				//do nothing
			} else if(board[tmpY][tmpX] >= 10){
				return false;
			}
		} else {
			return false;
		}
	}
	lastValidMoveWasASpin = false;
	return true;
}

function testMoveRight2(){
	var tmpX;
	var tmpY;
	for(var i = 0; i < 4; i++){
			tmpX = piece2.poses[curPose2][i][0] + curX2 + 1;
			tmpY = piece2.poses[curPose2][i][1] + curY2;
		if(tmpX <= MAX_INDEX_HORIZONTAL){ // test if there is room to go right
			if(tmpY < 0){ //if offscreen
				//do nothing
			} else if(board2[tmpY][tmpX] >= 10){
				return false;
			}
		} else {
			return false;
		}
	}
	lastValidMoveWasASpin2 = false;
	return true;
}

function testRotateClockWise(x, y){
	var tmpX;
	var tmpY;
	var testPose = curPose +1;
	if(testPose > 3){
		testPose = 0;
	}
	for(var i = 0; i < 4; i++){
		tmpX = piece.poses[testPose][i][0] + x;
		tmpY = piece.poses[testPose][i][1] + y;
		if(tmpY < 0){
			//do nothing
			if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
				return false;
			}
		} else if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
			return false;
		} else {
			if(tmpX > -1 && tmpX < MAX_BLOCK_COUNT_HORIZONTAL){
				if(board[tmpY][tmpX] >= 10){
					return false;
				}
			} else {
				return false;
			}
		}
	}
	lastValidMoveWasASpin = true;
	return true;
}

function testRotateClockWise2(x, y){
	var tmpX;
	var tmpY;
	var testPose = curPose2 +1;
	if(testPose > 3){
		testPose = 0;
	}
	for(var i = 0; i < 4; i++){
		tmpX = piece2.poses[testPose][i][0] + x;
		tmpY = piece2.poses[testPose][i][1] + y;
		if(tmpY < 0){
			//do nothing
			if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
				return false;
			}
		} else if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
			return false;
		} else {
			if(tmpX > -1 && tmpX < MAX_BLOCK_COUNT_HORIZONTAL){
				if(board2[tmpY][tmpX] >= 10){
					return false;
				}
			} else {
				return false;
			}
		}
	}
	lastValidMoveWasASpin2 = true;
	return true;
}

function testRotateCounterClockWise(x, y){
	var tmpX;
	var tmpY;
	var testPose = curPose -1;
	if(testPose < 0){
		testPose = 3;
	}
	for(var i = 0; i < 4; i++){
		tmpX = piece.poses[testPose][i][0] + x;
		tmpY = piece.poses[testPose][i][1] + y;
		if(tmpY < 0){
			//do nothing
			if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
				return false;
			}
		} else if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
			return false;
		} else if(tmpX > -1 && tmpX < MAX_BLOCK_COUNT_HORIZONTAL && tmpY < MAX_BLOCK_COUNT_VERTICAL){
			if(board[tmpY][tmpX] >= 10){
				return false;
			}
		} else {
			return false;
		}
	}
	lastValidMoveWasASpin = true;
	return true;
}

function testRotateCounterClockWise2(x, y){
	var tmpX;
	var tmpY;
	var testPose = curPose2 -1;
	if(testPose < 0){
		testPose = 3;
	}
	for(var i = 0; i < 4; i++){
		tmpX = piece2.poses[testPose][i][0] + x;
		tmpY = piece2.poses[testPose][i][1] + y;
		if(tmpY < 0){
			//do nothing
			if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
				return false;
			}
		} else if((tmpX > MAX_INDEX_HORIZONTAL || tmpX < 0) || (tmpY > MAX_INDEX_VERTICAL)){
			return false;
		} else if(tmpX > -1 && tmpX < MAX_BLOCK_COUNT_HORIZONTAL && tmpY < MAX_BLOCK_COUNT_VERTICAL){
			if(board2[tmpY][tmpX] >= 10){
				return false;
			}
		} else {
			return false;
		}
	}
	lastValidMoveWasASpin2 = true;
	return true;
}

function testTick(){
	if(testDrop()){
		lastValidMoveWasASpin = false;
		tick();
	} else {
		if(!testGameOver()){
			if(!lastSecondActive && !hardDropped){
				activateLastSecondAdjustments();
			}
			if(lastSecondAdjustmentsActive){
				//testTick();
				if(hardDrop){
					lastSecondAdjustmentsCancel();
				}
			} else {
				if(!waitingLineClear){
					placeOnBoard();
					newPiece();
					drawPiece();
					hardDropped = false;
				}
				testLineClear();
			}
		}
	}
	/*if(softDrop && !lastSecondActive){
		score(softDropPts);
	}*/

	killSoftDropTimer();
	if(!waitingLineClear){
		var ticktime;
		// if(softDrop){
		// 	ticktime = Phaser.Timer.SECOND * tickIntervalsoftDrop / 1000;
		// } else {
		// 	ticktime = Phaser.Timer.SECOND * tickInterval / 1000;
		// }
		ticktime = Phaser.Timer.SECOND * tickInterval / 1000;
		ticktimer = game.time.events.loop(ticktime , testTick, this);
	}
}

function testTick2(){
	if(testDrop2()){
		lastValidMoveWasASpin2 = false;
		tick2();
	} else {
		if(!testGameOver2()){
			if(!lastSecondActive2 && !hardDropped2){
				activateLastSecondAdjustments2();
			}
			if(lastSecondAdjustmentsActive2){
				//testTick();
				if(hardDrop2){
					lastSecondAdjustmentsCancel2();
				}
			} else {
				if(!waitingLineClear2){
					placeOnBoard2();
					newPiece2();
					drawPiece2();
					hardDropped2 = false;
				}
				testLineClear2();
			}
		}
	}
	// if(softDrop2 && !lastSecondActive2){
	// 	score2(softDropPts);
	// }

	killSoftDropTimer2();
	if(!waitingLineClear2){
		var ticktime;
		// if(softDrop){
		// 	ticktime = Phaser.Timer.SECOND * tickIntervalsoftDrop / 1000;
		// } else {
		// 	ticktime = Phaser.Timer.SECOND * tickInterval / 1000;
		// }
		ticktime = Phaser.Timer.SECOND * tickInterval / 1000;
		ticktimer2 = game.time.events.loop(ticktime , testTick2, this);
	}
}

function lastSecondAdjustmentsCancel(){
	lastSecondAdjustmentsActive = false;
	game.time.events.remove(lastSecondTimer);
}

function lastSecondAdjustmentsCancel2(){
	lastSecondAdjustmentsActive2 = false;
	game.time.events.remove(lastSecondTimer2);

}

function activateLastSecondAdjustments(){
	if(!lastSecondActive){
		lastSecondActive = true;
		lastSecondAdjustmentsActive = true;
		lastSecondTimer = game.time.events.loop(Phaser.Timer.SECOND / 2, lastSecondAdjustmentsCancel, this);
	}
}

function activateLastSecondAdjustments2(){
	if(!lastSecondActive2){
		lastSecondActive2 = true;
		lastSecondAdjustmentsActive2 = true;
		lastSecondTimer2 = game.time.events.loop(Phaser.Timer.SECOND / 2, lastSecondAdjustmentsCancel2, this);
	}
}

function showMultiplier(x, y){
	multiplierFeedbackText.x = DISPLAY_OFFSET_HORIZONTAL+ x * BLOCK_SIDE;
	multiplierFeedbackText.y = DISPLAY_OFFSET_VERTICAL + y * BLOCK_SIDE;
	multiplierFeedbackText.rotation = (Math.random()* 0.5) + (-0.5);
	multiplierFeedbackText.alpha = 1;
	multiplierFeedbackText.text = "x" + curCombo.toString();
	multiplierFeedbackText.scale.x = 1 + (curCombo / 10);
	multiplierFeedbackText.scale.y = 1 + (curCombo / 10);
	game.add.tween(multiplierFeedbackText).to({alpha: 0}, 800, "Linear", true);
	game.add.tween(multiplierFeedbackText.scale).to({x: 0.5, y:0.5}, 800, "Linear", true);
}

function showTspinAnimation(x, y){
	tSpinText.x = DISPLAY_OFFSET_HORIZONTAL+ x * BLOCK_SIDE;
	tSpinText.y = DISPLAY_OFFSET_VERTICAL + y * BLOCK_SIDE;
	tSpinText.alpha = 1;
	game.add.tween(tSpinText).to({alpha: 0}, 800, "Linear", true);
	game.add.tween(tSpinText.scale).to({x: 0.5, y:0.5}, 800, "Linear", true);
	console.log("T-SPIN!");
}

function showLevelUpAnimation(){
	levelUpEmitter.start(false, 300, 50);
	game.time.events.add(Phaser.Timer.SECOND, stopLevelUpAnimation, this);
}

function stopLevelUpAnimation(){
	levelUpEmitter.on = false;
}

function testTSpin(){
	occupied = 0;
	tmpX = lastX -1;
	tmpY = lastY -1;
	if(board[tmpY][tmpX] >= 10){
		occupied++;
	}

	tmpX = lastX -1;
	tmpY = lastY +1;
	if(tmpY > MAX_INDEX_VERTICAL){
		occupied++;
	} else 	if(board[tmpY][tmpX] >= 10){
		occupied++;
	}

	tmpX = lastX +1;
	tmpY = lastY -1;
	if(board[tmpY][tmpX] >= 10){
		occupied++;
	}

	tmpX = lastX +1;
	tmpY = lastY +1;
	if(tmpY > MAX_INDEX_VERTICAL){
		occupied++;
	} else if(board[tmpY][tmpX] >= 10){
		occupied++;
	}

	if(occupied >=3){
		return true;
	}
	return false;
}

function testTSpin2(){
	occupied = 0;
	tmpX = lastX2 -1;
	tmpY = lastY2 -1;
	if(board2[tmpY][tmpX] >= 10){
		occupied++;
	}

	tmpX = lastX2 -1;
	tmpY = lastY2 +1;
	if(tmpY > MAX_INDEX_VERTICAL){
		occupied++;
	} else 	if(board2[tmpY][tmpX] >= 10){
		occupied++;
	}

	tmpX = lastX2 +1;
	tmpY = lastY2 -1;
	if(board2[tmpY][tmpX] >= 10){
		occupied++;
	}

	tmpX = lastX2 +1;
	tmpY = lastY2 +1;
	if(tmpY > MAX_INDEX_VERTICAL){
		occupied++;
	} else if(board2[tmpY][tmpX] >= 10){
		occupied++;
	}

	if(occupied >=3){
		return true;
	}
	return false;
}

function testWallKicks(clockWise){
	var poseIncrement = 0;
	var kicked = false;
	if(clockWise){
		poseIncrement = 1;
		for(var i = 1; i<= 2; i++){ //left wall kick
			if(testRotateClockWise(curX + i, curY)){ 
				clearPiece();
				curX += i;
				curPose += poseIncrement;
				kicked = true;
				break;
			}
		}
		if(!kicked){
			for(var i = -1; i>= -2; i--){ //right wall kick
				if(testRotateClockWise(curX + i, curY)){ 
					clearPiece();
					curX += i;
					curPose += poseIncrement;
					kicked = true;
					break;
				}
			}
		}
	} else {
		poseIncrement = -1;
		for(var i = 1; i<= 2; i++){ //left wall kick
			if(testRotateCounterClockWise(curX + i, curY)){ 
				clearPiece();
				curX += i;
				curPose += poseIncrement;
				kicked = true;
				break;
			}
		}
		if(!kicked){
			for(var i = -1; i>= -2; i--){ //right wall kick
				if(testRotateCounterClockWise(curX + i, curY)){ 
					clearPiece();
					curX += i;
					curPose += poseIncrement;
					kicked = true;
					break;
				}
			}
		}
	}

	
	if(curPose > 3){
		curPose = 0;
	}
	if(curPose < 0){
		curPose = 3;
	}
	drawPiece();
	if(kicked){
		fxRotate.play();
		return true;
	}
	return false;
}

function testWallKicks2(clockWise){
	var poseIncrement = 0;
	var kicked = false;
	if(clockWise){
		poseIncrement = 1;
		for(var i = 1; i<= 2; i++){ //left wall kick
			if(testRotateClockWise2(curX2 + i, curY2)){ 
				clearPiece2();
				curX2 += i;
				curPose2 += poseIncrement;
				kicked = true;
				break;
			}
		}
		if(!kicked){
			for(var i = -1; i>= -2; i--){ //right wall kick
				if(testRotateClockWise2(curX2 + i, curY2)){ 
					clearPiece2();
					curX2 += i;
					curPose2 += poseIncrement;
					kicked = true;
					break;
				}
			}
		}
	} else {
		poseIncrement = -1;
		for(var i = 1; i<= 2; i++){ //left wall kick
			if(testRotateCounterClockWise2(curX2 + i, curY2)){ 
				clearPiece2();
				curX2 += i;
				curPose2 += poseIncrement;
				kicked = true;
				break;
			}
		}
		if(!kicked){
			for(var i = -1; i>= -2; i--){ //right wall kick
				if(testRotateCounterClockWise2(curX2 + i, curY2)){ 
					clearPiece2();
					curX2 += i;
					curPose2 += poseIncrement;
					kicked = true;
					break;
				}
			}
		}
	}

	
	if(curPose2 > 3){
		curPose2 = 0;
	}
	if(curPose2 < 0){
		curPose2 = 3;
	}
	drawPiece2();
	if(kicked){
		fxRotate.play();
		return true;
	}
	return false;
}

function testWallKicksDownKicked(clockWise){
	var poseIncrement = 0;
	var kicked = false;
	tmpY = curY +1;
	if(clockWise){
		poseIncrement = 1;
		for(var i = 1; i<= 2; i++){ //left wall kick
			if(testRotateClockWise(curX + i, tmpY)){ 
				clearPiece();
				curX += i;
				curY += 1;
				curPose += poseIncrement;
				kicked = true;
				break;
			}
		}
		if(!kicked){
			for(var i = -1; i>= -2; i--){ //right wall kick
				if(testRotateClockWise(curX + i, tmpY)){ 
					clearPiece();
					curX += i;
					curY += 1;
					curPose += poseIncrement;
					kicked = true;
					break;
				}
			}
		}
	} else {
		poseIncrement = -1;
		for(var i = 1; i<= 2; i++){ //left wall kick
			if(testRotateCounterClockWise(curX + i, tmpY)){ 
				clearPiece();
				curX += i;
				curY += 1;
				curPose += poseIncrement;
				kicked = true;
				break;
			}
		}
		if(!kicked){
			for(var i = -1; i>= -2; i--){ //right wall kick
				if(testRotateCounterClockWise(curX + i, tmpY)){ 
					clearPiece();
					curX += i;
					curY += 1;
					curPose += poseIncrement;
					kicked = true;
					break;
				}
			}
		}
	}

	
	if(curPose > 3){
		curPose = 0;
	}
	if(curPose < 0){
		curPose = 3;
	}
	drawPiece();
	if(kicked){
		fxRotate.play();
		return true;
	}
	return false;
}

function tick(){ //move piece a line down
	clearPiece();
	curY++;
	drawPiece();

}

function tick2(){ //move piece a line down
	clearPiece2();
	curY2++;
	drawPiece2();

}

function unlockMovement(){
	movementLock = false;
	if(timer != null){
		game.time.events.remove(timer);
	}
}

function unlockMovement2(){
	movementLock2 = false;
	if(timer2 != null){
		game.time.events.remove(timer2);
	}
}

function updateBg(newBg){
	curBg = newBg;
	bg.loadTexture('bg'+curBg);
	updateLabelArt();
}

function updateBoardDisplayed(){
	for(var i = 0; i < MAX_BLOCK_COUNT_HORIZONTAL; i++){
		for(var j = 0; j < MAX_BLOCK_COUNT_VERTICAL; j++){
			if(board[j][i] == -1){
				blocoOff(i, j);
			} else {
				blocoOn(i, j);
			}
		}
	}
}

function updateBoardDisplayed2(){
	for(var i = 0; i < MAX_BLOCK_COUNT_HORIZONTAL; i++){
		for(var j = 0; j < MAX_BLOCK_COUNT_VERTICAL; j++){
			if(board2[j][i] == -1){
				blocoOff2(i, j);
			} else {
				blocoOn2(i, j);
			}
		}
	}
}

function updateHoldWindow(){
	var offsetX = 1;
	var offsetY = 2;
	clearHoldWindow();
	for(var i = 0; i < 4; i++){
		var blocoX = (holdPiece.poses[0][i][0]) + offsetX;
		var blocoY = (holdPiece.poses[0][i][1]) + offsetY;
		holdWindow[blocoY][blocoX].frameName = blocosColors[holdPieceIndex];
	}
}

function updateHoldWindow2(){
	var offsetX = 1;
	var offsetY = 2;
	clearHoldWindow2();
	for(var i = 0; i < 4; i++){
		var blocoX = (holdPiece2.poses[0][i][0]) + offsetX;
		var blocoY = (holdPiece2.poses[0][i][1]) + offsetY;
		holdWindow2[blocoY][blocoX].frameName = blocosColors[holdPieceIndex2];
	}
}

function updateLabelArt(){
	labelArt.text = bgsTexts[curBg];
}

function updateLabelLevel(){
	labelLevel.text = level;
}

function updateLabelLines(){
	labelLines.text = lineCount;
}

function updateLabelLines2(){
	labelLines2.text = lineCount2;
}

function updateLabelScore(){
	labelScore.text = curScore;
}

function updateLabelScore2(){
	labelScore2.text = curScore2;
}

function updateNextWindow(){
	var offsetX = 1;
	var offsetY = 2;
	clearNextWindow();
	for(var j = 0; j < 3; j++ ){ //next piece index
		for(var i = 0; i < 4; i++){ //piece blocks
			var blocoX = (nextPiece[j].poses[0][i][0]) + offsetX;
			var blocoY = (nextPiece[j].poses[0][i][1]) + (offsetY + (j*4));
			nextWindow[blocoY][blocoX].frameName = blocosColors[nextPieceIndex[j]];
		}
	}
}

function updateNextWindow2(){
	var offsetX = 1;
	var offsetY = 2;
	clearNextWindow2();
	for(var j = 0; j < 3; j++ ){ //next piece index
		for(var i = 0; i < 4; i++){ //piece blocks
			var blocoX = (nextPiece2[j].poses[0][i][0]) + offsetX;
			var blocoY = (nextPiece2[j].poses[0][i][1]) + (offsetY + (j*4));
			nextWindow2[blocoY][blocoX].frameName = blocosColors[nextPieceIndex2[j]];
		}
	}
}

function updateTickSpeed(){
	if(lineCount  >= speedUpGoal){
		tickInterval *= 0.75;
		speedUpGoal += 10;
		level++;
		// showLevelUpAnimation();
		// updateLabelLevel();
	}
}

function updateTickSpeed2(){
	if(lineCount2  >= speedUpGoal2){
		tickInterval2 *= 0.75;
		speedUpGoal2 += 10;
		level2++;
		// showLevelUpAnimation();
		// updateLabelLevel();
	}
}

function initKeys(){
	curY = 0;
	curY2 = 0;
}
