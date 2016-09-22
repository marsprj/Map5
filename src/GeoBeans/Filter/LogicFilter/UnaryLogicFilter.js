/**
 * @classdesc
 * 一元逻辑比较过滤器（NOT）
 * @class
 * @extends {GeoBeans.Filter.LogicFilter}
 */
GeoBeans.Filter.UnaryLogicFilter = GeoBeans.Class(GeoBeans.LogicFilter,{
	filter : null,

	initialize : function(filter){
		GeoBeans.LogicFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.LogicFilter.OperatorType.LogicOprNot;
		this.filter = filter;
	}
});