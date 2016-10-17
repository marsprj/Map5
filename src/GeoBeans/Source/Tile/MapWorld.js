/**
 * @classdesc
 * 天地图地图服务数据源。
 * @class
 * @extends {GeoBeans.Source.Raster}
 */
GeoBeans.Source.Tile.MapWorld = GeoBeans.Class(GeoBeans.Source.Tile,{

	_url : "http://t4.tianditu.com/DataServer?T=vec_c&x=3&y=1&l=2",	
	_imageSet : "vec_c",

	_TID : "T={T}&x={col}&y={row}&l={zoom}",

	/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
    SRS : GeoBeans.SrsType.WGS84,
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 19,	
	
	FULL_EXTENT : {
				xmin:-180.0,
				ymin:- 90.0,
				xmax: 180.0,
				ymax:  90.0
	},
    
	RESOLUTIONS : [			
				0.703125,	/*1*/
				0.3515625,
				0.17578125,
				0.087890625,
				0.0439453125,
				0.02197265625,
				0.010986328125,
				0.0054931640625,
				0.00274658203125,
				0.00137329101562,
				0.000686645507812,
				0.000343322753906,
				0.000171661376953,
				0.0000858306884766,
				0.0000429153442383,
				0.0000214576721191,
				0.0000107288360596,
				0.00000536441802979],

				
	resolution : 1,
	rows : 0,
	cols : 0,
	/**
	 * 设置的中心点有可能在Tile中间
	 **/
	offset_x : 0.0,
	offset_y : 0.0,
	
	lrow : 0,
	urow : 0,
	lcol : 0,
	rcol : 0,	

	CLASS_NAME : "GeoBeans.Source.Tile.MapWorld",

	/**
	 * new GeoBeans.Source.Tile.MapWorld({
	 * 		"url" : '/MapWorld/maprequest?services=world_image'
	 * })
	 */
	initialize : function(options){
		GeoBeans.Source.Tile.prototype.initialize.apply(this, arguments);
		
		this._url = options.url;
		this._imageSet = options.imageSet;
	},

	destroy : function(){
		GeoBeans.Source.Tile.prototype.destroy.apply(this, arguments);
	},
});

GeoBeans.Source.Tile.MapWorld.prototype.getResolution = function(zoom){
	if( zoom<=0 || zoom>=this.RESOLUTIONS.length){
		return -1;
	}
	return this.RESOLUTIONS[zoom-1]; 
}

/**
 * 根据resolution，计算最接近的zoom
 * @param  {float} resolution  分辨率
 * @return {integer}            zoom
 * @public
 */
GeoBeans.Source.Tile.MapWorld.prototype.getFitZoom = function(resolution){
	var length = this.RESOLUTIONS.length;
	if(resolution > this.RESOLUTIONS[0]){
		return 1;
	}
	else if(resolution < this.RESOLUTIONS[length-1]){
		return length;
	}
	else{
		var b,u;
		for(i=1; i<length; i++){
			u = this.RESOLUTIONS[i-1];
			b = this.RESOLUTIONS[i];

			/*
			 * 1) resolution的两层之间，说明这两层可能时最合适的层。
			 * 2) 判断resolution与上下两层的距离，较近的一层为目标层。
			 */ 
			if((resolution>=b) && (resolution<=u)){
				var d_b = Math.abs(resolution - b);
				var d_u = Math.abs(resolution - u);

				var zoom = d_u < d_b ? i : i+1;
				return zoom;
			}
		}
	}
}


/**
 * computeTileBound
 * @return {GeoBeans.Envelope} tileCompand
 * @protected
 * @override
 */
GeoBeans.Source.Tile.MapWorld.prototype.computeTileBound = function(extent, tile_size){
	var ve = this.getValidView(extent);
	
	var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_size);
	var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_size);
	var row_min = Math.floor((this.FULL_EXTENT.ymax - ve.ymax) / tile_size);
	var row_max = Math.ceil ((this.FULL_EXTENT.ymax - ve.ymin) / tile_size);
	
	// return {
	// 	rmin : row_min - 1 < 0 ? 0 : row_min - 1,
	// 	rmax : row_max + 1 < 0 ? 0 : row_max + 1,
	// 	cmin : col_min - 1 < 0 ? 0 : col_min - 1,
	// 	cmax : col_max + 1 < 0 ? 0 : col_max + 1
	// };

	return {
		rmin : row_min - 1,
		rmax : row_max + 1,
		cmin : col_min - 1,
		cmax : col_max + 1
	};
}

/**
 * 生成tile的ID
 * @param  {integer} row  行
 * @param  {integer} col  列
 * @param  {integer} zoom 层
 * @return {Tile}      	  tile对象
 * @protected
 * @override
 */
GeoBeans.Source.Tile.MapWorld.prototype.makeTileID = function(row, col, zoom){
	return this._TID.replace("{T}"		,this._imageSet)
					.replace("{col}"	,col)
					.replace("{row}"	,row)
					.replace("{zoom}"	,zoom);
}

/**
 * 生成tile的URL
 * @param  {string} url  
 * @param  {string} tid
 * @return {string} tile url
 * @protected
 * @override
 */
GeoBeans.Source.Tile.MapWorld.prototype.makeTileURL = function(url,tid){

	var turl = "";
	var length = url.length;
	if(url[length-1] == "?"){
		turl = url + tid;
	}
	else{
		turl = url + "?" + tid;
	}
	return turl;
}

GeoBeans.Source.Tile.MapWorld.prototype.getTilePosisiton = function(row, col, tile_size){
	
	var x = this.FULL_EXTENT.xmin + col * tile_size;
	var y = this.FULL_EXTENT.ymax - row * tile_size;

	return {
		"x" : x,
		"y" : y,
 	}
}

GeoBeans.Source.Tile.MapWorld.prototype.getRows = function(zoom){
	return Math.pow(2,(zoom-1));
}

GeoBeans.Source.Tile.MapWorld.prototype.getCols = function(zoom){
	return Math.pow(2,(zoom));
}
