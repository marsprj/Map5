GeoBeans.IsBetweenFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{
	expression : null,
	lowerBound : null,
	upperBound : null,


	initialize : function(){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsBetween;
	}
});