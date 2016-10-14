/**
 * @classdesc
 * Raster类。
 * @class
 */
GeoBeans.Raster = GeoBeans.Class({

	_image	: null,
	_width	: 0,
	_height : 0,
	extent	: null,

	/**
	 * new GeoBeans.Source.Raster.WMS({
	 * 		"url" : 'http://..',
	 * 		"version" : "1.3.0",
	 * 		"layers"  : ["cities","rivers","country"],
	 * 		"styles"  : ["point" ,"line",  "polygon"],
	 * 		"format"  : "image/png",
	 * 		"srs"	  : "EPSG:4326",
	 * 		"transparent": true
	 * })
	 */
	initialize : function(options){
		this._image = options.image;
		this.extent = options.extent;
	},

	destroy : function(){
	}
});

/**
 * 获得Raster的空间范围
 * @return {GeoBeans.Envelope} 空间范围
 */
GeoBeans.Raster.prototype.getExtent = function(){
	return this.extent;
}

/**
 * 获得Raster的Image数据
 * @return {Image} Raster的Image数据
 */
GeoBeans.Raster.prototype.getImage = function(){
	return this._image;
}

/**
 * 获取Raster的宽度
 * @public
 * @return {integer}  宽度
 */
GeoBeans.Raster.prototype.getWidth = function(){
	return this._image.width;
}

/**
 * 获取Raster的高度
 * @public
 * @return {integer}  高度
 */
GeoBeans.Raster.prototype.getHeight = function(){
	return this._image.height;
}