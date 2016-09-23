/**
 * @classdesc
 * 逻辑过滤器
 * @class
 * @extends {GeoBeans.Filter}
 */
GeoBeans.Filter.LogicFilter = GeoBeans.Class(GeoBeans.Filter,{
	operator : null,


	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterLogic;
	}
});

GeoBeans.Filter.LogicFilter.OperatorType = {
	LogicOprAnd : "and",
	LogicOprOr  : "or",
	LogicOprNot : "not"
};