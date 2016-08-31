GeoBeans.SpatialFilter = GeoBeans.Class(GeoBeans.Filter,{


	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterSpatial;
	}

});

GeoBeans.SpatialFilter.OperatorType = {
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