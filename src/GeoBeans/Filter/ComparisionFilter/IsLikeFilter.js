/**
 * @classdesc
 * like比较过滤器
 * @class
 * @extends {GeoBeans.Filter.ComparisionFilter}
 */
GeoBeans.Filter.IsLikeFilter = GeoBeans.Class(GeoBeans.Filter.ComparisionFilter,{
	properyName : null,
	literal 	: null,

	initialize : function(){
		GeoBeans.Filter.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike;
	},

	clone : function(){
		var clone = new GeoBeans.Filter.IsLikeFilter();
		clone.type = this.type;
		if(this.properyName != null){
			clone.properyName = this.properyName.clone();
		}
		if(this.literal != null){
			clone.literal = this.literal.clone();
		}
		return clone;
	}
});