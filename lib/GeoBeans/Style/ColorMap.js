GeoBeans.ColorMap = GeoBeans.Class({
	id 			: null,
	startColor 	: null,
	endColor 	: null,

	initialize : function(id,startColor,endColor,url){
		this.id = id;
		this.startColor = startColor;
		this.endColor = endColor;
		this.url = url;
	}
});