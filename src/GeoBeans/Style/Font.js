/**
 * @classdesc
 * 字体类
 * @class
 * @param {string} family 字体
 * @param {GeoBeans.Font.StyleType} style 样式
 * @param {GeoBeans.Font.WeightType} weight 是否加粗
 * @param {double} size 大小
 */
GeoBeans.Style.Font = GeoBeans.Class({
	family 	: null,
	style 	: null,
	weight 	: null,
	size 	: null,

	initialize : function(){
		this.family = "Times New Roman";
		this.style = GeoBeans.Font.StyleType.Normal;
		this.weight = GeoBeans.Font.WeightType.Normal;
		this.size = 12;
	},

	clone : function(){
		var clone = new GeoBeans.Font();
		clone.family = this.family;
		clone.style = this.style;
		clone.weight = this.weight;
		clone.size = this.size;
		return clone;
	}
});

/**
 * [StyleType description]
 * @type {Object}
 */
GeoBeans.Font.StyleType = {
	Normal : "normal",
	Italic : "italic",
	Oblique: "oblique"
};

GeoBeans.Font.WeightType = {
	Normal 	: "normal",
	Bold 	: "bold"
};
