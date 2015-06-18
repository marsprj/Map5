GeoBeans.IsBetweenFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{
	expression : null,
	lowerBound : null,
	upperBound : null,


	initialize : function(){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsBetween;
	},

	clone : function(){
		var clone = new GeoBeans.IsBetweenFilter();
		clone.type = this.type;
		if(clone.expression != null){
			clone.expression = this.expression.clone();
		}
		if(clone.lowerBound != null){
			clone.lowerBound = this.lowerBound.clone();
		}
		if(clone.upperBound != null){
			clone.upperBound = this.upperBound.clone();
		}
		return clone;
	}
});