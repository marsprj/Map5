/**
 * @classdesc
 * 二元空间查询过滤器
 * @class
 * @extends {GeoBeans.Filter.SpatialFilter}
 */
GeoBeans.Filter.BinarySpatialFilter = GeoBeans.Class(GeoBeans.Filter.SpatialFilter,{
	operator : null,
	propName : null,
	geometry : null,

	initialize : function(operator,propName,geometry){
		GeoBeans.Filter.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = operator;
		this.propName = propName;
		this.geometry = geometry;
	},

});