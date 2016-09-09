GeoBeans.TileState = {
	LOADED : 1,
	LOADING : 2
};

GeoBeans.Tile = GeoBeans.Class({
	
	map : null,
	image : null,
	url : null,
	row : null,
	col : null,
	level : null,
	layer : null,

	state : null,
	
	initialize : function(map,url, layer, row, col, level){
		this.map = map;
		this.url = url;
		this.row = row;
		this.col = col;
		this.level = level;
		this.layer = layer;
	},

	loading : function(drawBaseLayerCallback,loadTileCallback,tiles,index){
		if(this.image==null){
			this.image = new Image();
			this.image.crossOrigin = "anonymous";
			this.image.src = this.url;
		}

		if(this.image.complete && this.image.height != 0 && this.width != 0 ){
			this.state = GeoBeans.TileState.LOADED;
			loadTileCallback(this,drawBaseLayerCallback,tiles,index);
			return;
		}
		var tile = this;
		this.image.onload = function(){
			if(tile.layer.flag !=  GeoBeans.Layer.Flag.LOADED){
				tile.state = GeoBeans.TileState.LOADED;
				loadTileCallback(tile,drawBaseLayerCallback,tiles,index);
			}
		}

		var that = this;
		this.image.onerror = function(e){
			console.log(e);
			that.layer.cache.removeTile(that);
		};

	},

	// draw : function(x, y, img_size, img_size){
	// 	var imageScale = this.layer.imageScale;

	// 	if(this.map.level == this.level){
	// 		this.layer.renderer.context.clearRect(x,y,img_size,img_size);
	// 		if(this.layer.visible){
	// 			this.layer.renderer.drawImage(this.image, x, y, img_size, img_size);
	// 			this.map._updateTile(this.layer,x,y,img_size,img_size);
	// 			// this.layer.renderer.drawImage(this.image, x, y, img_size*(1-imageScale),
	// 			 // img_size*(1-imageScale));	
	// 			// this.layer.renderer.drawImage(this.image, x, y, img_size*(imageScale),
	// 			 // img_size*(imageScale));	
	// 		}
	// 	}		
	// }

	// 加上旋转角度后
	draw : function(x, y, img_size, img_size){
		var imageScale = this.layer.imageScale;

		if(this.map.level == this.level){
			
			if(this.layer.visible){
				this.layer.renderer.save();
				if(this.map.rotateAngle != null){
					var width = this.map.width;
					var height = this.map.height;
					
					this.layer.renderer.context.translate(width/2,height/2);
					this.layer.renderer.context.rotate(this.map.rotateAngle* Math.PI/180);
					this.layer.renderer.context.translate(-width/2,-height/2);
				}

				// x = Math.floor(x+0.5);
				// y = Math.floor(y+0.5);
				this.layer.renderer.context.clearRect(x,y,img_size,img_size);
				this.layer.renderer.drawImage(this.image, x, y, img_size, img_size);
				this.layer.renderer.restore();
				if(this.map.rotateAngle != null){
					var rotateCanvas = this.layer.getRotateCanvas();
					if(rotateCanvas != null){
						var context = rotateCanvas.getContext("2d");
						context.clearRect(0,0,rotateCanvas.width,rotateCanvas.height);
						context.save();
						var width = rotateCanvas.width;
						var height = rotateCanvas.height;
						context.translate(width/2,height/2);
						context.rotate(-this.map.rotateAngle* Math.PI/180);
						context.translate(-width/2,-height/2);

						var x_2 = width/2 - this.layer.canvas.width/2;
						var y_2 = height/2 - this.layer.canvas.height/2;
						context.drawImage(this.layer.canvas,0,0,this.layer.canvas.width,this.layer.canvas.height,
							x_2,y_2,this.layer.canvas.width,this.layer.canvas.height);
						context.restore();
					}
				}

				this.map._updateTile(this.layer,x,y,img_size,img_size);
			}
		}		
	}


	// // 加上旋转角度后,放大一定的比例
	// draw : function(x, y, img_size, img_size){
	// 	var imageScale = this.layer.imageScale;

	// 	if(this.map.level == this.level){
			
	// 		if(this.layer.visible){
	// 			this.layer.renderer.save();
	// 			// if(this.map.rotateAngle != null){
	// 			// 	var width = this.map.width;
	// 			// 	var height = this.map.height;
	// 			// 	this.layer.renderer.context.translate(width/2,height/2);
	// 			// 	this.layer.renderer.context.rotate(this.map.rotateAngle* Math.PI/180);
	// 			// 	this.layer.renderer.context.translate(-width/2,-height/2);
	// 			// }


	// 			this.layer.renderer.context.clearRect(x,y,img_size,img_size);
	// 			var sx = x + this.layer.canvas.width - this.map.width;
	// 			var sy = y + this.layer.canvas.height - this.map.height;
	// 			this.layer.renderer.drawImage(this.image, sx, sy, img_size, img_size);
	// 			this.layer.renderer.restore();
	// 			// var rotateCanvas = this.layer.getRotateCanvas();
	// 			// if(rotateCanvas != null){
	// 			// 	var context = rotateCanvas.getContext("2d");
	// 			// 	context.clearRect(0,0,rotateCanvas.width,rotateCanvas.height);
	// 			// 	context.save();
	// 			// 	var width = rotateCanvas.width;
	// 			// 	var height = rotateCanvas.height;
	// 			// 	context.translate(width/2,height/2);
	// 			// 	context.rotate(-this.map.rotateAngle* Math.PI/180);
	// 			// 	context.translate(-width/2,-height/2);

	// 			// 	var x_2 = width/2 - this.layer.canvas.width/2;
	// 			// 	var y_2 = height/2 - this.layer.canvas.height/2;
	// 			// 	context.drawImage(this.layer.canvas,0,0,this.layer.canvas.width,this.layer.canvas.height,
	// 			// 		x_2,y_2,this.layer.canvas.width,this.layer.canvas.height);
	// 			// 	context.restore();
	// 			// }

	// 			this.map._updateTile(this.layer,x,y,img_size,img_size,sx,sy);
	// 		}
	// 	}		
	// }
});