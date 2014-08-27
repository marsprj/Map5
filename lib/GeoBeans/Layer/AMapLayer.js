GeoBeans.Layer.AMapLayer = GeoBeans.Class(GeoBeans.Layer.TileLayer, {
	
	//"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8"
	
	AMP_URL : "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8",
	
/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 14,	
	
	FULL_EXTENT : {
				xmin:-20037508.3427892,
				ymin:-20037508.3427892,
				xmax:20037508.3427892,
				ymax:20037508.3427892
	},
    
	RESOLUTIONS : [
				78271.51696402031, 
				39135.75848201016, 
				19567.87924100508, 
				9783.939620502539, 
				4891.96981025127, 
				2445.984905125635, 
				1222.992452562817, 
				611.4962262814087, 
				305.7481131407043, 
				152.8740565703522, 
				76.43702828517608, 
				38.21851414258804, 
				19.10925707129402, 
				9.554628535647009],
				
	resolution : null,
	rows : null,
	cols : null,
	/**
	 * 设置的中心点有可能在Tile中间
	 **/
	offset_x : 0.0,
	offset_y : 0.0,
	
	lrow : 0,
	urow : 0,
	lcol : 0,
	rcol : 0,			

	initialize : function(name, url){
		GeoBeans.Layer.TileLayer.prototype.initialize.apply(this, arguments);
		
		
	},
	
	destory : function(){
		GeoBeans.Layer.TileLayer.prototype.destroy.apply(this, arguments);
	},
	
	updateTileCache : function(tbound){
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var tile = null;
		var tid, turl;
		var row, col, r, c;
		var level = this.map.level;
		for(row=row_min; row<row_max; row++){
			for(col=col_min; col<col_max; col++){
				tid = "x=" + col + "&y=" + row + "&z=" + level;
				turl = this.AMP_URL + "&" + tid;
				
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(turl, this, col, row, level, 0, 0);
					this.cache.putTile(tile);
				}
			}
		}
//		for(col=col_min; col<col_max; col++){
//			for(row=row_min; row<row_max; row++){
//				tid = "x=" + col + "&y=" + row + "&z=" + level;
//				turl = this.AMP_URL + "&" + tid;
//				
//				if(this.cache.getTile(turl)==null){
//					tile = new GeoBeans.Tile(turl, this, col, row, level, 0, 0);
//					this.cache.putTile(tile);
//				}
//			}
//		}
			
	},
	/////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
     * get the Resolution of the Layer according to the Level
     * @param level
     */
/*	getResolution : function(level){
		if( level<=0 || level>=this.RESOLUTIONS.length){
			return -1;
		}
		return this.RESOLUTIONS[level-1];
	},*/
	
	getRows : function(){
		
	},
	
	getCols : function(){
	},
	
	computeExtent : function(){
		
	},
	
	computeCenterTileOffset : function(){
		var c  = this.map.center;
		var xd = c.x - this.ORIGIN.x;
		var yd = c.y - this.ORIGIN.y;
		
		var xo = Math.floor((c.x - this.ORIGIN.x)/this.resolution);
		var yo = Math.floor((c.y - this.ORIGIN.y)/this.resolution);
		
		offset_x = xo;
		offset_y = yo;
	},
	

	
//	updateTileCache : function(rule){
//		
//		var url  = null;
//		var xmin = null;
//        var ymax = null;
//		var tile = null;
//		var row = null;
//		var col = null;
//		var center = this.map.center;
//		var cwx = this.map.width / 2;
//		var cwy = this.map.height/ 2;
//				
//		this.tileCache = [];
//		for(var i=rule.dmin; i<=rule.dmax; i++){
//			for(var j=rule.lmin; j<=rule.lmax; j++){
//				var col = i + this.center_row;
//				var row = j + this.center_col;
//				url = this.AMP_URL + "&x=" + row + "&y=" + col + "&z=" + rule.level;
//				//xmin = i * this.IMG_WIDTH * rule.resolution + this.ORIGIN.x;
//           		//ymax = this.ORIGIN.y - j * this.IMG_HEIGHT * rule.resolution;
//				
//				//xmin = i * this.IMG_WIDTH * rule.resolution + center.x + this.c_offset_x;
//				//ymax = this.ORIGIN.y - j * this.IMG_HEIGHT * rule.resolution;
//
//				xmin = cwx + j*this.IMG_WIDTH  + this.c_offset_x;				
//				ymax = cwy + i*this.IMG_HEIGHT + this.c_offset_y;
//				
//				if(!this.isCached(url)){
//					tile = new GeoBeans.Tile(url, this, i, j, rule.level, xmin, ymax);
//					this.tileCache.push(tile);
//				}
//			}
//		}
//	},
	
	/*这个函数没用*/
	isCached : function(url){
		for(var k in this.tileCache){
			var tile = this.tileCache[k];
			if(tile.url==url){
				return true;
			}
		}
		return false;
	}
	
});