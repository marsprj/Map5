/**
 * @classdesc
 * 一元逻辑比较过滤器（NOT）
 * @class
 * @extends {GeoBeans.Filter.LogicFilter}
 */
GeoBeans.Filter.UnaryLogicFilter = GeoBeans.Class(GeoBeans.Filter.LogicFilter,{
	filter : null,

	initialize : function(filter){
		GeoBeans.Filter.LogicFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprNot;
		this.filter = filter;
	}
});