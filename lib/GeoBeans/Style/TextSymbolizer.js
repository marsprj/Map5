GeoBeans.Symbolizer.TextSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill 		: null,
	stroke 		: null,
	rotation 	: null,
	rotationProp: null,
	font 		: null,

	labelText 	: null,
	labelProp 	: null,

	anchorX 	: 0,
	anchorY 	: 0.0,
	displaceX 	: 0,
	displaceY 	: 0,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Text;

		this.fill = new GeoBeans.Fill();
		this.stroke = new GeoBeans.Stroke();
		this.font = new GeoBeans.Font();
		// this.labelText = "文字标注";
		this.anchorX = 0;
		this.anchorY = 0;
		this.displaceX = 0;
		this.displaceY = 0;
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