GeoBeans.Symbol = GeoBeans.Class({
	
	name : null,

	icon : null,


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
		return clone;
	}
});