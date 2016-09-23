/**
 * @classdesc
 * 多边形几何对象样式类。
 * 定义线的渲染样式，包括颜色、线型、宽度等。
 * @class
 * @extends {GeoBeans.Symbolizer}
 * @param {GeoBeans.Style.Stroke} stroke 边界线样式
 * @param {GeoBeans.Style.Fill} fill 填充样式
 * @param {GeoBeans.Style.Symbol} symbol 符号
 */
GeoBeans.Symbolizer.PolygonSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill : null,
	stroke : null,
	geomName : null,	//？？？这个参数干什么？
	symbol : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Polygon;
		this.fill = new GeoBeans.Fill();
		this.stroke = new GeoBeans.Stroke();
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.PolygonSymbolizer();
		if(this.fill != null){
			clone.fill = this.fill.clone();
		}else{
			clone.fill = null;
		}
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}else{
			clone.stroke = null;
		}
		if(this.symbol != null){
			clone.symbol = this.symbol.clone();
		}else{
			clone.symbol = null;
		}
		
		clone.geomName = this.geomName;
		return clone;
	}
});
