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

	},

	draw : function(x, y, img_size, img_size){
		var imageScale = this.layer.imageScale;

		if(this.map.level == this.level){
			this.layer.renderer.context.clearRect(x,y,img_size,img_size);
			if(this.layer.visible){
				this.layer.renderer.drawImage(this.image, x, y, img_size, img_size);
				this.map._updateTile(this.layer,x,y,img_size,img_size);
				// this.layer.renderer.drawImage(this.image, x, y, img_size*(1-imageScale),
				 // img_size*(1-imageScale));	
				// this.layer.renderer.drawImage(this.image, x, y, img_size*(imageScale),
				 // img_size*(imageScale));	
			}
		}		
	}

});
