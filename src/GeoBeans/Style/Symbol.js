/**
 * @classdesc
 * 符号样式。
 * @class
 * @param {string} 	   name	名称
 * @param {GeoBeans.Color} color  颜色
 * @param {string} icon 图标url地址
 * @param {double} width 图标宽度
 * @param {double} height 图标高度
 * @param {double} offsetX x方向偏移量
 * @param {double} offsetY y方向偏移量
 * @param {double} scale   缩放比例
 * @param {double} rotate  旋转角度
 */
GeoBeans.Style.Symbol = GeoBeans.Class({
	
	name : null,

	// 地址
	icon : null,

	// 图标高度
	icon_height : null,

	// 图标宽度
	icon_width : null,

	// 偏移
	icon_offset_x : null,

	icon_offset_y : null,


	scale : null,

	rotate : null,

	initialize : function(name,icon){
		this.name = name;
		this.icon = icon;
	},

	clone : function(){
		var clone = new GeoBeans.Style.Symbol();
		if(this.name != null){
			clone.name = this.name;
		}
		if(this.icon != null){
			clone.icon = this.icon;
		}

		if(this.icon_height != null){
			clone.icon_height = this.icon_height;
		}

		if(this.icon_width != null){
			clone.icon_width = this.icon_width;
		}

		if(this.icon_offset_x != null){
			clone.icon_offset_x = this.icon_offset_x;
		}

		if(this.icon_offset_y != null){
			clone.icon_offset_y = this.icon_offset_y;
		}

		if(this.scale != null){
			clone.scale = this.scale;
		}

		if(this.rotate != null){
			clone.rotate = this.rotate;
		}
		return clone;
	}
});
