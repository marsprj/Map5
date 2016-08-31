GeoBeans.IsNullFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{
	properyName : null,


	initialize : function(properyName){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsNull;
		this.properyName = properyName;
	}
});