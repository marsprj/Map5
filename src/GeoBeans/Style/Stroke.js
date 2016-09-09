GeoBeans.Stroke = GeoBeans.Class({
	color 		: null,
	width 		: null,
	lineCap 	: null,
	lineJoin 	: null,
	dashOffset 	: null,

	initialize : function(){
		this.color = new GeoBeans.Color();
		this.width = 2;
		this.lineCap = GeoBeans.Stroke.LineCapType.RoundCap;
		this.lineJoin = GeoBeans.Stroke.LineJoinType.RoundJoin;
	},

	getRgba : function(){
		return this.color.getRgba();
	},

	getRgb : function(){
		return this.color.getRgb();
	},

	getOpacity : function(){
		return this.color.getOpacity();
	},

	clone : function(){
		var clone = new GeoBeans.Stroke();
		if(this.color != null){
			clone.color = this.color.clone();
		}
		clone.width = this.width;
		clone.lineCap = this.lineCap;
		clone.lineJoin = this.lineJoin;
		clone.dashOffset = this.dashOffset;
		return clone;
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
