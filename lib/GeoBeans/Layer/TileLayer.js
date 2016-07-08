GeoBeans.TileLayerState = {
	LOADING : 0,
	LOADED : 1,
	ERROR : 2
};

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
		
		var viewer = this.map.viewer;
		var xmin = Math.max(viewer.xmin, this.FULL_EXTENT.xmin);
		var ymin = Math.max(viewer.ymin, this.FULL_EXTENT.ymin);
		var xmax = Math.min(viewer.xmax, this.FULL_EXTENT.xmax);
		var ymax = Math.min(viewer.ymax, this.FULL_EXTENT.ymax);
		
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
	
	
	// getResolution : function(level){
	// 	if( level<=0 || level>=this.RESOLUTIONS.length){
	// 		return -1;
	// 	}
	// 	return this.RESOLUTIONS[level-1];
	// },

	getResolution : function(level){
		if(this.resolution != null){
			return this.resolution;
		}
		if( level<=0 || level>=this.RESOLUTIONS.length){
			return -1;
		}
		return this.RESOLUTIONS[level-1];
	},

	getResolutionByLevel : function(level){
		if( level<=0 || level>=this.RESOLUTIONS.length){
			return -1;
		}
		return this.RESOLUTIONS[level-1];
	},
	getLevel : function(resolution){
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
		
		// set the level of the layer
		this.level = this.map.level;		
		// get resolution according to 
		this.resolution = this.getResolution(this.level);
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
	setMaxLevel : function(level){
		this.MAX_ZOOM_LEVEL = level;
	},

	// 获取该图层的最大级别
	getMaxLevel : function(){
		return this.MAX_ZOOM_LEVEL;
	},

	// 设置该图层的最小级别
	setMinLevel : function(level){
		this.MIN_ZOOM_LEVEL = level;
	},

	// 获取该图层的最小级别
	getMinLevel : function(){
		return this.MIN_ZOOM_LEVEL;
	},
});

GeoBeans.Layer.TileLayer.Type = {
	QS : "QuadServer",
	WMTS : "wmts"
};