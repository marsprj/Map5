GeoBeans.Fill = GeoBeans.Class({
	color : null,
	// opacity : null

	initialize : function(){
		this.color = new GeoBeans.Color();
	},

	getRgba : function(){
		return this.color.getRgba();
	},

	getOpacity : function(){
		return this.color.getOpacity();
	},

	getRgb : function(){
		return this.color.getRgb();
	},

	clone : function(){
		var clone = new GeoBeans.Fill();
		if(this.color != null){
			clone.color = this.color.clone();
		}
		return clone;
	}
});