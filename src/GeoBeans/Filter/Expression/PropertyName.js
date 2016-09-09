GeoBeans.PropertyName = GeoBeans.Class({
	name : null,

	initialize : function(){
		this.type = GeoBeans.Expression.Type.PropertyName;
	},

	clone : function(){
		var clone = new GeoBeans.PropertyName();
		clone.name = this.name;
		return clone;
	},

	setName : function(name){
		this.name = name;
	}
});