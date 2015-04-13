GeoBeans.Symbolizer.PointSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	size : null,
	// opacity : null,
	fill : null,
	stroke : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Point;
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.PointSymbolizer();
		if(this.fill != null){
			clone.fill = this.fill.clone();
		}
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}
		clone.size = this.size;
		return clone;
	}
});