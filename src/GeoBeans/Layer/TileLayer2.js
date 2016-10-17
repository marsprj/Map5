
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

	if(!isValid(this._source)){
		return;
	}

	var viewer = this.map.getViewer();

	var view_extent = viewer.getExtent();
	var view_resolution = viewer.getResolution();

	/*
	 * 根据当前地图的分辨率view_resolution，计算Tile上与当前分辨率最近接的zoom。
	 * Map5获取该zoom上的Tile。再根据当前的view_resolution和Tile的分辨率tile_resolution的分辨率，计算绘制时候的缩放比例。
	 */
	var tile_zoom, tile_resolution;
	tile_zoom  = viewer.getZoom();
	tile_zoom  = this._source.getFitZoom(view_resolution);
	if(!isValid(tile_zoom)){
		return;
	}
	tile_resolution  = this._source.getResolution(tile_zoom);

	var success = {		
		renderer: this.renderer,
		viewer : this.map.getViewer(),
		resolution : view_resolution, 
		execute : function(tile){
			var scale = 1;
			var that = this;
			tile.onComplete = function(){
				var image = tile.image;
				var x = tile.x;
				var y = tile.y;
				var tile_size = tile.size;

				var tile_scale = tile.resolution / that.resolution;
				var image_size = tile_size * tile_scale;
				var pt = that.viewer.toScreenPoint(x, y);


				that.renderer.clearRect(pt.x, pt.y, image_size, image_size);
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
	this._source.getTile(viewer.getZoom(), view_extent, success, failure);
};