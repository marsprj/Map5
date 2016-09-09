GeoBeans.Literal = GeoBeans.Class(GeoBeans.Expression,{
	value : null,

	initialize : function(){
		GeoBeans.Expression.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Expression.Type.Literal;
	},

	setValue : function(value){
		this.value = value;
	},

	clone : function(){
		var clone = new GeoBeans.Literal();
		clone.value = this.value;
		clone.type = this.type;
		return clone;
	}
});