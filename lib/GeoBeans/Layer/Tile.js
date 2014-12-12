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
	
	// draw : function(x, y, w, h){
		
	// 	var renderer = this.layer.map.renderer;
	// 	if(this.image==null){
	// 		this.image = new Image();
	// 		this.image.src = this.url;
	// 	}
	// 	if(this.image.complete && this.image.height != 0 && this.width != 0){
	// 		if(this.map.level == this.level){
	// 			renderer.drawImage(this.image, x, y, w, h);	
	// 		}
	// 	}
	// 	else{
	// 		var tile = this;
	// 		this.image.onload = function(){
	// 			if(tile.map.level == tile.level){
	// 				renderer.drawImage(tile.image, x, y, w, h);
	// 			}
	// 		};
	// 	}
	// }

	loading : function(drawBaseLayerCallback,loadTileCallback,tiles,index){
		if(this.image==null){
			this.image = new Image();
			this.image.src = this.url;
		}

		if(this.image.complete && this.image.height != 0 && this.width != 0 ){
			this.state = GeoBeans.TileState.LOADED;
			loadTileCallback(this,drawBaseLayerCallback,tiles,index);
			return;
		}
		var tile = this;
		this.image.onload = function(){
			tile.state = GeoBeans.TileState.LOADED;
			loadTileCallback(tile,drawBaseLayerCallback,tiles,index);
		}

	},

	draw : function(x, y, img_size, img_size){
		var renderer = this.map.renderer; 
		if(this.map.level == this.level){
			renderer.drawImage(this.image, x, y, img_size, img_size);	
		}		
	}

});
