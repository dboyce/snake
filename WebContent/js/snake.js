var Snake = function () {

	var canvas, 
	width = 400,
	height = 400,
	cellsX = 20,
	cellsY = 20,
	cellWidth = width / cellsX,
	cellHeight = height / cellsY,
	rate = 1000/8,
	matrix = {},
	dir = {up:'up',down:'down',left:'left',right:'right'},
	oppositeDirections = [['up','down'], ['left', 'right']],
	keys = {},
	snake = {x:10,y:10,dir:dir.down,newDir:null},	
	food = {},
	timeout,
	paused,
	died,
	score = 0,
	steps = 0,
	highscore = 0,        
	myLocalStorage = localStorage;


	var destroy = function() {

		if(timeout) {

			clearInterval(timeout);
		}
	};

	var init = function() {

		keys[37] = dir.left;
		keys[38] = dir.up;
		keys[39] = dir.right,
		keys[40] = dir.down;

		for(var i = 0; i < cellsX; i++) {

			matrix[i] = {};				    
		}

		snake.len = 0;
		matrix[10][10] = snake;
		placeFood();
		loop();		
		updateHighScore(getHighScore());             


		document.onkeydown = function(e) {

			var keycode,newDir;
			if (window.event) keycode = window.event.keyCode;
			else if (e) keycode = e.which;

			newDir = keys[keycode];
			if(newDir && (snake.len < 1 || validateDirection(snake.dir, newDir))) { 
				snake.newDir = newDir; 
			}
			else { 

				if(keycode === 80) { pause(); }	
			}

		};
	};

	var validateDirection = function(dir, newDir) {

		for(var i = 0; i < oppositeDirections.length; i++) {

			if(contains(oppositeDirections[i], newDir)) {

				return !contains(oppositeDirections[i], dir); 
			}
		}	

		return true;
	};

	var main = function() {

		var ctx = canvas.getContext('2d'), current;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var stopped = paused || died;

		for(var i = 0; i < cellsX; i++) {

			for(var j = 0; j < cellsY; j++) {

				current = matrix[i][j];

				if(current == null) {

					continue;
				}								
				else if(current == snake) {

					drawSnake(ctx,i,j);
				}
				else if(current == food) {

					drawFood(ctx,i,j);								
				}
				else if(current.body) {

					drawSnake(ctx,i,j);

					if(!stopped) { current.tick(); }
				}							
			}
		}

		if(!stopped) {

			moveSnake();
		}
		else {

			if(paused) {

				displayMessage(ctx, "PAUSED");				
			}
			else {

				displayMessage(ctx, 'YOU DIED');
			}
		}
	};

	var loop = function() {

		timeout = setInterval(main, rate);						
	};

	var drawSnake = function(ctx,x,y) {

		ctx.fillStyle = "rgba(50,50,50,200)";
		ctx.fillRect(x*cellWidth,y*cellHeight,cellWidth,cellHeight);										

	};

	var drawFood = function(ctx,x,y) {

		ctx.fillStyle = "rgba(150,150,150,200)";
		ctx.fillRect(x*cellWidth,y*cellHeight,cellWidth,cellHeight);
	};

	var displayMessage = function(ctx, message) {	

		ctx.font = "20pt Arial";
		ctx.fillText(message, width / 2 - 20 * message.length / 2, height / 2 - 10);
	};

	var placeFood = function() {

		var x,y,finished;

		while(!finished) {

			x = random(cellsX - 1), y = random(cellsY - 1);

			if(empty(matrix, x, y)) {

				finished = true;
				matrix[x][y] = food;
				//console.log('placed food at: ' + x + ' ' + y);
			}
		}					
	};

	var Body = function(x,y,len) {

		this.tick = function() {

			len--;
			if(len < 1) {

				matrix[x][y] = null;											
			}						
		};
		this.body = true;
	};

	var onEatFood = function(snake) {

		score += (50 - steps);
		document.getElementById('score').childNodes[0].data = score;
		steps = 0;
		updateHighScore(score);               
	};

	var updateHighScore = function(score) {

		if(score > highscore) {
			
			highscore = score;
			setHighScore(highscore);
			document.getElementById('highscore').childNodes[0].data = highscore;
		}
	}

	var moveSnake = function() {

		var cell,x = snake.x,y = snake.y;
		
		if(snake.newDir !== null) {
			snake.dir = snake.newDir;
			snake.newDir = null;
		}

		if(snake.dir == dir.right) {snake.x++}
		else if(snake.dir == dir.left) {snake.x--;}
		else if(snake.dir == dir.down) {snake.y++;}
		else {snake.y--;}

		snake.x %= cellsX;
		snake.y %= cellsY;

		if(snake.x < 0) { snake.x = cellsX - 1;}
		if(snake.y < 0) { snake.y = cellsY - 1;}

		cell = matrix[snake.x][snake.y];

		if(cell === food) {

			placeFood();
			onEatFood(snake);
			snake.len++;	
			cell = null;
		}

		if(cell) {

			died = true;
		}
		else {			

			matrix[snake.x][snake.y] = snake;

			if(snake.len > 0) { 

				matrix[x][y] = new Body(x,y,snake.len); 
			}	
			else {

				matrix[x][y] = null;
			}
			steps++;
		}

	};

	this.load = function() {

		canvas = document.getElementById('canvas');

		if(!canvas.getContext) {

			throw 'canvas not supported by your browser, sonny bono';
		}
		init();				
	};

	var random = function(max) { return Math.floor(Math.random()*max+1); };	
	var pause = function() { paused = !paused; };
	var empty = function(matrix,x,y) { return !(matrix[x][y]); };
	var contains = function(a, obj) {

		var i = a.length;
		while (i--) {

			if (a[i] === obj) {

				return true;
			}

		}

		return false;
	};
	var getHighScore = function() {return myLocalStorage.getItem('highscore') || 0;};
	var setHighScore = function(score){myLocalStorage.setItem('highscore', score + ''); };
};
