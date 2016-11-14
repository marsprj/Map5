GeoBeans.TileState = {
	LOADED : 1,
	LOADING : 2
};

GeoBeans.Tile = GeoBeans.Class({
	
	map : null,		//@deprecated
	layer : null,	//@deprecated

	x : 0,
	y : 0,
	size : 256,
	width : 256,
	height : 256,
	url : null,
	row : null,
	col : null,
	zoom : null,
	image : null,
	resolution : 1.0,
	
	state : null,

	onComplete : null,
	
	initialize : function(map,url, layer, row, col, zoom, x, y, width, height, resolution){
		this.url = url;
		this.row = row;
		this.col = col;
		this.zoom = zoom;
		this.x = x,
		this.y = y,
		this.size = width,
		this.width  = width;
		this.height = height;
		this.resolution = resolution;
		
		//
		this.map = map;		//@deprecated
		this.layer = layer;	//@deprecated
	},

	//@deprecated
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

	//@deprecated
	draw : function(x, y, img_width, img_height){
		var viewer = this.map.getViewer();
		var rotation = viewer.getRotation();
		var zoom = viewer.getZoom();
		if(zoom == this.zoom){
			if(this.layer.visible){
				this.layer.renderer.save();
				if(rotation != 0){
					var width = this.map.getWidth();
					var height = this.map.getHeight();
					
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


GeoBeans.Tile.prototype.load = function(){

	if(!isValid(this.image)){
		this.image = new Image();
		this.image.crossOrigin = "Anonymous";
		
	}

	var that = this;
	this.image.onload = function(){
		if(isValid(that.onComplete)){
			that.onComplete(that);
		}
	}

	this.image.onerror = function(){
		//that.onError(that);
	}

	this.image.src = this.url;
	if(this.image.complete){
		if(isValid(this.onComplete)){
			this.onComplete(this);
		}
	}
}