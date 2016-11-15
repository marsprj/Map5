/**
 * @classdesc
 * 瓦片图层
 * 
 *	var layer = new GeoBeans.Layer.TileLayer({
 *		name : "world",
 *		source : new GeoBeans.Source.Tile.QuadServer({
 *	 		url : "http://127.0.0.1/QuadServer/maprequest",
 *	 		imageSet : "world_image"
 *	 	}),
 *	 	opacity : 0.5,
 *	 	visible : true
 *	});
 *		
 * @class
 * @extends {GeoBeans.Layer}
 * @param 	{object} options options
 * @api stable
 */
GeoBeans.Layer.TileLayer = GeoBeans.Class(GeoBeans.Layer,{
		
	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.name = options.name;
		this._source = options.source;
		this.setOpacity(isValid(options.opacity) ? options.opacity : 1.0);
	},
});



/**
 * 重绘图层
 * @public
 * @override
 */
GeoBeans.Layer.TileLayer.prototype.draw = function() {
	if(!this.isVisible()){
		this.clear();
		return;
	}

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
				var image_size = Math.round((tile_size * tile_scale)+0.5);
				
				// var pt = that.viewer.toScreenPoint(x, y);
				var viewer = that.viewer;
				if(tile.zoom!=viewer.getZoom()){
					return;
				}

				var rotation = viewer.getRotation();
				that.renderer.save();
				if(rotation != 0){
					var width = viewer.getWindowWidth();
					var height = viewer.getWindowHeight();

					that.renderer.translate(width/2,height/2);
					that.renderer.rotate(rotation* Math.PI/180);
					that.renderer.translate(-width/2,-height/2);
				}

				var pt = viewer.toScreenPointNotRotate(x,y);
				pt.x = Math.round(pt.x);
				pt.y = Math.round(pt.y);

				that.renderer.clearRect(pt.x, pt.y, image_size, image_size);
				that.renderer.drawImage(image, pt.x, pt.y, image_size, image_size);

				that.renderer.restore();
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
	this._source.getTile(tile_zoom, view_extent, success, failure);
};

GeoBeans.Layer.TileLayer.prototype.toScreenPoint = function(x,y){
	var viewer = this.map.getViewer();
	var screenX = viewer.scale * (x - viewer.view_c.x) + viewer.win_cx;
	var screenY = viewer.win_cy - viewer.scale * (y - viewer.view_c.y);
	
	return new GeoBeans.Geometry.Point(screenX, screenY);
};



/**
 * 刷新，只有在滚动的时候才绘制缩略图
 * @private
 */
GeoBeans.Layer.TileLayer.prototype.refresh = function(flag){
	this.canvas.width = this.map.getViewer().getWindowWidth();
	this.canvas.height = this.map.getViewer().getWindowHeight();
	if(this.visible){
		var viewer = this.map.getViewer();
		var status = viewer.getStatus();
		if(status == GeoBeans.Viewer.Status.SCROLL){
			this.drawSnap();
		}
		this.draw();
	}
	else{
		this.clear();
	}
};