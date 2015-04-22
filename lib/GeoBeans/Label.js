GeoBeans.Label = GeoBeans.Class({
	text 			: null,
	geometry 		: null,
	textSymbolizer 	: null,
	geometryType 	: null,

	initialize : function(){
		this.geometryType = GeoBeans.Geometry.Type.POINT;
	},
	isCollision : function(label){
		return true;
	},

	computePosition : function(render,transform){

	},

	adjustPosition : function(width,height){

	}


});