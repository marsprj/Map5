GeoBeans.Symbolizer.LineSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	stroke 	: null,
	fill 	: null,
	symbol 	: null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Line;
		this.stroke = new GeoBeans.Stroke();
		this.fill = new GeoBeans.Fill();
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.LineSymbolizer();
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}else{
			clone.stroke = null;
		}

		if(this.fill != null){
			clone.fill = this.fill.clone();
		}else{
			clone.fill = null;
		}

		if(this.symbol != null){
			clone.symbol = this.symbol.clone();
		}
		return clone;
	}
});