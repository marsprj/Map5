GeoBeans.BeyondFilter = GeoBeans.Class(GeoBeans.SpatialFilter,{
	distance : null,


	initialize : function(propName,geometry,distance){
		GeoBeans.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.SpatialFilter.OperatorType.SpOprBeyond;

		this.propName = propName;
		this.geometry = geometry;
		this.distance = distance;
	}
});