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



	initialize : function(name,url,extent){
		GeoBeans.Layer.TileLayer.prototype.initialize.apply(this, arguments);

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
		this.loadingTiles();
	},


	preDraw : function(){

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

		// 计算位置

		var llpt = viewer.toScreenPoint(this.FULL_EXTENT.xmin, this.FULL_EXTENT.ymax);
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
		var lspt = viewer.toMapPoint(llpt.x,llpt.y);
		var row, col, tile;
		this.tiles = [];
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
		var extent = viewer.getExtent();

		var xmin = null, ymin = null, xmax = null, ymax = null;

		if(this.validExtent != null){
			xmin = Math.max(extent.xmin, this.validExtent.xmin);
			ymin = Math.max(extent.ymin, this.validExtent.ymin);
			xmax = Math.min(extent.xmax, this.validExtent.xmax);
			ymax = Math.min(extent.ymax, this.validExtent.ymax);
		}else{
			xmin = Math.max(extent.xmin, this.FULL_EXTENT.xmin);
			ymin = Math.max(extent.ymin, this.FULL_EXTENT.ymin);
			xmax = Math.min(extent.xmax, this.FULL_EXTENT.xmax);
			ymax = Math.min(extent.ymax, this.FULL_EXTENT.ymax);
		}	
		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
		
	},

	computeTileBound : function(){
		var map = this.map;
		var viewer = map.getViewer();
		var zoom = viewer.getZoom();

		var resolution = this.getResolutionByZoom(zoom);
		var tile_map_size = resolution * this.IMG_WIDTH;
		var ve = this.getValidView();
		
		var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_map_size);
		var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_map_size);
		var row_min = Math.floor ((this.FULL_EXTENT.ymax - ve.ymax) / tile_map_size);
		var row_max = Math.ceil((this.FULL_EXTENT.ymax - ve.ymin) / tile_map_size);

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
		var viewer = this.map.getViewer();
		var zoom = viewer.getZoom();
		for(row=row_min; row<=row_max; row++){
			for(col=col_min; col<=col_max; col++){
				tid = this.getTileID(row,col,zoom);
				turl = this.url  + tid;
				
				if(this.cache.getTile(turl)==null){
					tile = new GeoBeans.Tile(this.map,turl, this, row, col, zoom, 0, 0);
					this.cache.putTile(tile);
				}
			}
		}	
	},


	getTileID : function(row,col,zoom){
		var str = "?Service=getImage&Type=RGB&ZoomOffset=0&Col="
		+ col + "&Row=" + row + "&Zoom=" + zoom + "&V=1.0.0";
		return str;
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
	}
});