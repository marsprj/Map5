GeoBeans.BinaryLogicFilter = GeoBeans.Class(GeoBeans.LogicFilter,{
	// operator : null,
	filters  : null,

	initialize : function(){
		GeoBeans.LogicFilter.prototype.initialize.apply(this,arguments);
		this.filters = [];
	},

	addFilter : function(filter){
		this.filters.push(filter);
	}


});