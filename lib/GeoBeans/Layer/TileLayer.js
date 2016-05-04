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
	
	initialize : function(name, url){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.url = url;
		this.cache = new GeoBeans.TileCache();

		this.tiles = [];
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
	
	
	getResolution : function(level){
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
				if(i < minLevel){
					return minLevel;
				}else if(i > maxLevel){
					return maxLevel;
				}else{
					return i;	
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

});

GeoBeans.Layer.TileLayer.Type = {
	QS : "QuadServer",
	WMTS : "wmts"
};