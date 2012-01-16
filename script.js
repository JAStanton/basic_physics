/* Author: Jonathan Stanton

*/

var Circle = function(){
	return {
		r : 10,
		width : 20,
		height : 20,
		x: 0,
		y: 0,
		dx : 2,
		dy : 4,
		color : "rgb(0,0,0)"
	}
}

var Paddle = function(){
	return {
		direction: "",
		width: 100,
		height: 10,
		x: 0,
		y: 0
	}
}

var jas = function() {
	
	//private functions
	function randomFromTo(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
    }

	function random_color(){
		var rint = Math.round(0xffffff * Math.random());
		return 'rgba(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ',.4)';	  
	}

	function roundNumber(num, dec) {
		var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		return result;
	}

	return {
		init : function() {
			this.status = "paused";
			this.lastCalledTime = new Date().getTime();
			var canvas = document.getElementById('board');  
			this.width = canvas.getAttribute("width");
			this.height = canvas.getAttribute("height");
			this.ctx = canvas.getContext('2d');
			
			this.circles = {};
			this.paddles = {};

			this.border = 5;
			this.draw_board();
			this.create_objects(25);
			this.create_paddles(1);
			this.draw_objects();
			this.draw_paddles();
			document.onkeydown = this.KeyCheckDown;
			document.onkeyup = this.KeyCheckUp;
		},
		create_paddles : function(num){
			for (var i = num - 1; i >= 0; i--) {
				this.paddles[i] = new Paddle();
				this.paddles[i].x = (this.border * 2);
				this.paddles[i].y = this.height - (this.border * 2) - this.paddles[i].height;
			}
		},
		draw_paddles : function(){
			for (var i = Object.keys(this.paddles).length - 1; i >= 0; i--) {
				this.ctx.fillRect(this.paddles[i].x,this.paddles[i].y,this.paddles[i].width,this.paddles[i].height);
				this.ctx.strokeRect(this.paddles[i].x,this.paddles[i].y,this.paddles[i].width,this.paddles[i].height); 
				this.ctx.clearRect(this.paddles[i].x,this.paddles[i].y,this.paddles[i].width,this.paddles[i].height);
			}
		},
		draw_fps : function(fps){
			fps = roundNumber(fps,2);
			var x = (this.border * 2);
		    var y = (this.border * 4);
		 
		    this.ctx.font = "13pt Calibri";
		    this.ctx.textAlign = "left";
		    this.ctx.fillStyle = "blue";
		    this.ctx.fillText("FPS: " + fps, x, y);

		},
		create_objects : function(num){
			for (var i = num - 1; i >= 0; i--) {
				this.circles[i] = new Circle();
				this.circles[i].x = randomFromTo(this.circles[i].width + this.border, this.width - this.circles[i].width - this.border );
				this.circles[i].y = randomFromTo(this.circles[i].height + this.border, this.height - this.circles[i].height - this.border);
				this.circles[i].dx = randomFromTo(1,5);
				this.circles[i].dy = randomFromTo(1,5);
				this.circles[i].color = random_color();
			};	
		},
		draw_objects : function(){
			for (var i = Object.keys(this.circles).length - 1; i >= 0; i--) {
				this.ctx.beginPath();
				this.ctx.fillStyle = this.circles[i].color;
				this.ctx.arc(this.circles[i].x, this.circles[i].y, this.circles[i].r, 0, Math.PI*2, true); 
				this.ctx.closePath();
				this.ctx.fill();	
			};
		},
		draw_board : function(){

			this.ctx.fillStyle = "rgb(0,0,0)";
			this.ctx.fillRect (0, 0, this.width,this.height);

			this.ctx.fillStyle = "rgb(200,200,200)";
			this.ctx.fillRect (this.border, this.border, this.width - (this.border * 2),this.height - (this.border * 2));

		},
		draw_pause : function(){
			var x = this.width / 2;
		    var y = this.height / 2;
		 
		    this.ctx.font = (30 * ((this.width  * 1) / 400)) + "pt Calibri";
		    this.ctx.textAlign = "center";
		    this.ctx.fillStyle = "blue";
		    this.ctx.fillText("Paused!", x, y);
	
		},
		move_objects : function(){
			for (var i = Object.keys(this.circles).length - 1; i >= 0; i--) {

				var x = this.circles[i].x
				, y = this.circles[i].y
				, dx = this.circles[i].dx
				, dy = this.circles[i].dy
				, width = this.width
				, height = this.height
				, paddleh = this.paddles[0].height
				, paddlex = this.paddles[0].x
				, paddley = this.paddles[0].y
				, paddlew = this.paddles[0].width
				, r = this.circles[i].r
				, paddler = - this.paddles[0].r;


				if (x + dx + r > width || x + dx - r < 0){
					this.circles[i].dx = -dx;
				}
				if (y + dy - r < 0){
					this.circles[i].dy = -dy;
				} else if (y + dy + r > height - paddleh - 8) {
					if (x + r > paddlex  && x + r < paddlex + paddlew){
						this.circles[i].dy = -dy;
					}else if(y + dy > height) {
						this.circles[i] = {};
					}
				}
				if(this.paddles[0].direction == "left" && paddlex > (this.border * 2)){
					this.paddles[0].x -= .5;
				}
				if(this.paddles[0].direction == "right" && paddlex + paddlew < width - (this.border * 2)){
					this.paddles[0].x += .5;
				}
				
				this.circles[i].x += this.circles[i].dx;
				this.circles[i].y += this.circles[i].dy;
			}
		},
		frame : function(){
			if(this.status == "playing"){
				this.draw_board();
				this.draw_objects();
				this.move_objects();
				this.draw_paddles();

 				var delta = (new Date().getTime() - this.lastCalledTime)/1000;
 				this.lastCalledTime = new Date().getTime();
				this.draw_fps(1/delta);

				this.t = setTimeout("jas.frame()",  (1000 / 60)); //next frame
			}
		},
		KeyCheckDown : function(){
		   var KeyID = event.keyCode;
		   switch(KeyID) {
			case 32:
				switch(jas.status){
					case "playing":
						jas.status = "paused";
						jas.draw_pause();
					break;
					case "paused":
						jas.status = "playing";
						jas.frame();
					break;
				};
			break;
			case 37: jas.paddles[0].direction = "left"; break;
			case 39: jas.paddles[0].direction = "right"; break;

		   }
		},
		KeyCheckUp : function(){
			jas.paddles[0].direction = "";
		}
	}
		
}();

jas.init();