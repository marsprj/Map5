GeoBeans.BBoxFilter = GeoBeans.Class(GeoBeans.SpatialFilter,{
	propName 	: null,
	extent 		: null,

	initialize : function(){
		GeoBeans.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.SpatialFilter.OperatorType.SpOprBBox;
	},

	setExtent : function(xmin,ymin,xmax,ymax){

	}
});