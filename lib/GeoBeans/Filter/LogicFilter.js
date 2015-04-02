GeoBeans.LogicFilter = GeoBeans.Class(GeoBeans.Filter,{
	operator : null,


	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterLogic;
	}


});

GeoBeans.LogicFilter.OperatorType = {
	LogicOprAnd : "and",
	LogicOprOr  : "or",
	LogicOprNot : "not"
};