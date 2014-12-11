GeoBeans.Layer.QSLayer = GeoBeans.Class(GeoBeans.Layer.TileLayer, {
	
	//"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8"
	
	AMP_URL : "/QuadServer/maprequest?services=world_image",
	// AMP_URL : "/QuadServer/maprequest?services=world_vector",
	//AMP_URL : "http://ourgis.digitalearth.cn/QuadServer/maprequest?services=world_image",
	//AMP_URL : "http://127.0.0.1:8080/QuadServer/maprequest?services=world_vector",
	
/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 10,	
	
	FULL_EXTENT : {
				xmin:-256,
				ymin:-256,
				xmax:256,
				ymax:256
	},
    
//	RESOLUTIONS : [
//				/*512,*/
//				256,
//				128,
//				64,
//				32,
//				16,
//				8,
//				4,
//				2,
//				1,
//				0.5,
//				0.25,
//				0.125,
//				0.0625,
//				0.03125,
//				0.015625,
//				0.0078125,
//				0.00390625,
//				0.001953125,
//				0.000976563,
//				0.000488281],

	RESOLUTIONS : [			
				/*2,*/
				1,
				0.5,
				0.25,
				0.125,
				0.0625,
				0.03125,
				0.015625,
				0.0078125,
				0.00390625,
				0.001953125,
				0.000976563,
				0.000488281,
				0.000244141,
				0.00012207,
				0.00006103515625,
				0.000030517578125,
				0.0000152587890625,
				0.00000762939453125,
				0.000003814697265625,
				0.0000019073486328125],

				
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
				tid = this.getTileID(row,col,level);
				turl = this.AMP_URL + "&" + tid;
				console.log(turl);
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(this.map,turl, this, row, col, level, 0, 0);
					this.cache.putTile(tile);
				}
			}
		}	
	},
	
	draw : function(){

		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymin);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var lspt = this.map.transformation.toMapPoint(llpt.x,llpt.y);
		
		var row, col, tile;
		var level = this.map.level;
		y = llpt.y - (row_min+1) * img_size;
		////y = llpt.y - img_size;
		for(row=row_min; row<row_max; row++){
			//x = llpt.x;
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<col_max; col++){
				tid = this.getTileID(row, col, level);
				turl = this.AMP_URL + "&" + tid;
				
				tile = this.cache.getTile(turl);
				if(tile!=null){
					tile.draw(x, y, img_size, img_size);
				}
				x += img_size;
			}
			y -= img_size;
		}
	},
	
	drawCache : function(){
		var tbound = this.computeTileBound();
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		//var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymin);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var row, col, tile;
		var level = this.map.level;
		y = llpt.y - (row_min+1) * img_size;
		//y = llpt.y - img_size;
		for(row=row_min; row<row_max; row++){
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<col_max; col++){
				tid = this.getTileID(row, col, level);
				turl = this.AMP_URL + "&" + tid;
				
				tile = this.cache.getTile(turl);
				if(tile!=null){
					tile.draw(x, y, img_size, img_size);
				}
				x += img_size;
			}
			y -= img_size;
		}
	},
	
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
	
	getTileID : function(row, col, level){
		return ("col=" + col + "&row=" + row + "&level=" + level);
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
		var row_min = Math.floor((ve.ymin - this.FULL_EXTENT.ymin) / tile_map_size);
		var row_max = Math.ceil ((ve.ymax - this.FULL_EXTENT.ymin) / tile_map_size);
		
		return {
			rmin:row_min,
			rmax:row_max,
			cmin:col_min,
			cmax:col_max};
	},
	
});