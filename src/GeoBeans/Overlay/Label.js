GeoBeans.Overlay.Label = GeoBeans.Class(GeoBeans.Overlay,{
	type : GeoBeans.Overlay.Type.LABEL,
	label : null,
	text : null,
	initialize : function(id,geometry,symbolizer,text){
		GeoBeans.Overlay.prototype.initialize.apply(this, arguments);	
		this.text = text;
		if(this.symbolizer != null){
			this.symbolizer.labelText = this.text;
		}

		var label = new GeoBeans.PointLabel();
		label.geometry = this.geometry;
		label.textSymbolizer = this.symbolizer;
		label.text = this.text;
		this.label = label;
	}
});