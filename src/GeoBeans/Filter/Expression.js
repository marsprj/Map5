/**
 * @classdesc
 * 查询表达式
 * @class
 */
GeoBeans.Expression = GeoBeans.Class({
	type : null,

	initialize : function(){

	},
	clone : function(){
		var clone = new GeoBeans.Expression();
		clone.type = this.type;
		return clone;
	}

});

GeoBeans.Expression.Type = {
	Arithmetic 		: "arithmetic",
	PropertyName 	: "propname",
	Literal 		: "literal",
	Function 		: "function" 
};