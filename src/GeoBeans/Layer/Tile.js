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
	zoom : null,
	layer : null,

	state : null,
	
	initialize : function(map,url, layer, row, col, zoom){
		this.map = map;
		this.url = url;
		this.row = row;
		this.col = col;
		this.zoom = zoom;
		this.layer = layer;
	},

	loading : function(loadTileCallback,tiles,index){
		if(this.image==null){
			this.image = new Image();
			this.image.crossOrigin = "anonymous";
			this.image.src = this.url;
		}

		if(this.image.complete && this.image.height != 0 && this.width != 0 ){
			this.state = GeoBeans.TileState.LOADED;
			loadTileCallback(this,tiles,index);
			return;
		}
		var tile = this;
		this.image.onload = function(){
			if(tile.layer.flag !=  GeoBeans.Layer.Flag.LOADED){
				tile.state = GeoBeans.TileState.LOADED;
				loadTileCallback(tile,tiles,index);
			}
		}

		var that = this;
		this.image.onerror = function(e){
			console.log(e);
			that.layer.cache.removeTile(that);
		};

	},

	draw : function(x, y, img_width, img_height){
		var viewer = this.map.getViewer();
		var rotation = viewer.getRotation();
		var zoom = viewer.getZoom();
		if(zoom == this.zoom){
			if(this.layer.visible){
				this.layer.renderer.save();
				if(rotation != 0){
					var width = this.map.width;
					var height = this.map.height;
					
					this.layer.renderer.translate(width/2,height/2);
					this.layer.renderer.rotate(rotation* Math.PI/180);
					this.layer.renderer.translate(-width/2,-height/2);
				}

				this.layer.renderer.clearRect(x,y,img_width,img_height);
				this.layer.renderer.drawImage(this.image, x, y, img_width, img_height);
				this.layer.renderer.restore();
			}
		}		
	},
});
