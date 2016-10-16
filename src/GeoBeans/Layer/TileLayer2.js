
/**
 * @classdesc
 * 瓦片图层
 * @class
 * @extends {GeoBeans.Layer}
 */
GeoBeans.Layer.TileLayer2 = GeoBeans.Class(GeoBeans.Layer,{
	
	/**
	 * new GeoBeans.Layer.TileLayer2({
	 * 	"name" : "layername",
	 *  "source" : new GeoBeans.Source.Tile.QuadServer({
	 *  	"url" : "http://127.0.0.1/QuadServer/maprequest?services=world_image'
	 *    }),
	 *  "opacity" : 0.5
	 * });
	 */
	
	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.name = options.name;
		this._source = options.source;
		this.setOpacity(isValid(options.opacity) ? options.opacity : 1.0);
	},
});


/**
 * 刷新图层
 * @public
 * @override
 */
GeoBeans.Layer.TileLayer2.prototype.refresh = function() {
	if(this.visible){
		this.draw();
	}
	else{
		this.clear();
	}
	
};

/**
 * 重绘图层
 * @public
 * @override
 */
GeoBeans.Layer.TileLayer2.prototype.draw = function() {
	var success = {
		viewer : this.map.getViewer(),
		renderer: this.renderer,
		execute : function(tile){
			console.log("tile execute");

			var scale = 1;
			var that = this;
			tile.onComplete = function(){
				var image = tile.image;
				var x = tile.x;
				var y = tile.y;
				var tile_size = tile.size;
				var image_size = tile_size * scale;
				// this.renderer.clearRect(0,0,w,h);
				var pt = that.viewer.toScreenPoint(x, y);
				that.renderer.drawImage(image, pt.x, pt.y, image_size, image_size);
			}
			tile.load();			
		}
	}

	var failure = {
		execute : function(){
			console.log("failure");	
		}
	}

	this.renderer.setGlobalAlpha(this.opacity);
	
	if(isValid(this._source)){
		var viewer = this.map.getViewer();
		this._source.getTile(viewer.getZoom(), viewer.getExtent(), success, failure);
	}
};