GeoBeans.Feature = GeoBeans.Class({
	
	fid : null,
	geometry : null,
	attributes : null,
	style : null,
	
	initialize : function(geometry, attributes){
		this.geometry = geometry;	
		this.attributes = attributes;
	},
	
	destroy : function(){
		this.geometry = null;
		this.attributes = null;
	}
});