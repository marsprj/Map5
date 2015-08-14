GeoBeans.Symbolizer.LineSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	stroke : null,
	symbol : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Line;
		this.stroke = new GeoBeans.Stroke();
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.LineSymbolizer();
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}
		if(this.symbol != null){
			clone.symbol = this.symbol.clone();
		}
		return clone;
	}
});