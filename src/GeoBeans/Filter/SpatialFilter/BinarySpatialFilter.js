GeoBeans.BinarySpatialFilter = GeoBeans.Class(GeoBeans.SpatialFilter,{
	operator : null,
	propName : null,
	geometry : null,

	initialize : function(operator,propName,geometry){
		GeoBeans.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = operator;
		this.propName = propName;
		this.geometry = geometry;
	},

});