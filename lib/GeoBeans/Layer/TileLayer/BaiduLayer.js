GeoBeans.Layer.BaiduLayer = GeoBeans.Class(GeoBeans.Layer.TileLayer, {
	
	// FULL_EXTENT : new max.Extent({
 //        xmin: -20037508.3427892,
 //        ymin: -20037508.3427892,
 //        xmax: 20037508.3427892,
 //        ymax: 20037508.3427892
 //    }),
	
	BMP_URL : "/bmap/tile/?qt=tile&scaler=1&styles=pl",
	ORIGIN :{
        x: 0,
        y: 0
    },
    FULL_EXTENT : {
				xmin:-33554432,
				ymin:-33554432,
				xmax:33554432,
				ymax:33554432
	},
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 3,
	MAX_ZOOM_LEVEL: 19,	
    
	RESOLUTIONS : [
				131072, 
				65536,
				32768, 
				16384, 
				8192, 
				4096, 
				2048, 
				1024,
				512,
				256,
				128,
				64,
				32,
				16,
				8,
				4,
				2,
				1,
				0.5],
	
	initialize : function(name){
		GeoBeans.Layer.TileLayer.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){
		GeoBeans.Layer.TileLayerLayer.prototype.destroy.apply(this, arguments);
	},
	computeTileBound : function(){
		var map = this.map;
		var level = map.level;
		var resolution = map.resolution;
		var tile_map_size = resolution * this.IMG_WIDTH;
		// 
		var ve = this.getValidView();
		
		// var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_map_size);
		// var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_map_size);
		// var row_min = Math.floor((this.FULL_EXTENT.ymax - ve.ymax) / tile_map_size);
		// var row_max = Math.ceil ((this.FULL_EXTENT.ymax - ve.ymin) / tile_map_size);

		var col_min = Math.floor((ve.xmin - 0) / tile_map_size);
		var col_max = Math.ceil ((ve.xmax - 0) / tile_map_size);
		// var row_min = Math.floor((0 - ve.ymax) / tile_map_size);
		// var row_max = Math.ceil ((0 - ve.ymin) / tile_map_size);		
		var row_min = Math.floor(ve.ymin / tile_map_size);
		var row_max = Math.ceil (ve.ymax / tile_map_size);	
		return {
			rmin:row_min,
			rmax:row_max,
			cmin:col_min,
			cmax:col_max};
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
				turl = this.BMP_URL + "&" + tid;
				
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(this.map,turl, this, col, row, level, 0, 0);
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
				tid = this.getTileID(row, col, level);
				turl = this.BMP_URL + "&" + tid;
				
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
				tid = this.getTileID(row, col, level);
				turl = this.BMP_URL + "&" + tid;
				
				tile = this.cache.getTile(turl);
				if(tile!=null){
					tile.draw(x, y, img_size, img_size);
				}
				x += img_size;
			}
			y += img_size;
		}
	},
	
	preDraw:function(){
		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;

		var resolution = this.map.resolution;
		var tile_map_size = resolution * this.IMG_WIDTH;

		var row_extent_max = Math.floor(this.FULL_EXTENT.ymax / tile_map_size);
		var col_extent_min = Math.floor(this.FULL_EXTENT.xmin / tile_map_size);


		
		var llpt = this.map.transformation.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		// var llpt = this.map.transformation.toScreenPoint(0, 0);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var row, col, tile;
		this.tiles = [];
		var level = this.map.level;
		// y = llpt.y + row_min * img_size;
		y = llpt.y + (row_extent_max-row_max) * img_size;

		for(row=row_max-1; row>=row_min; row--){
			// x = llpt.x + col_min * img_size;
			x = llpt.x + (col_min - col_extent_min) * img_size;
			for(col=col_min; col<col_max; col++){
				tid = this.getTileID(row, col, level);
				turl = this.BMP_URL + "&" + tid;
				
				tile = this.cache.getTile(turl);
				// if(tile!=null){
				// 	tile.draw(x, y, img_size, img_size);
				// }
				var tileObj = new Object();
				tileObj.tile = tile;
				tileObj.img_size = img_size;
				tileObj.x = x ;
				tileObj.y = y;
				this.tiles.push(tileObj);	
				console.log(tid + ":" + "x:" + tileObj.x + ",y:" + tileObj.y);			
				x += img_size;
			}
			y += img_size;
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
		//如果都在内存里面，判断是否都在可以绘制完
		for(var i = 0; i < this.tiles.length;++i){
			var tile_obj = this.tiles[i];
			if(tile_obj.tile.state != GeoBeans.TileState.LOADED){
				return;
			}
		}
		drawBaseLayerCallback(this.map);		
	},

	loadTileCallback:function(tile,drawBaseLayerCallback,tiles,index){
		var tileObj = tiles[index];
		var img_size = tileObj.img_size;
		var x = tileObj.x;
		var y = tileObj.y;
		tile.draw(x, y, img_size, img_size);
		// 判断是否可以回调了
		for(var i = 0; i < tiles.length;++i){
			var tile_obj = tiles[i];
			if(tile_obj.tile.state != GeoBeans.TileState.LOADED){
				return;
			}
		}
		drawBaseLayerCallback(tile.map);
	},		

	getTileID : function(row, col, level){
		return ("x=" + col + "&y=" + row + "&z=" + level);
	},	
});