/**
 * @classdesc
 * 矩形空间查询过滤器
 * @class
 * @extends {GeoBeans.Filter.SpatialFilter}
 */
GeoBeans.Filter.BBoxFilter = GeoBeans.Class(GeoBeans.Filter.SpatialFilter,{
	// propExpression 	: null,
	extent 		: null,

	initialize : function(propName,extent){
		GeoBeans.Filter.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.SpatialFilter.OperatorType.SpOprBBox;


		this.propName = propName;
		// this.propExpression = prop;
		this.extent = extent;
	},

	setExtent : function(xmin,ymin,xmax,ymax){
		var extent = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		this.extent = extent;
	}
});