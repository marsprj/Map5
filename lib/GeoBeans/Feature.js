GeoBeans.Feature = GeoBeans.Class({
	
	featureType : null,
	
	fid : null,
	geometry : null,
	attributes : null,
	style : null,
	
	initialize : function(featureType, geometry, attributes){
		this.featureType = featureType;
		this.geometry = geometry;	
		this.attributes = attributes;
	},
	
	destroy : function(){
		this.featureType = null;
		this.geometry = null;
		this.attributes = null;
	}
});