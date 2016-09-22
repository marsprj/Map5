/**
 * @classdesc
 * 距离缓冲去空间查询过滤器
 * @class
 * @extends {GeoBeans.Filter.SpatialFilter}
 */
GeoBeans.Filter.DistanceBufferFilter = GeoBeans.Class(GeoBeans.SpatialFilter,{
	distance : null,

	initialize : function(propName,geometry,distance){
		GeoBeans.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.SpatialFilter.OperatorType.SpOprDWithin;

		this.propName = propName;
		this.geometry = geometry;
		this.distance = distance;
	}

});