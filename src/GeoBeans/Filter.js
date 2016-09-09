GeoBeans.Filter = GeoBeans.Class({
	type : null,

	initialize : function(){

	},

	clone : function(){
		var clone = new GeoBeans.Filter();
		clone.type = this.type;
		return clone; 
	}
});

GeoBeans.Filter.Type = {
	FilterID 			: "id",
	FilterComparsion 	: "comparsion",
	FilterLogic 		: "logic",
	FilterSpatial 		: "spatial"
};
