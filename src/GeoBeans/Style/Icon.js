/**
 * @classdesc
 * 定义填充演示，包括颜色，透明度等。
 * @class
 * @param {GeoBeans.Color} color 颜色
 * @param {double} opacity 透明度
 */
GeoBeans.Style.Icon = GeoBeans.Class({
	url : null,
	offset_x : 0,
	offset_y : 0,
	anchor_x : 0,
	anchor_y : 0,
	roataion : 0.0,
	scale	 : 1.0,

	initialize : function(options){
		if(isValid(options.url)){
			this.url = options.url;
		}
		if(isValid(options.offsetX)){
			this.offset_x = options.offsetX;
		}
		if(isValid(options.offsetY)){
			this.offset_y = options.offsetY;
		}
		if(isValid(options.anchorX)){
			this.anchor_x = options.anchorX;
		}
		if(isValid(options.anchorY)){
			this.anchor_y = options.anchorY;
		}
		if(isValid(options.roataion)){
			this.roataion = options.roataion;
		}
		if(isValid(options.anchorY)){
			this.scale = options.scale;
		}
	},

	clone : function(){
		var clone = new GeoBeans.Style.Icon();
		clone.url = this.url;
		clone.offset_x = this.offset_x;
		clone.offset_y = this.offset_y;
		clone.anchor_x = this.anchor_x;
		clone.anchor_y = this.anchor_y;
		clone.roataion = this.roataion;
		return clone;
	}
});
