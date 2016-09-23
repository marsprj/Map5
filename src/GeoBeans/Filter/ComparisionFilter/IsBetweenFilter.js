/**
 * @classdesc
 * Between比较过滤器
 * @class
 * @extends {GeoBeans.Filter.ComparisionFilter}
 */
GeoBeans.Filter.IsBetweenFilter = GeoBeans.Class(GeoBeans.Filter.ComparisionFilter,{
	expression : null,
	lowerBound : null,
	upperBound : null,


	initialize : function(expression,lowerBound,upperBound){
		GeoBeans.Filter.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsBetween;
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