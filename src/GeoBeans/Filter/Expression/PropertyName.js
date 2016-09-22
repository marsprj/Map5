/**
 * @classdesc
 * 属性名称表达式
 * @class
 * @extends {GeoBeans.ComparisionFilter}
 */
GeoBeans.PropertyName = GeoBeans.Class(GeoBeans.Expression, {
	name : null,

	initialize : function(){
		this.type = GeoBeans.Expression.Type.PropertyName;
	},

	clone : function(){
		var clone = new GeoBeans.PropertyName();
		clone.name = this.name;
		return clone;
	},

	setName : function(name){
		this.name = name;
	}
});