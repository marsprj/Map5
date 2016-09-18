GeoBeans.DistanceBufferFilter = GeoBeans.Class(GeoBeans.Class,{
	propName : null,
	distance : null,


	initialize : function(){
		//GeoBeans.SpatialFitler.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.SpatilalFilter.OperatorType.SpOprIntersects;
	}
});


GeoBeans.UnitType = {
	Inches 		: "inches",
	Points 		: "points",
	feet 		: "feet",
	yards 		: "yards",
	miles 		: "miles",
	naticalMiles: "naticalmiles"
};