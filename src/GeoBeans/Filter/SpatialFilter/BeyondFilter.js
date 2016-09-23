/**
 * @classdesc
 * Beyond空间查询过滤器
 * @class
 * @extends {GeoBeans.Filter.SpatialFilter}
 */
GeoBeans.Filter.BeyondFilter = GeoBeans.Class(GeoBeans.Filter.SpatialFilter,{
	distance : null,


	initialize : function(propName,geometry,distance){
		GeoBeans.Filter.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.SpatialFilter.OperatorType.SpOprBeyond;

		this.propName = propName;
		this.geometry = geometry;
		this.distance = distance;
	}
});