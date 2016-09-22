/**
 * @classdesc
 * Null比较过滤器
 * @class
 * @extends {GeoBeans.Filter.ComparisionFilter}
 */
GeoBeans.Filter.IsNullFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{

	properyName : null,

	initialize : function(properyName){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsNull;
		this.properyName = properyName;
	}
});