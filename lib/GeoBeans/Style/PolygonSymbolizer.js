GeoBeans.Symbolizer.PolygonSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill : null,
	stroke : null,
	geomName : null,
	symbol : null,

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
		}else{
			clone.fill = null;
		}
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}else{
			clone.stroke = null;
		}
		if(this.symbol != null){
			clone.symbol = this.symbol.clone();
		}else{
			clone.symbol = null;
		}
		
		clone.geomName = this.geomName;
		return clone;
	}
});