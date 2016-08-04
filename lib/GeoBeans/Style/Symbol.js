GeoBeans.Symbol = GeoBeans.Class({
	
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

	initialize : function(name,icon){
		this.name = name;
		this.icon = icon;
	},

	clone : function(){
		var clone = new GeoBeans.Symbol();
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
		return clone;
	}
});