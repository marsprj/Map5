/**
 * @classdesc
 * Tile类型的数据源。<br>
 * <p>管理瓦片类型的数据源。</p>
 * <p>Tile类为虚类，无法实例化。</p>
 * @class
 */
GeoBeans.Source.Tile = GeoBeans.Class(GeoBeans.Source,{

	CLASS_NAME : "GeoBeans.Source.Tile",

	_url : null,

	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 19,	

	FULL_EXTENT : {
				xmin:-256,
				ymin:-256,
				xmax:256,
				ymax:256
	},

	initialize : function(options){
		GeoBeans.Source.prototype.initialize.apply(this, arguments);

		//this._url = options.url;
	},

	destroy : function(){
		GeoBeans.Source.prototype.destroy.apply(this, arguments);
	}
});

/**
 * 获得瓦片
 * @public
 * @param  {integer} 		    zoom    层级
 * @param  {GeoBeans.Envelope}  extent  空间范围
 * @param  {GeoBeans.Handler}   success 成功回调函数
 * @param  {GeoBeans.Handler}   failure 失败回调函数
 */
GeoBeans.Source.Tile.prototype.getTile = function(zoom, extent, success, failure){

	var maxZoom = this.getMaxZoom();
	var minZoom = this.getMinZoom();
	if(zoom > maxZoom || zoom < minZoom){
		return;
	}

	//计算当前Zoom下的分辨率
	var resolution = this.getResolution(zoom);
	//计算当前zoom下的tile的大小
	var tile_size = resolution * this.IMG_WIDTH;
	//给定空间范围extent，计算当前zoom下，包含extent的行列号范围
	var tbound = this.computeTileBound(extent, tile_size);
	
	var row_min = tbound.rmin;
	var row_max = tbound.rmax;
	var col_min = tbound.cmin;
	var col_max = tbound.cmax;
	
	var xmin = this.FULL_EXTENT.xmin;
	var ymin = this.FULL_EXTENT.ymin;

	var row, col, tile, x, y;

	for(row=row_min; row<row_max; row++){
		for(col=col_min; col<col_max; col++){

			tid = this.makeTileID(row, col, zoom);
			turl = this.makeTileURL(this._url, tid);

			console.log(turl);
			
			var pos = this.getTilePosisiton(row, col, tile_size);

			//var tile = new GeoBeans.Tile(null, turl, null, row, col, zoom, pos.x, pos.y, pos.width, pos.height, resolution);
			var tile = new GeoBeans.Tile(null, turl, null, row, col, zoom, pos.x, pos.y, this.IMG_WIDTH, this.IMG_WIDTH, resolution);
			success.execute(tile);
		}
	}	
}
	
/**
 * 获得最大Zoom
 * @public
 * @return {integer} 最大Zoom
 */
GeoBeans.Source.Tile.prototype.getMinZoom = function(){
	return this.MIN_ZOOM_LEVEL;
}

/**
 * 获得最小Zoom
 * @public
 * @return {integer} 最小Zoom
 */
GeoBeans.Source.Tile.prototype.getMaxZoom = function(){
	return this.MAX_ZOOM_LEVEL;
}

/**
 * 设置最小Zoom
 * @public
 * @param {integer} zoom 最小zoom
 */
GeoBeans.Source.Tile.prototype.setMinZoom = function(zoom){
	if(isValid(zoom)){
		this.MIN_ZOOM_LEVEL = zoom;
	}
};

/**
 * 设置最大Zoom
 * @public
 * @param {integer} zoom 最大zoom
 */
GeoBeans.Source.Tile.prototype.setMaxZoom = function(zoom){
	if(isValid(zoom)){
		this.MAX_ZOOM_LEVEL = zoom;
	}
};

/**
 * 获得指定zoom下的分辨率。
 * @param  {integer} zoom zoom
 * @return {float}      分辨率
 * @public
 */
GeoBeans.Source.Tile.prototype.getResolution = function(zoom){
	if( zoom<=0 || zoom>=this.RESOLUTIONS.length){
		return -1;
	}
	return this.RESOLUTIONS[zoom-1]; 
}

/**
 * computeTileBound
 * @return {GeoBeans.Envelope} tileCompand
 * @protected
 */
GeoBeans.Source.Tile.prototype.computeTileBound = function(){

}

/**
 * 有效view指落在FULL_EXTENT范围内的view
 * @param  {GeoBeans.Envelope} extent Viewer.extent
 * @return {GeoBeans.Envelope}        Valid Extent
 */
GeoBeans.Source.Tile.prototype.getValidView = function(extent){
		
	var xmin = Math.max(extent.xmin, this.FULL_EXTENT.xmin);
	var ymin = Math.max(extent.ymin, this.FULL_EXTENT.ymin);
	var xmax = Math.min(extent.xmax, this.FULL_EXTENT.xmax);
	var ymax = Math.min(extent.ymax, this.FULL_EXTENT.ymax);
	
	return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
}

GeoBeans.Source.Tile.prototype.getTilePosisiton = function(row, col, tile_size){

}

/**
 * 生成tile的URL
 * @param  {string} url  
 * @param  {string} tid
 * @return {string} tile url
 * @protected
 */
GeoBeans.Source.Tile.prototype.makeTileURL = function(url,tid){
	return "";
}


/**
 * 生成tile的ID
 * @param  {integer} row  行
 * @param  {integer} col  列
 * @param  {integer} zoom 层
 * @return {string}       tile id
 * @protected
 */
GeoBeans.Source.Tile.prototype.makeTileID = function(row, col, zoom){
	return "";
}

/**
 * 根据resolution，计算最接近的zoom
 * @param  {float} resolution  分辨率
 * @return {integer}            zoom
 * @public
 */
GeoBeans.Source.Tile.prototype.getFitZoom = function(resolution){
	
}

/**
 * 获得指定zoom下的分辨率。
 * @param  {integer} zoom zoom
 * @return {float}      分辨率
 * @deprecated 
 */
GeoBeans.Source.Tile.prototype.getResolutionByZoom = function(zoom){
	if( zoom<=0 || zoom>=this.RESOLUTIONS.length){
		return -1;
	}
	return this.RESOLUTIONS[zoom-1];
}
