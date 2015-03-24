GeoBeans.Symbolizer.TextSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill 		: null,
	stroke 		: null,
	rotation 	: null,
	rotationProp: null,
	font 		: null,

	labelText 	: null,
	labelProp 	: null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Text;
	}	
});