/**
 * @classdesc
 * GeoBeans地图服务数据源。
 *
 *	var source" = new GeoBeans.Source.Tile.QuadServer({
 *		url : "http://127.0.0.1/QuadServer/maprequest", * 
 *	 	imageSet : "world_image"
 *	});
 *		
 * @class
 * @extends {GeoBeans.Source.Tile}
 * @param 	{object} options QuadServer Source options
 * @api stable
 */
GeoBeans.Source.Tile.QuadServer = GeoBeans.Class(GeoBeans.Source.Tile,{

	_url : "/QuadServer/maprequest?services=world_image",
	_imageSet : null,
	_srs : GeoBeans.Proj.WGS84,
	_TID : "services={services}&col={col}&row={row}&level={zoom}",

	/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 2,
	MAX_ZOOM_LEVEL: 17,	

	SRS : GeoBeans.Proj.WGS84,
	//FULL_EXTENT : GeoBeans.Proj.WGS84.EXTENT,
	
	FULL_EXTENT : {
				xmin:-256.0,
				ymin:-256.0,
				xmax: 256.0,
				ymax: 256.0
	},
    
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

	CLASS_NAME : "GeoBeans.Source.Tile.QuadServer",

	/**
	 * new GeoBeans.Source.Tile.QuadServer({
	 * 		"url" : '/QuadServer/maprequest?services=world_image'
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

/**
 * 获得最大Zoom
 * @public
 * @return {integer} 最大Zoom
 */
// GeoBeans.Source.Tile.QuadServer.prototype.getZoomMax = function(){
// 	return 0;
// }

/**
 * 获得最小Zoom
 * @public
 * @return {integer} 最小Zoom
 */
// GeoBeans.Source.Tile.QuadServer.prototype.getZoomMin = function(){
// 	return 0;
// }

/**
 * 获得瓦片
 * @public
 * @param  {integer} 		    zoom    层级
 * @param  {GeoBeans.Envelope}  extent  空间范围
 * @param  {GeoBeans.Handler}   success 成功回调函数
 * @param  {GeoBeans.Handler}   failure 失败回调函数
 */
// GeoBeans.Source.Tile.QuadServer.prototype.getTile = function(zoom, extent, success, failure){
// 	console.log("GeoBeans.Source.Tile.QuadServer.prototype.getTile()");
// }
// 

GeoBeans.Source.Tile.QuadServer.prototype.getResolution = function(zoom){
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
GeoBeans.Source.Tile.QuadServer.prototype.getFitZoom = function(resolution){
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
GeoBeans.Source.Tile.QuadServer.prototype.computeTileBound = function(extent, tile_size){
	var ve = this.getValidView(extent);
	
	var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_size);
	var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_size);
	var row_min = Math.floor((ve.ymin - this.FULL_EXTENT.ymin) / tile_size);
	var row_max = Math.ceil ((ve.ymax - this.FULL_EXTENT.ymin) / tile_size);
	
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
GeoBeans.Source.Tile.QuadServer.prototype.makeTileID = function(row, col, zoom){

	return this._TID.replace("{services}",this._imageSet)
					.replace("{col}"	 ,col)
					.replace("{row}"	 ,row)
					.replace("{zoom}"	 ,zoom);
}

/**
 * 生成tile的URL
 * @param  {string} url  
 * @param  {string} tid
 * @return {string} tile url
 * @protected
 * @override
 */
GeoBeans.Source.Tile.QuadServer.prototype.makeTileURL = function(url,tid){

	var turl = "";
	var length = url.length;
	if(url[length-1] == "?"){
		turl = url + tid;
	}
	else{
		turl = url + "?" + tid;
	}
	return turl;

	return url + "&" + tid;
}

GeoBeans.Source.Tile.QuadServer.prototype.getTilePosisiton = function(row, col, tile_size){
	
	var x = this.FULL_EXTENT.xmin + col     * tile_size;
	var y = this.FULL_EXTENT.ymin + (row+1) * tile_size;

	return {
		"x" : x,
		"y" : y,
 	}
}