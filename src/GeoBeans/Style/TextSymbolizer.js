/**
 * @classdesc
 * 文本对象样式类。
 * 定义线的渲染样式，包括颜色、线型、宽度等。
 * @class
 * @extends {GeoBeans.Symbolizer}
 * @param {GeoBeans.Style.Stroke}	stroke	边界线样式
 * @param {GeoBeans.Style.Fill}		fill	填充样式
 * @param {GeoBeans.Style.Symbol}	symbol	符号
 * @param {GeoBeans.Style.Font}		font	字体
 * @param {string} 			rotation	旋转角
 * @param {string} 			rotationField	旋转字段
 * @param {string} 			labelText	标注文字
 * @param {string} 			rotationProp	标注文字字段
 * @param {double} anchorX x方向旋转锚点
 * @param {double} anchorY y方向旋转锚点
 * @param {double} displaceX x方向偏移量
 * @param {double} displaceY y方向偏移量
 */
GeoBeans.Symbolizer.TextSymbolizer = GeoBeans.Class(GeoBeans.Symbolizer,{
	fill 		: null,
	stroke 		: null,
	rotation 	: null,
	rotationProp: null,
	font 		: null,

	bgFill 		: null,
	bgStroke 	: null,

	labelText 	: null,
	labelProp 	: null,

	anchorX 	: 0,
	anchorY 	: 0.0,
	displaceX 	: 0,
	displaceY 	: 0,

	initialize : function(){
		GeoBeans.Symbolizer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Symbolizer.Type.Text;

		this.fill = new GeoBeans.Style.Fill();
		this.stroke = new GeoBeans.Style.Stroke();
		this.font = new GeoBeans.Style.Font();
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
		}else{
			clone.fill = null;
		}
		if(this.stroke != null){
			clone.stroke = this.stroke.clone();
		}else{
			clone.stroke = null;
		}
		
		clone.rotation = this.rotation;
		clone.rotationProp = this.rotationProp;
		if(this.font != null){
			clone.font = this.font.clone();
		}else{
			 clone.font = null;
		}
		
		clone.labelText = this.labelText;
		clone.labelProp = this.labelProp;

		clone.displaceX = this.displaceX;
		clone.displaceY = this.displaceY;

		clone.anchorX = this.anchorX;
		clone.anchorY = this.anchorY;

		return clone;
	}
});
