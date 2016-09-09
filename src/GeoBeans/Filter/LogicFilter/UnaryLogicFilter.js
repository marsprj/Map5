GeoBeans.UnaryLogicFilter = GeoBeans.Class(GeoBeans.LogicFilter,{
	filter : null,

	initialize : function(filter){
		GeoBeans.LogicFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.LogicFilter.OperatorType.LogicOprNot;
		this.filter = filter;
	}
});