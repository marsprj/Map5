GeoBeans.Stroke = GeoBeans.Class({
	color 		: null,
	width 		: null,
	// opacity 	: null,
	lineCap 	: null,
	lineJoin 	: null,
	dashOffset 	: null,

	initialize : function(){

	},

	getRgba : function(){
		return this.color.getRgba();
	},

	getRgb : function(){
		return this.color.getRgb();
	},

	getOpacity : function(){
		return this.color.getOpacity();
	}


});

GeoBeans.Stroke.LineCapType = {
	ButtCap 	: "butt",
	SquareCap 	: "square",
	RoundCap 	: "round",
	LineCapMax	: "max"
};

GeoBeans.Stroke.LineJoinType = {
	MiterJoin 		: "miter",
	MiterRevertJoin	: "miterRevert",
	RoundJoin 		: "round",
	BevelJoin		: "bevel",
	LineJoinMax 	: "max"
};
