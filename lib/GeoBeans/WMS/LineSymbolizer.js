GeoBeans.Symbolizer.LineSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	stroke : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Line;
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.LineSymbolizer();
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}
		return clone;
	}
});