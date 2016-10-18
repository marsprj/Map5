/**
 * @classdesc
 * Map5的数据类。
 * @class
 */
GeoBeans.Source = GeoBeans.Class({
	
	_srs : GeoBeans.Proj.WGS84,

	initialize : function(options){
		
	},

	destroy : function(){
		
	},
});

/**
 * 获得数据源的投影信息
 * @return {GeoBeans.Proj} 数据源的投影信息
 * @public
 */
GeoBeans.Source.prototype.getSRS = function(){
	return this._srs;
}

/**
 * 获得数据源的空间范围
 * @return {GeoBeans.Envelope} 数据源的空间范围
 * @public
 * @description 数据源的空间范围依赖其投影，如果没有设置投影，则返回无效的范围。
 */
GeoBeans.Source.prototype.getExtent = function(){
	if(isValid(this._srs)){
		return this._srs.EXTENT;
	}
	else{
		return (new GeoBeans.Envelope());
	}
}