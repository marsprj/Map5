GeoBeans.Symbolizer.PolygonSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill : null,
	stroke : null,
	geomName : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Polygon;
		this.fill = new GeoBeans.Fill();
		this.stroke = new GeoBeans.Stroke();
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.PolygonSymbolizer();
		if(this.fill != null){
			clone.fill = this.fill.clone();
		}
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}
		
		clone.geomName = this.geomName;
		return clone;
	}
});