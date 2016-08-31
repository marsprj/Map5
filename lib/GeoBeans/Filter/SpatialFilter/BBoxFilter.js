GeoBeans.BBoxFilter = GeoBeans.Class(GeoBeans.SpatialFilter,{
	// propExpression 	: null,
	extent 		: null,

	initialize : function(propName,extent){
		GeoBeans.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.SpatialFilter.OperatorType.SpOprBBox;


		this.propName = propName;
		// this.propExpression = prop;
		this.extent = extent;
	},

	setExtent : function(xmin,ymin,xmax,ymax){
		var extent = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		this.extent = extent;
	}
});