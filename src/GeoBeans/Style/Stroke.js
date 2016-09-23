/**
 * @classdesc
 * 线样式。
 * 定义线的渲染样式，包括颜色、线型、宽度等。
 * @class
 * @param {GeoBeans.Color} color  颜色
 * @param {double} width 线宽
 * @param {GeoBeans.Style.Stroke.LineCapType} lineCap 线端点样式
 * @param {GeoBeans.Style.Stroke.LineJoinType} lineCap 线连接点样式
 * @param {Array} dashOffset 虚线模式定义
 */
GeoBeans.Style.Stroke = GeoBeans.Class({
	color 		: null,
	width 		: null,
	lineCap 	: null,
	lineJoin 	: null,
	dashOffset 	: null,

	initialize : function(){
		this.color = new GeoBeans.Color();
		this.width = 2;
		this.lineCap = GeoBeans.Style.Stroke.LineCapType.RoundCap;
		this.lineJoin = GeoBeans.Style.Stroke.LineJoinType.RoundJoin;
	},

	getRgba : function(){
		return this.color.getRgba();
	},

	getRgb : function(){
		return this.color.getRgb();
	},

	getOpacity : function(){
		return this.color.getOpacity();
	},

	clone : function(){
		var clone = new GeoBeans.Style.Stroke();
		if(this.color != null){
			clone.color = this.color.clone();
		}
		clone.width = this.width;
		clone.lineCap = this.lineCap;
		clone.lineJoin = this.lineJoin;
		clone.dashOffset = this.dashOffset;
		return clone;
	}


});

GeoBeans.Style.Stroke.LineCapType = {
	ButtCap 	: "butt",
	SquareCap 	: "square",
	RoundCap 	: "round",
	LineCapMax	: "max"
};

GeoBeans.Style.Stroke.LineJoinType = {
	MiterJoin 		: "miter",
	MiterRevertJoin	: "miterRevert",
	RoundJoin 		: "round",
	BevelJoin		: "bevel",
	LineJoinMax 	: "max"
};
