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
	
	
	initialize : function(name, url){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.url = url;
		this.cache = new GeoBeans.TileCache();;
		
	},
	
	destory : function(){
		
		this.server= null;
		this.scale = null;
		this.cache = null;
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
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
	
	draw : function(){
		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var row, col, tile;
		var level = this.map.level;
		y = llpt.y + row_min * img_size;
		for(row=row_min; row<row_max; row++){
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<col_max; col++){
				tid = "x=" + col + "&y=" + row + "&z=" + level;
				turl = this.AMP_URL + "&" + tid;
				
				tile = this.cache.getTile(turl);
				if(tile!=null){
					tile.draw(x, y, img_size, img_size);
				}
				x += img_size;
			}
			y += img_size;
		}
	},
	
	drawCache : function(){
		var tbound = this.computeTileBound();
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var row, col, tile;
		var level = this.map.level;
		y = llpt.y + row_min * img_size;
		for(row=row_min; row<row_max; row++){
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<col_max; col++){
				tid = "x=" + col + "&y=" + row + "&z=" + level;
				turl = this.AMP_URL + "&" + tid;
				
				tile = this.cache.getTile(turl);
				if(tile!=null){
					tile.draw(x, y, img_size, img_size);
				}
				x += img_size;
			}
			y += img_size;
		}
	},
	
	computeTileBound : function(){
		var map = this.map;
		var level = map.level;
		var resolution = map.resolution;
		var tile_map_size = resolution * this.IMG_WIDTH;
		// 
		var ve = this.getValidView();
		
		var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_map_size);
		var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_map_size);
		var row_min = Math.floor((this.FULL_EXTENT.ymax - ve.ymax) / tile_map_size);
		var row_max = Math.ceil ((this.FULL_EXTENT.ymax - ve.ymin) / tile_map_size);
		
		return {
			rmin:row_min,
			rmax:row_max,
			cmin:col_min,
			cmax:col_max};
	},
	
	getResolution : function(level){
		if( level<=0 || level>=this.RESOLUTIONS.length){
			return -1;
		}
		return this.RESOLUTIONS[level-1];
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