/**
 * @classdesc
 * PGIS图层
 * @class
 * @extends {GeoBeans.Layer.TileLayer}
 */
GeoBeans.Layer.PGISLayer = GeoBeans.Class(GeoBeans.Layer.TileLayer,{
	name 			: null,
	type 			: null,
	extent 			: null,
	format 			: null,
	// tileMatrixSet
	tms 			: null,

	// 数据库
	sourceName		: null,
 	IMG_WIDTH 		: 256,
 	IMG_HEIGHT 		: 256,

 	// IMG_WIDTH 		: 180,
 	// IMG_HEIGHT 		: 180,

 	MIN_ZOOM_LEVEL: 2,
	MAX_ZOOM_LEVEL: 14,	

	FULL_EXTENT : {
			xmin : -180,
			ymin : -90,
			xmax : 180,
			ymax : 90
	},

	RESOLUTIONS : [
		0.703125,
		0.3515625,
		0.17578125,
		0.087890625,
		0.0439453125,
		0.02197265625,
		0.010986328125,
		0.0054931640625,
		0.00274658203125,
		0.001373291015625,
		0.0006866455078125,
		0.00034332275390625,
		0.000171661376953125,
		0.0000858306884765625,
		0.00004291534423828125,
		0.000021457672119140625,
		0.0000107288360595703125,
		0.00000536441802978515625,
		0.000002682209014892578125,
		0.0000013411045074462890625
	],



	// RESOLUTIONS : [			
	// 		/*2,*/
	// 		1,
	// 		0.5,
	// 		0.25,
	// 		0.125,
	// 		0.0625,
	// 		0.03125,
	// 		0.015625,
	// 		0.0078125,
	// 		0.00390625,
	// 		0.001953125,
	// 		0.000976563,
	// 		0.000488281,
	// 		0.000244141,
	// 		0.00012207,
	// 		0.00006103515625,
	// 		0.000030517578125,
	// 		0.0000152587890625,
	// 		0.00000762939453125,
	// 		0.000003814697265625,
	// 		0.0000019073486328125],

	// RESOLUTIONS :[
	// 	new Number("5.916587109091312E8"),
	// 	new Number("2.958293554545656E8"),
	// 	new Number("1.479146777272828E8"),
	// 	new Number("7.39573388636414E7"),
	// 	new Number("3.69786694318207E7"),
	// 	new Number("1.848933471591035E7"),
	// 	9244667.357955175,
	// 	4622333.678977587,
	// 	2311166.8394887936,
	// 	1155583.4197443968,
	// 	577791.7098721984,
	// 	288895.8549360992,
	// 	144447.9274680496,
	// 	72223.9637340248,
	// 	36111.9818670124,
	// 	18055.9909335062,
	// 	9027.9954667531,
	// 	4513.99773337655,
	// 	2256.998866688275,
	// 	1128.4994333441375,
	// 	564.2497166720688
	// ],



	// initialize : function(name,server,typeName,extent,tms,format,sourceName){
	// 	GeoBeans.Layer.TileLayer.prototype.initialize.apply(this, arguments);

	// 	// this.server = server;
	// 	// this.name = name;
	// 	this.typeName = typeName;
	// 	this.extent = extent;
	// 	this.tms = tms;
	// 	this.format = format;
	// 	// this.FULL_EXTENT = {
	// 	// 	xmin : this.extent.xmin,
	// 	// 	ymin : this.extent.ymin,
	// 	// 	xmax : this.extent.xmax,
	// 	// 	ymax : this.extent.ymax
	// 	// }
	// 	// 固定
	// 	this.FULL_EXTENT = {
	// 		xmin : -180,
	// 		ymin : -90,
	// 		xmax : 180,
	// 		ymax : 90
	// 	}
	// 	this.scale = 1.0;
	// 	this.sourceName = sourceName;
	// 	this.type = GeoBeans.Layer.TileLayer.Type.PGIS;
	// 	// this.scale = (this.extent.ymax - this.extent.ymin)/this.IMG_HEIGHT;
	// },


	initialize : function(name,url,extent){
		GeoBeans.Layer.TileLayer.prototype.initialize.apply(this, arguments);

		// if(extent != null){
		// 	this.FULL_EXTENT = {
		// 		xmin : extent.xmin,
		// 		ymin : extent.ymin,
		// 		xmax : extent.xmax,
		// 		ymax : extent.ymax
		// 	}			
		// }else{
		// 	this.FULL_EXTENT = {
		// 		xmin : -180,
		// 		ymin : -90,
		// 		xmax : 180,
		// 		ymax : 90
		// 	}
		// }
		// this.FULL_EXTENT = {
		// 	xmin : -180,
		// 	ymin : -90,
		// 	xmax : 180,
		// 	ymax : 90
		// }
		if(extent != null){
			this.validExtent = extent;
		}
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
		this.loadingTiles(this.map.drawBaseLayerCallback);
	},


	preDraw : function(){

		var level = this.map.level;
		var maxLevel = this.getMaxLevel();
		var minLevel = this.getMinLevel();
		if(level > maxLevel || level < minLevel){
			this.tiles = [];
			this.renderer.clearRect();
			this.snap = null;
			return;
		}

		this.renderer.clearRect();
		var tbound = this.computeTileBound();
		this.updateTileCache(tbound);

		var row_min = tbound.rmin;
		var row_max = tbound.rmax;
		var col_min = tbound.cmin;
		var col_max = tbound.cmax;
		// console.log('row:' + row_min + "," + row_max 
		// 	+ ";col:" + col_min + "," + col_max);

		// 计算位置

		var llpt = this.map.getMapViewer()
			.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
		llpt.x = Math.floor(llpt.x+0.5);
		llpt.y = Math.floor(llpt.y+0.5);
		// var img_size = this.IMG_WIDTH * this.scale;

		var img_size = this.IMG_WIDTH * (this.imageScale);
		var resolution = this.map.getMapViewer().getResolution();
		var re = this.getResolutionByZoom(this.map.level);
		if(resolution != re){
			img_size = this.IMG_WIDTH * (this.imageScale) * re/resolution;
		}
		// var img_size = this.IMG_WIDTH * (this.imageScale);


		var x, y;
		var lspt = this.map.getMapViewer().toMapPoint(llpt.x,llpt.y);
		var row, col, tile;
		this.tiles = [];
		var level = this.map.level;
		// y = llpt.y - (row_min+1) * img_size;
		// y = llpt.y - row_min * img_size;
		y = llpt.y + row_min * img_size;
		for(row=row_min; row<=row_max; row++){
			x = llpt.x + col_min * img_size;
			for(col=col_min; col<=col_max; col++){
				tid = this.getTileID(row, col, level);
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

	/**
	 * 有效view指落在FULL_EXTENT范围内的view
	 **/
	getValidView : function(){
		
		var viewer = this.map.getViewer();
		var xmin = null, ymin = null, xmax = null, ymax = null;
		if(this.validExtent != null){
			xmin = Math.max(viewer.xmin, this.validExtent.xmin);
			ymin = Math.max(viewer.ymin, this.validExtent.ymin);
			xmax = Math.min(viewer.xmax, this.validExtent.xmax);
			ymax = Math.min(viewer.ymax, this.validExtent.ymax);
		}else{
			xmin = Math.max(viewer.xmin, this.FULL_EXTENT.xmin);
			ymin = Math.max(viewer.ymin, this.FULL_EXTENT.ymin);
			xmax = Math.min(viewer.xmax, this.FULL_EXTENT.xmax);
			ymax = Math.min(viewer.ymax, this.FULL_EXTENT.ymax);
		}	
		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
		
	},

	computeTileBound : function(){
		var map = this.map;
		var level = map.level;
		// var resolution = map.resolution;
		var resolution = this.getResolutionByZoom(level)
		var tile_map_size = resolution * this.IMG_WIDTH;
		console.log(tile_map_size);
		var ve = this.getValidView();
		console.log(ve);
		
		var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_map_size);
		var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_map_size);
		var row_min = Math.floor ((this.FULL_EXTENT.ymax - ve.ymax) / tile_map_size);
		var row_max = Math.ceil((this.FULL_EXTENT.ymax - ve.ymin) / tile_map_size);

		// console.log(col_min + "," + col_max + "," + row_min + "," + row_max);
		
		
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
		for(row=row_min; row<=row_max; row++){
			for(col=col_min; col<=col_max; col++){
				tid = this.getTileID(row,col,level);
				turl = this.url  + tid;
				// console.log(turl);
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(this.map,turl, this, row, col, level, 0, 0);
					this.cache.putTile(tile);
				}
			}
		}	
	},

	// getTileID : function(row, col, level){
	// 	var str = "?SERVICE=dbs&REQUEST=GetTile&VERSION=1.0.0&LAYER="
	// 			+ this.typeName + "&STYLE=Default&FORMAT=" + this.format
	// 			+ "&TILEMATRIXSET=" + this.tms + "&TILEMATRIX=" + this.tms 
	// 			+ ":" + level + "&TILEROW=" + row + "&TILECOL=" + col
	// 			+ "&sourceName=" + this.sourceName;				
	// 	return str;
	// },

	getTileID : function(row,col,level){
		var str = "?Service=getImage&Type=RGB&ZoomOffset=0&Col="
		+ col + "&Row=" + row + "&Zoom=" + level + "&V=1.0.0";
		return str;
	},

	// getUrl : function(){
	// 	return "SERVICE=dbs&REQUEST=GetTile&VERSION=1.0.0&LAYER="
	// 			+ this.typeName + "&STYLE=Default&FORMAT=" + this.format
	// 			+ "&TILEMATRIXSET=" + this.tms + "&TILEMATRIX=" 
	// 			+ this.tms +"&extent=" + this.extent.toString();
	// },

	getUrl : function(){
		return "typeName:" + this.typeName + ";format:" + this.format + ";tms:" + this.tms
			+ ";extent:" + this.extent.toString() + ";sourceName:" + this.sourceName
			+ ";url:" + this.url + ";startLevel:" + this.MIN_ZOOM_LEVEL + ";endLevel:" + this.MAX_ZOOM_LEVEL;
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
				this.flag = GeoBeans.Layer.Flag.READY;
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
		this.flag = GeoBeans.Layer.Flag.LOADED;
		drawBaseLayerCallback(this.map);
		
	},

	// 获得每一个
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
		tile.layer.flag = GeoBeans.Layer.Flag.LOADED;
		drawBaseLayerCallback(tile.map);
	},

});