/**
 * @classdesc
 * 字体类
 * @class
 * @param {string} family 字体
 * @param {GeoBeans.Style.Font.StyleType} style 样式
 * @param {GeoBeans.Style.Font.WeightType} weight 是否加粗
 * @param {double} size 大小
 */
GeoBeans.Style.Font = GeoBeans.Class({
	family 	: null,
	style 	: null,
	weight 	: null,
	size 	: null,

	initialize : function(){
		this.family = "Times New Roman";
		this.style = GeoBeans.Style.Font.StyleType.Normal;
		this.weight = GeoBeans.Style.Font.WeightType.Normal;
		this.size = 12;
	},

	clone : function(){
		var clone = new GeoBeans.Style.Font();
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
GeoBeans.Style.Font.StyleType = {
	Normal : "normal",
	Italic : "italic",
	Oblique: "oblique"
};

GeoBeans.Style.Font.WeightType = {
	Normal 	: "normal",
	Bold 	: "bold"
};
