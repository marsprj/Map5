/**
 * @classdesc
 * 点几何对象样式类。
 * 定义线的渲染样式，包括颜色、线型、宽度等。
 * @class
 * @extends {GeoBeans.Symbolizer}
 * @param {GeoBeans.Style.Stroke} stroke 边界线样式
 * @param {GeoBeans.Style.Fill} fill 填充样式
 * @param {GeoBeans.Style.Symbol} symbol 符号
 * @param {string} icon 图标url地址
 * @param {double} offsetX x方向偏移量
 * @param {double} offsetY y方向偏移量
 */
GeoBeans.Symbolizer.PointSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	size : null,
	fill : null,
	stroke : null,
	icon : null,

	// 符号名称
	symbol : null,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Point;
		this.fill = new GeoBeans.Style.Fill();
		this.stroke = new GeoBeans.Style.Stroke();
		this.size = 3;
	},

	clone : function(){
		var clone = new GeoBeans.Symbolizer.PointSymbolizer();
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
		clone.size = this.size;
		if(this.symbol != null){
			clone.symbol = this.symbol.clone();
		}else{
			clone.symbol = null;
		}
		return clone;
	}
});

/**
 * 设置Icon的路径
 * @public
 * @param {string} url icon图片的路径
 */
GeoBeans.Symbolizer.PointSymbolizer.prototype.setIcon = function(url){
	this.icon_url = url;
}

/**
 * 获得Icon的URL
 * @return {stirng} Icon的URL
 */
GeoBeans.Symbolizer.PointSymbolizer.prototype.getIcon = function(){
	return this.icon_url;
}

/**
 * 设置Stroke对象
 * @public
 * @param {GeoBeans.Style.Stroke} stroke stroke对象
 */
GeoBeans.Symbolizer.PointSymbolizer.prototype.setStroke = function(stroke){
	this.stroke = stroke;
}

/**
 * 获得Stroke对象
 * @return {GeoBeans.Style.Stroke} stroke对象
 */
GeoBeans.Symbolizer.PointSymbolizer.prototype.getStroke = function(){
	return this.stroke;
}

/**
 * 设置Fill对象
 * @public
 * @param {GeoBeans.Style.Fill} fill fill
 */
GeoBeans.Symbolizer.PointSymbolizer.prototype.setFill = function(fill){
	this.fill = fill;
}

/**
 * 获得Stroke对象
 * @return {GeoBeans.Style.Fill} fill
 */
GeoBeans.Symbolizer.PointSymbolizer.prototype.getFill = function(){
	return this.fill;
}