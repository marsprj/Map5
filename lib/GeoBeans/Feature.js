GeoBeans.Feature = GeoBeans.Class({
	
	featureType : null,
	
	fid 	 : null,
	geometry : null,
	values	 : null,
	style	 : null,
	
	initialize : function(featureType, geometry, values){
		this.featureType = featureType;
		this.geometry = geometry;	
		this.values = values;
	},
	
	destroy : function(){
		this.featureType = null;
		this.geometry = null;
		this.values = null;
	}
});