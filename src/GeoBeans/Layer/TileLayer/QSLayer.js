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
	
	MIN_ZOOM_LEVEL: 2,
	MAX_ZOOM_LEVEL: 17,	
	
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
		this.type = GeoBeans.Layer.TileLayer.Type.QS;
	},
	
	destroy : function(){
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
				turl = this.url + "&" + tid;
				// console.log(turl);
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(this.map,turl, this, row, col, level, 0, 0);
					this.cache.putTile(tile);
				}
			}
		}	
	},
	

	preDraw: function(){
		var level = this.map.level;
		var maxLevel = this.getMaxLevel();
		var minLevel = this.getMinLevel();
		if(level > maxLevel || level < minLevel){
			this.tiles = [];
			this.renderer.clearRect();
			this.snap = null;
			return;
		}
		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		// var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymin);
		var llpt = this.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymin);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		console.log(llpt);
		var img_size = this.IMG_WIDTH * (this.imageScale);
		if(this != this.map.baseLayer){
			var resolution = this.map.getMapViewer().getResolution();
			var re = this.getResolutionByLevel(this.map.level);
			if(resolution != re){
				img_size = this.IMG_WIDTH * (this.imageScale) * re/resolution;
			}
		}
		
		var x, y;
		
		var row, col, tile;
		this.tiles = [];
		var level = this.map.level;
		y = llpt.y - (row_min+1) * img_size;
		////y = llpt.y - img_size;
		for(row=row_min; row<row_max; row++){
			//x = llpt.x;
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<col_max; col++){
				tid = this.getTileID(row, col, level);
				turl = this.url + "&" + tid;
				
				tile = this.cache.getTile(turl);
				// if(tile!=null){
				// 	tile.draw(x, y, img_size, img_size);
				// }
				var tileObj = new Object();
				tileObj.tile = tile;
				tileObj.img_size = img_size;
				tileObj.x = x;
				tileObj.y = y;
				this.tiles.push(tileObj);
				x += img_size;
			}
			y -= img_size;
		}		

	},

	loadingTiles : function(drawBaseLayerCallback){

		for(var i = 0; i < this.tiles.length; ++i){
			var tile = this.tiles[i].tile;
			if(tile == null){
				continue;
			}
			
			if(tile.state != GeoBeans.TileState.LOADED){
				tile.loading(drawBaseLayerCallback,this.loadTileCallback,this.tiles,i);
				this.state = GeoBeans.TileLayerState.LOADING;
			}else if(tile.state == GeoBeans.TileState.LOADED){
				var tileObj = this.tiles[i];
				var img_size = tileObj.img_size;
				var x = tileObj.x;
				var y = tileObj.y;
				tile.draw(x, y, img_size, img_size);				
			}
		}
	},

	loadTileCallback:function(tile,drawBaseLayerCallback,tiles,index){
		var tileObj = tiles[index];
		var img_size = tileObj.img_size;
		var x = tileObj.x;
		var y = tileObj.y;
		tile.draw(x, y, img_size, img_size);
	},

	draw : function(){
		for(var i = 0;i < this.tilesLoaded.length;++i){
			var tileObj = this.tilesLoaded[i];
			var tile = tileObj.tile;
			var img_size = tileObj.img_size;
			var x = tileObj.x;
			var y = tileObj.y;
			if(tile != null){
				tile.draw(x, y, img_size, img_size);
			}
		}
		
	},
	
	// drawCache : function(){
	// 	var tbound = this.computeTileBound();
		
	// 	var row_min = tbound.rmin;
	// 	var row_max = tbound.rmax;
	// 	//var row_max = tbound.rmax;
	// 	var col_min = tbound.cmin;
	// 	var col_max = tbound.cmax;
		
	// 	var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymin);
	// 	llpt.x = Math.floor(llpt.x+0.5);
	// 	llpt.y = Math.floor(llpt.y+0.5);
	// 	var img_size = this.IMG_WIDTH * this.scale;
	// 	var x, y;
		
	// 	var row, col, tile;
	// 	var level = this.map.level;
	// 	y = llpt.y - (row_min+1) * img_size;
	// 	//y = llpt.y - img_size;
	// 	for(row=row_min; row<row_max; row++){
	// 		x = llpt.x + col_min * img_size;
	// 		for(col=col_min; col<col_max; col++){
	// 			tid = this.getTileID(row, col, level);
	// 			turl = this.url + "&" + tid;
				
	// 			tile = this.cache.getTile(turl);
	// 			if(tile!=null){
	// 				tile.draw(x, y, img_size, img_size);
	// 			}
	// 			x += img_size;
	// 		}
	// 		y -= img_size;
	// 	}
	// },
	
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
		// var resolution = map.resolution;
		var resolution = this.getResolutionByLevel(level);
		var tile_map_size = resolution * this.IMG_WIDTH;
		// 
		var ve = this.getValidView();
		
		var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_map_size);
		var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_map_size);
		var row_min = Math.floor((ve.ymin - this.FULL_EXTENT.ymin) / tile_map_size);
		var row_max = Math.ceil ((ve.ymax - this.FULL_EXTENT.ymin) / tile_map_size);
		
		return {
			rmin:row_min -1,
			rmax:row_max + 1,
			cmin:col_min - 1,
			cmax:col_max + 1};
	},


	// toScreenPoint : function(mx,my){
	// 	var transformation = this.map.transformation;
	// 	var screenX = transformation.scale * (mx - transformation.view_c.x) + transformation.win_cx;
	// 	var screenY = transformation.win_cy - transformation.scale * (my - transformation.view_c.y);
		
	// 	return new GeoBeans.Geometry.Point(screenX, screenY);
	// },


	toScreenPoint : function(mx,my){
		var transformation = this.map.viewer._transformation;
		var screenX = transformation.scale * (mx - transformation.view_c.x) + transformation.win_cx;
		var screenY = transformation.win_cy - transformation.scale * (my - transformation.view_c.y);
		
		return new GeoBeans.Geometry.Point(screenX, screenY);
	},
});