GeoBeans.ComparisionFilter = GeoBeans.Class(GeoBeans.Filter,{

	operator : null,

	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterComparsion;
	}
});


GeoBeans.ComparisionFilter.OperatorType = {
	ComOprEqual 				: "equal",
	ComOprNotEqual 			: "notequal",
	ComOprLessThan 			: "lessthan",
	ComOprGreaterThan 		: "greaterthan",
	ComOprLessThanOrEqual	: "lessthanorequal",
	ComOprGreaterThanOrEqual : "greaterthanorequal",
	ComOprIsLike 			: "islike",
	ComOprIsNull 			: "isnull",
	ComOprIsBetween 		: "isbetween"
};