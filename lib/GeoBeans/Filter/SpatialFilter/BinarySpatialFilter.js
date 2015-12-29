GeoBeans.BinarySpatialFilter = GeoBeans.Class(GeoBeans.SpatialFilter,{
	propName : null,
	envelope : null,
	unitType : null,

	initialize : function(){
		GeoBeans.SpatialFitler.prototype.initialize.apply(this,arguments);
	},
});