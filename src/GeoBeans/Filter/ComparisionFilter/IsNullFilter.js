/**
 * @classdesc
 * Null比较过滤器
 * @class
 * @extends {GeoBeans.Filter.ComparisionFilter}
 */
GeoBeans.Filter.IsNullFilter = GeoBeans.Class(GeoBeans.Filter.ComparisionFilter,{

	properyName : null,

	initialize : function(properyName){
		GeoBeans.Filter.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsNull;
		this.properyName = properyName;
	},

	clone : function(){
		var clone = new GeoBeans.Filter.IsNullFilter();
		clone.type = this.type;
		if(clone.properyName != null){
			clone.properyName = this.properyName.clone();
		}
		return clone;
	},
});