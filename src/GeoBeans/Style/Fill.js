/**
 * @classdesc
 * 定义填充演示，包括颜色，透明度等。
 * @class
 * @param {GeoBeans.Color} color 颜色
 * @param {double} opacity 透明度
 */
GeoBeans.Style.Fill = GeoBeans.Class({
	color : null,
	// opacity : null

	initialize : function(){
		this.color = new GeoBeans.Color();
	},

	getRgba : function(){
		return this.color.getRgba();
	},

	getOpacity : function(){
		return this.color.getOpacity();
	},

	getRgb : function(){
		return this.color.getRgb();
	},

	clone : function(){
		var clone = new GeoBeans.Style.Fill();
		if(this.color != null){
			clone.color = this.color.clone();
		}
		return clone;
	}
});
