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
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.TextSymbolizer();
		if(this.fill != null){
			clone.fill = this.fill.clone();
		}
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}
		
		clone.rotation = this.rotation;
		clone.rotationProp = this.rotationProp;
		if(this.font != null){
			clone.font = this.font.clone();
		}
		
		clone.labelText = this.labelText;
		clone.labelProp = this.labelProp;
		return clone;
	}
});