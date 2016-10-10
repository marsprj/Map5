/**
 * @classdesc
 * OGC WMTS图层
 * @class
 * @extends {GeoBeans.Layer.TileLayer}
 */
GeoBeans.Layer.WMTSLayer = GeoBeans.Class(GeoBeans.Layer.TileLayer,{
	name 			: null,
	type 			: null,
	extent 			: null,
	format 			: null,
	// tileMatrixSet
	tms 			: null,

	// 数据库
	sourceName		: null,
 	// IMG_WIDTH 		: 256,
 	// IMG_HEIGHT 		: 256,

 	IMG_WIDTH 		: 180,
 	IMG_HEIGHT 		: 180,

 	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 10,	

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

	initialize : function(name,server,typeName,extent,tms,format,sourceName){
		GeoBeans.Layer.TileLayer.prototype.initialize.apply(this, arguments);

		// this.server = server;
		// this.name = name;
		this.typeName = typeName;
		this.extent = extent;
		this.tms = tms;
		this.format = format;
		// this.FULL_EXTENT = {
		// 	xmin : this.extent.xmin,
		// 	ymin : this.extent.ymin,
		// 	xmax : this.extent.xmax,
		// 	ymax : this.extent.ymax
		// }
		// 固定
		this.FULL_EXTENT = {
			xmin : -180,
			ymin : -90,
			xmax : 180,
			ymax : 90
		}
		this.scale = 1.0;
		this.sourceName = sourceName;
		this.type = GeoBeans.Layer.TileLayer.Type.WMTS;
		// this.scale = (this.extent.ymax - this.extent.ymin)/this.IMG_HEIGHT;
	},

	setExtent : function(extent){
		this.extent = extent;
	},

	getExtent : function(){
		return this.extent;
	},

	setFormat : function(format){
		this.format = format;
	},

	getFormat : function(){
		return this.format;
	},

	setTMS : function(tms){
		this.tms = tms;
	},

	getTMS : function(){
		return this.tms;
	},

	load : function(){
		this.preDraw();
		this.loadingTiles();
	},


	preDraw : function(){
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);

		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		// console.log('row:' + row_min + "," + row_max 
		// 	+ ";col:" + col_min + "," + col_max);

		// 计算位置

		var viewer = this.map.getViewer();
		var llpt = viewer.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		var img_size = this.IMG_WIDTH * this.scale;

		var x, y;
		var lspt = viewer.toMapPoint(llpt.x,llpt.y);
		var row, col, tile;
		this.tiles = [];
		var zoom = viewer.getZoom();
		// y = llpt.y - (row_min+1) * img_size;
		y = llpt.y - row_min * img_size;
		y = llpt.y + row_min * img_size;
		for(row=row_min; row<=row_max; row++){
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<=col_max; col++){
				tid = this.getTileID(row, col, zoom);
				turl = this.url + tid;
				
				tile = this.cache.getTile(turl);

				var tileObj = new Object();
				tileObj.tile = tile;
				tileObj.img_size = img_size;
				tileObj.x = x;
				tileObj.y = y;
				// console.log(tile.tid + ";x:" + x  +　";y:" + y);
				this.tiles.push(tileObj);
				x += img_size;
			}
			y += img_size;
		}		
	},

	computeTileBound : function(){
		var map = this.map;
		var viewer = map.getViewer();
		var resolution = viewer.getResolution();
		var tile_map_size = resolution * this.IMG_WIDTH;
		// 
		var ve = this.getValidView();
		
		var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_map_size);
		var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_map_size);
		// var row_min = Math.floor((ve.ymin - this.FULL_EXTENT.ymin) / tile_map_size);
		// var row_max = Math.ceil ((ve.ymax - this.FULL_EXTENT.ymin) / tile_map_size);
		var row_min = Math.floor ((this.FULL_EXTENT.ymax - ve.ymax) / tile_map_size);
		var row_max = Math.ceil((this.FULL_EXTENT.ymax - ve.ymin) / tile_map_size);
		
		
		return {
			rmin:row_min,
			rmax:row_max - 1,
			cmin:col_min,
			cmax:col_max - 1};
	},

	updateTileCache : function(tbound){
		
		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		
		var tile = null;
		var tid, turl;
		var row, col, r, c;
		var viewer = this.map.getViewer();
		var zoom = viewer.getZoom();
		for(row=row_min; row<=row_max; row++){
			for(col=col_min; col<=col_max; col++){
				tid = this.getTileID(row,col,zoom);
				turl = this.url  + tid;
				// console.log(turl);
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(this.map,turl, this, row, col, zoom, 0, 0);
					this.cache.putTile(tile);
				}
			}
		}	
	},

	getTileID : function(row, col, zoom){
		var str = "?SERVICE=dbs&REQUEST=GetTile&VERSION=1.0.0&LAYER="
				+ this.typeName + "&STYLE=Default&FORMAT=" + this.format
				+ "&TILEMATRIXSET=" + this.tms + "&TILEMATRIX=" + this.tms 
				+ ":" + zoom + "&TILEROW=" + row + "&TILECOL=" + col
				+ "&sourceName=" + this.sourceName;				
		return str;
	},

	// getTileID : function(row, col, zoom){
	// 	var str = "?SERVICE=wmts&REQUEST=GetTile&VERSION=1.0.0&LAYER="
	// 			+ this.typeName + "&STYLE=&FORMAT=" + this.format
	// 			+ "&TILEMATRIXSET=" + this.tms + "&TILEMATRIX=" + this.tms 
	// 			+ ":" + zoom + "&TILEROW=" + row + "&TILECOL=" + col;		
	// 	return str;
	// },

	getUrl : function(){
		return "typeName:" + this.typeName + ";format:" + this.format + ";tms:" + this.tms
			+ ";extent:" + this.extent.toString() + ";sourceName:" + this.sourceName
			+ ";url:" + this.url + ";startLevel:" + this.MIN_ZOOM_LEVEL + ";endLevel:" + this.MAX_ZOOM_LEVEL;
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
				this.flag = GeoBeans.Layer.Flag.READY;
			}else if(tile.state == GeoBeans.TileState.LOADED){
				var tileObj = this.tiles[i];
				var img_size = tileObj.img_size;
				var x = tileObj.x;
				var y = tileObj.y;
				tile.draw(x, y, img_size, img_size);				
			}
		}
	},

	// 获得每一个
	loadTileCallback:function(tile,tiles,index){
		var tileObj = tiles[index];
		var img_size = tileObj.img_size;
		var x = tileObj.x;
		var y = tileObj.y;
		tile.draw(x, y, img_size, img_size);

	},

	draw : function(){
		this.preDraw();
		this.loadingTiles();
	},

});