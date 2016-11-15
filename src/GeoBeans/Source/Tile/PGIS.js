GeoBeans.Source.Tile.PGIS = GeoBeans.Class(GeoBeans.Source.Tile,{

	_url : "/PGIS_S_TileMapServerTDT/Maps/vec_tj_tdt/EzMap",


	_srs : GeoBeans.Proj.WGS84,


	IMG_WIDTH 		: 256,
 	IMG_HEIGHT 		: 256,

 	_TID : "col={col}&row={row}&zoom={zoom}",

 	FULL_EXTENT : GeoBeans.Proj.WGS84.EXTENT,

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

	initialize : function(options){
		GeoBeans.Source.Tile.prototype.initialize.apply(this, arguments);
		

		this._srs = options.srs;
		if(isValid(options.srs)){
			this._srs = options.srs;
			this.FULL_EXTENT = this._srs.EXTENT;
			if(this._srs.SRID != GeoBeans.SrsType.WebMercator){
				this._isWGS84 = true;
			}
		}

		if(isValid(options.url)){
			this._url = options.url;
		}

		// if(isValid(options.extent)){
		// 	this.FULL_EXTENT = options.extent;
		// }
	},

	destroy : function(){
		GeoBeans.Source.Tile.prototype.destroy.apply(this, arguments);
	},
});


GeoBeans.Source.Tile.PGIS.prototype.getResolution = function(zoom){
	if( zoom < this.MIN_ZOOM_LEVEL){
		return this.RESOLUTIONS[0];
	}
	else if(zoom > this.MAX_ZOOM_LEVEL){
		return this.RESOLUTIONS[this.RESOLUTIONS.length-1];
	}
	else{
		return this.RESOLUTIONS[zoom-1]; 	
	}
}

/**
 * 根据resolution，计算最接近的zoom
 * @param  {float} resolution  分辨率
 * @return {integer}            zoom
 * @public
 */
GeoBeans.Source.Tile.PGIS.prototype.getFitZoom = function(resolution){
	var length = this.RESOLUTIONS.length;
	if(resolution > this.RESOLUTIONS[0]){
		return 1;
	}
	else if(resolution < this.RESOLUTIONS[length-1]){
		return length;
	}
	else{
		var b,u;
		for(var i=1; i<length; i++){
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
GeoBeans.Source.Tile.PGIS.prototype.computeTileBound = function(extent, tile_size){
	var ve = this.getValidView(extent);
	
	var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_size);
	var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_size);
	var row_min = Math.floor ((this.FULL_EXTENT.ymax - ve.ymax) / tile_size);
	var row_max = Math.ceil((this.FULL_EXTENT.ymax - ve.ymin) / tile_size);

	return {
		rmin:row_min,
		rmax:row_max,
		cmin:col_min,
		cmax:col_max};
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
GeoBeans.Source.Tile.PGIS.prototype.makeTileID = function(row, col, zoom){
	return this._TID.replace("{col}"	,col)
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
GeoBeans.Source.Tile.PGIS.prototype.makeTileURL = function(url,tid){

	var turl = "";
	var length = url.length;
	if(url[length-1] == "/"){
		turl = url + tid;
	}
	else{
		turl = url + "/" + tid;
	}
	return turl;
}

GeoBeans.Source.Tile.PGIS.prototype.getTilePosisiton = function(row, col, tile_size){
	
	var x = this.FULL_EXTENT.xmin + col     * tile_size;
	var y = this.FULL_EXTENT.ymin + (row+1) * tile_size;

	return {
		"x" : x,
		"y" : y,
 	}
}