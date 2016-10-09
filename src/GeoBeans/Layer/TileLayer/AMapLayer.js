/**
 * @classdesc
 * 高德地图图层
 * @class
 * @extends {GeoBeans.Layer.TileLayer}
 */
GeoBeans.Layer.AMapLayer = GeoBeans.Class(GeoBeans.Layer.TileLayer, {
	
	//"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8"
	
	AMP_URL : "/appmaptile?lang=zh_cn&size=1&scale=1&style=7",
	//AMP_URL : "http://wprd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7",
	
/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 18,	
	
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
				9.554628535647009,
				4.777314267823505,
				2.388657133911752,
				1.194328566955876,
				0.5971642834779381],
				
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

	computeTileBound : function(){
		var map = this.map;

		var viewer = map.getViewer(); 
		var level = viewer.getZoom();
		var resolution = viewer.getResolution();
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
	
	updateTileCache : function(tbound){
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var tile = null;
		var tid, turl;
		var row, col, r, c;
		var level = this.map.getViewer().getZoom();;
		for(row=row_min; row<row_max; row++){
			for(col=col_min; col<col_max; col++){
				tid = "x=" + col + "&y=" + row + "&z=" + level;
				turl = this.AMP_URL + "&" + tid;
				
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
		
		var viewer = this.map.getViewer();
		var llpt = this.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var row, col, tile;
		var level = this.map.getViewer().getZoom();;
		y = llpt.y + row_min * img_size;
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
			y += img_size;
		}
	},
	
	drawCache : function(){
		var tbound = this.computeTileBound();
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var llpt = this.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;
		var x, y;
		
		var row, col, tile;
		var level = this.map.getViewer().getZoom();;
		y = llpt.y + row_min * img_size;
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
			y += img_size;
		}
	},
	
	preDraw:function(){
		var viewer = this.map.getViewer();
		var zoom = viewer.getZoom();
		var maxZoom = this.getMaxZoom();
		var minZoom = this.getMinZoom();
		if(zoom > maxZoom || zoom < minZoom){
			this.tiles = [];
			this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
			this.snap = null;
			return;
		}
				
		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var viewer = this.map.getViewer();
		var llpt = this.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * (this.imageScale);
		if(this != this.map.baseLayer){
			var resolution = this.map.getViewer().getResolution();
			var re = this.getResolutionByZoom(zoom);
			if(resolution != re){
				img_size = this.IMG_WIDTH * (this.imageScale) * re/resolution;
			}
		}
		var x, y;

		var row, col, tile;
		this.tiles = [];
		var level = viewer.getZoom();
		y = llpt.y + row_min * img_size;
		for(row=row_min; row<row_max; row++){
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<col_max; col++){
				tid = this.getTileID(row, col, level);
				turl = this.AMP_URL + "&" + tid;
				
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
			y += img_size;
		}
	},
	loadingTiles : function(){

		for(var i = 0; i < this.tiles.length; ++i){
			var tile = this.tiles[i].tile;
			if(tile == null){
				continue;
			}
			
			if(tile.state != GeoBeans.TileState.LOADED){
				tile.loading(this.loadTileCallback,this.tiles,i);
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

	loadTileCallback:function(tile,tiles,index){
		var tileObj = tiles[index];
		var img_size = tileObj.img_size;
		var x = tileObj.x;
		var y = tileObj.y;
		tile.draw(x, y, img_size, img_size);
	},	
	/////////////////////////////////////////////////////////////////////////////////////////////
	
	
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
		return ("x=" + col + "&y=" + row + "&z=" + level);
	},
	

	
	/*这个函数没用*/
	// isCached : function(url){
	// 	for(var k in this.tileCache){
	// 		var tile = this.tileCache[k];
	// 		if(tile.url==url){
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// }
	
});