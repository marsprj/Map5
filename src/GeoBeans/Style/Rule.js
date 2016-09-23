/**
 * @classdesc
 * 文本对象样式类。
 * 定义线的渲染样式，包括颜色、线型、宽度等。
 * @class
 * @param {string} 			name	名称
 * @param {GeoBeans.Symbolizer}		symbolizer	样式
 * @param {GeoBeans.Symbolizer.TextSymbolizer}		textSymbolizer	文字标注样式
 * @param {GeoBeans.Filter}		filter		要素的过滤条件
 * @param {double} minScale 最小显示比例尺
 * @param {double} maxScale 最大显示比例尺
 */
GeoBeans.Style.Rule = GeoBeans.Class({
	name : null,
	symbolizer : null,
	textSymbolizer : null,
	filter : null,
	minScale : null,
	maxScale : null,

	initialize : function(name){
		this.name = name;
	},	

	clone : function(){
		var clone = new GeoBeans.Style.Rule();
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
