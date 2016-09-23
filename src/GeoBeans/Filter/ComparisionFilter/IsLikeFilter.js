/**
 * @classdesc
 * like比较过滤器
 * @class
 * @extends {GeoBeans.Filter.ComparisionFilter}
 */
GeoBeans.Filter.IsLikeFilter = GeoBeans.Class(GeoBeans.Filter.ComparisionFilter,{
	properyName : null,
	literal 	: null,

	initialize : function(){
		GeoBeans.Filter.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike;
	}
});