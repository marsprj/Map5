/**
 * @classdesc
 * 二元空间查询过滤器
 * @class
 * @extends {GeoBeans.Filter.SpatialFilter}
 */
GeoBeans.Filter.BinarySpatialFilter = GeoBeans.Class(GeoBeans.Filter.SpatialFilter,{
	operator : null,
	propName : null,
	geometry : null,

	initialize : function(operator,propName,geometry){
		GeoBeans.Filter.SpatialFilter.prototype.initialize.apply(this,arguments);
		this.operator = operator;
		this.propName = propName;
		this.geometry = geometry;
	},

	clone : function(){
		var clone = new GeoBeans.Filter.BinarySpatialFilter();
		clone.type = clone.type;
		if(this.operator != null){
			clone.operator = this.operator;
		}
		if(this.propName != null){
			clone.propName = this.propName.clone();
		}

		if(geometry != null){
			clone.geometry = this.geometry.clone();
		}
		return clone;
	}

});