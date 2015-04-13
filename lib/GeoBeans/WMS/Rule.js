GeoBeans.Rule = GeoBeans.Class({
	name : null,
	symbolizer : null,
	textSymbolizer : null,
	filter : null,
	minScale : null,
	maxScale : null,

	initialize : function(){
		// this.name = name;
	},

	clone : function(){
		var clone = new GeoBeans.Rule();
		clone.name = this.name;
		if(this.symbolizer != null){
			clone.symbolizer = this.symbolizer.clone();
		}
		if(this.textSymbolizer != null){
			clone.textSymbolizer = this.textSymbolizer.clone();
		}
		if(this.filter != null){
			clone.filter = this.filter.clone();
		}
		clone.minScale = this.minScale;
		clone.maxScale = this.maxScale;
		return clone;
	}

});