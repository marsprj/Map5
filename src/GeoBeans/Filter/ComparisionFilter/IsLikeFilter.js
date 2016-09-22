/**
 * @classdesc
 * like比较过滤器
 * @class
 * @extends {GeoBeans.Filter.ComparisionFilter}
 */
GeoBeans.Filter.IsLikeFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{
	properyName : null,
	literal 	: null,

	initialize : function(){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsLike;
	}
});