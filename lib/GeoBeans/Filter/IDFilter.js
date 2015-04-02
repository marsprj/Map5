GeoBeans.IDFilter = GeoBeans.Class(GeoBeans.Filter,{
	ids : null,

	initialize : function(){
		GeoBeans.Filter.prototype.initialize.apply(this,arguments);
		this.type = GeoBeans.Filter.Type.FilterID;
		this.ids = [];
	},

	addID : function(id){
		this.ids.push(id);
	}
});