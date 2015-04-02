GeoBeans.SpatialFilter = GeoBeans.Class(GeoBeans.Filter,{
	operator : null,

	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterSpatial;
	}

});

GeoBeans.SpatialFilter.OperatorType = {
	SpOprIntersects 	: "intersects",
	SpOprDWithin 		: "dwithin",
	SpOprEquals 		: "equals",
	SpOprDisjoint 		: "disjoint",
	SpOprTouchs 		: "touchs",
	SpOprCrosses 		: "crosses",
	SpOprByond 			: "byond",
	SpOprContains 		: "contains",
	SpOprOverlaps 		: "overlaps",
	SpOprBBox 			: "bbox"
};