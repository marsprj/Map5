/**
 * @classdesc
 * 空间查询过滤器
 * @class
 * @extends {GeoBeans.Filter}
 */
GeoBeans.Filter.SpatialFilter = GeoBeans.Class(GeoBeans.Filter,{


	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterSpatial;
	}

});

GeoBeans.Filter.SpatialFilter.OperatorType = {
	SpOprIntersects 	: "intersects",
	SpOprDWithin 		: "dwithin",
	SpOprWithin 		: "within",
	SpOprEquals 		: "equals",
	SpOprDisjoint 		: "disjoint",
	SpOprTouches 		: "touches",
	SpOprCrosses 		: "crosses",
	SpOprBeyond 		: "beyond",
	SpOprContains 		: "contains",
	SpOprOverlaps 		: "overlaps",
	SpOprBBox 			: "bbox"
};