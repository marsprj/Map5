/**
 * @classdesc
 * Raster数据源类。
 * @class
 * @extends {GeoBeans.Source}
 */
GeoBeans.Source.Raster = GeoBeans.Class(GeoBeans.Source, {

	CLASS_NAME : "GeoBeans.Source.Raster",

	initialize : function(options){
		GeoBeans.Source.prototype.initialize.apply(this, arguments);
	},

	destroy : function(){
		GeoBeans.Source.prototype.destroy.apply(this, arguments);
	}
});

/**
 * 获得指定范围和大小的Raster
 * @param  {GeoBeans.Envelope}		extent  空间范围
 * @param  {{width:100,height:100}} size    Raster大小
 * @param  {GeoBeans.Handler} 		success 成功回调函数
 * @param  {GeoBeans.Handler} 		failure 失败回调函数
 * @public
 */
GeoBeans.Source.Raster.prototype.getRaster = function(extent, size, success, failure){
	
}