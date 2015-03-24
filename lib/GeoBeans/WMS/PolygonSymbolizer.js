GeoBeans.Symbolizer.PolygonSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill : null,
	stroke : null,
	geomName : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Polygon;
	}	
});