GeoBeans.Symbolizer.LineSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	stroke : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Line;
	}	
});