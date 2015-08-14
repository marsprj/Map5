GeoBeans.Symbolizer.PointSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	size : null,
	fill : null,
	stroke : null,
	icon_url : null,
	icon_offset_x : null,
	icon_offset_y : null,

	// 符号名称
	symbol : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Point;
		this.fill = new GeoBeans.Fill();
		this.stroke = new GeoBeans.Stroke();
		this.size = 3;
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
		if(this.symbol != null){
			clone.symbol = this.symbol.clone();
		}
		return clone;
	}
});