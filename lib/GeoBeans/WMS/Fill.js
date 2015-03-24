GeoBeans.Fill = GeoBeans.Class({
	color : null,
	// opacity : null

	initialize : function(){

	},

	getRgba : function(){
		return this.color.getRgba();
	},

	getOpacity : function(){
		return this.color.getOpacity();
	},

	getRgb : function(){
		return this.color.getRgb();
	}
});