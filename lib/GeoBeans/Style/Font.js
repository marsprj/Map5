GeoBeans.Font = GeoBeans.Class({
	family 	: null,
	style 	: null,
	weight 	: null,
	size 	: null,

	initialize : function(){

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

GeoBeans.Font.StyleType = {
	Normal : "normal",
	Italic : "italic",
	Oblique: "oblique"
};

GeoBeans.Font.WeightType = {
	Normal 	: "normal",
	Bold 	: "bold"
};