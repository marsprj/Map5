/**
 * @classdesc
 * 二元逻辑比较过滤器（AND, OR）
 * @class
 * @extends {GeoBeans.Filter.LogicFilter}
 */
GeoBeans.Filter.BinaryLogicFilter = GeoBeans.Class(GeoBeans.LogicFilter,{
	// operator : null,
	filters  : null,

	initialize : function(operator){
		GeoBeans.LogicFilter.prototype.initialize.apply(this,arguments);
		this.filters = [];
		this.operator = operator;
	},

	addFilter : function(filter){
		this.filters.push(filter);
	}


});