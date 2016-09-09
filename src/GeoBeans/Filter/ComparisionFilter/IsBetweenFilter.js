GeoBeans.IsBetweenFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{
	expression : null,
	lowerBound : null,
	upperBound : null,


	initialize : function(expression,lowerBound,upperBound){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsBetween;
		this.expression = expression;
		this.lowerBound = lowerBound;
		this.upperBound = upperBound;
	},

	clone : function(){
		var clone = new GeoBeans.IsBetweenFilter();
		clone.type = this.type;
		if(this.expression != null){
			clone.expression = this.expression.clone();
		}
		if(this.lowerBound != null){
			clone.lowerBound = this.lowerBound.clone();
		}
		if(this.upperBound != null){
			clone.upperBound = this.upperBound.clone();
		}
		return clone;
	}
});