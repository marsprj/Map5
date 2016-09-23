/**
 * @classdesc
 * 线几何对象样式类。
 * 定义线的渲染样式，包括颜色、线型、宽度等。
 * @class
 * @extends {GeoBeans.Symbolizer}
 * @param {GeoBeans.Style.Stroke} stroke 线样式
 * @param {GeoBeans.Style.Fill} fill 填充样式
 * @param {GeoBeans.Style.Symbol} symbol 符号
 */
GeoBeans.Symbolizer.LineSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	stroke 	: null,
	fill 	: null,
	symbol 	: null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Line;
		this.stroke = new GeoBeans.Style.Stroke();
		this.fill = new GeoBeans.Style.Fill();
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
