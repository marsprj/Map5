GeoBeans.Literal = GeoBeans.Class(GeoBeans.Expression,{
	value : null,

	initialize : function(){
		GeoBeans.Expression.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Expression.Type.Literal;
	}
});