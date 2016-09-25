GeoBeans.TileLayerState = {
	LOADING : 0,
	LOADED : 1,
	ERROR : 2
};

/**
 * @classdesc
 * 瓦片图层
 * @class
 * @extends {GeoBeans.Layer}
 */
GeoBeans.Layer.TileLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	//FULL_EXTENT :	null,
	//ORIGIN : 		null,
    IMG_WIDTH : 	null,
    IMG_HEIGHT:		null,	
	MIN_ZOOM_LEVEL: null,
	MAX_ZOOM_LEVEL: null,	    
	RESOLUTIONS : 	null,
	
	server: null,
	scale : null,
	cache : null,

	state : null,
	tiles : null,
	// 图片缩放比例
	imageScale : null,

	// 旋转后的图片
	rotateCanvas : null,
	
	initialize : function(name, url){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.url = url;
		this.cache = new GeoBeans.TileCache();

		this.tiles = [];
		this.imageScale =  1.0;
	},
	
	destroy : function(){
		
		this.server= null;
		this.scale = null;
		this.cache = null;
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
	},
	setName : function(){
		this.name = name;
	},
	
	/**
	 * 有效view指落在FULL_EXTENT范围内的view
	 **/
	getValidView : function(){
		
		var viewer = this.map.getViewer();
		var extent = viewer.getExtent();
		var xmin = Math.max(extent.xmin, this.FULL_EXTENT.xmin);
		var ymin = Math.max(extent.ymin, this.FULL_EXTENT.ymin);
		var xmax = Math.min(extent.xmax, this.FULL_EXTENT.xmax);
		var ymax = Math.min(extent.ymax, this.FULL_EXTENT.ymax);
		
		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
	},
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	updateScale : function(){
		var map = this.map;
		var extent = this.FULL_EXTENT;
	},
	
	draw : null,
	drawCache : null,
	preDraw : null,
	loadingTiles : null,

	getTileID : null,
	computeTileBound : null,
	
	
	// getResolution : function(zoom){
	// 	if( zoom<=0 || zoom>=this.RESOLUTIONS.length){
	// 		return -1;
	// 	}
	// 	return this.RESOLUTIONS[zoom-1];
	// },

	getResolution : function(zoom){
		if(this.resolution != null){
			return this.resolution;
		}
		if( zoom<=0 || zoom>=this.RESOLUTIONS.length){
			return -1;
		}
		return this.RESOLUTIONS[zoom-1];
	},

	getResolutionByZoom : function(zoom){
		if( zoom<=0 || zoom>=this.RESOLUTIONS.length){
			return -1;
		}
		return this.RESOLUTIONS[zoom-1];
	},
	
	getZoom : function(resolution){
		var maxLevel = this.MAX_ZOOM_LEVEL;
		var minLevel = this.MIN_ZOOM_LEVEL;
		for(var i = 0;i < this.RESOLUTIONS.length;++i){
			var re = this.RESOLUTIONS[i];
			if(resolution >= re){
				if(i+1 < minLevel){
					return minLevel;
				}else if(i+1 > maxLevel){
					return maxLevel;
				}else{
					// return i;	
					// return i + 1;
					var  big = this.RESOLUTIONS[i -1];
					if(big != null){
						var delta = (big - resolution) / (big - re);
						console.log(delta);
						this.imageScale = big/resolution; 
						// this.imageScale = re/resolution;
						console.log(this.imageScale);
						this.resolution = resolution;
						return i; 
					}
					
				}
			}
		}
		return maxLevel;
	},
	
	init : function(){
		// update resultion
		var map = this.map;
		
		// set the zoom of the layer
		this.zoom = this.map.zoom;		
		// get resolution according to 
		this.resolution = this.getResolution(this.zoom);
		// compute extent of the map
		map.setResolution(this.resolution);
		map.updateMapExtent();
		//this.cols = this.getCols();		
	},

	// 设置透明度
	setOpacity : function(opacity){
		if(opacity >=0 && opacity <=1){
			this.opacity = opacity;
			this.renderer.setGlobalAlpha(this.opacity);
		}
	},


	// 设置该图层的最大级别
	setMaxZoom : function(zoom){
		this.MAX_ZOOM_LEVEL = zoom;
	},

	// 获取该图层的最大级别
	getMaxZoom : function(){
		return this.MAX_ZOOM_LEVEL;
	},

	// 设置该图层的最小级别
	setMinZoom : function(zoom){
		this.MIN_ZOOM_LEVEL = zoom;
	},

	// 获取该图层的最小级别
	getMinZoom : function(){
		return this.MIN_ZOOM_LEVEL;
	},


	getRotateCanvas : function(){
		if(this.rotateCanvas != null){
			return this.rotateCanvas;
		}

		this.rotateCanvas = document.createElement("canvas");
		this.rotateCanvas.width = this.canvas.width*2;
		this.rotateCanvas.height = this.canvas.height*2;
		return this.rotateCanvas;
	},

	/**
	 * 转换到屏幕坐标，不加旋转角度的
	 * @param  {[type]} mx [description]
	 * @param  {[type]} my [description]
	 * @return {[type]}    [description]
	 */
	toScreenPoint : function(mx,my){
		var viewer = this.map.viewer;
		var screenX = viewer.scale * (mx - viewer.view_c.x) + viewer.win_cx;
		var screenY = viewer.win_cy - viewer.scale * (my - viewer.view_c.y);
		
		return new GeoBeans.Geometry.Point(screenX, screenY);
	},
});

/**
 * [Type description]
 * @type {Object}
 */
GeoBeans.Layer.TileLayer.Type = {
	QS : "QuadServer",
	WMTS : "wmts",
	PGIS : "pgis"
};