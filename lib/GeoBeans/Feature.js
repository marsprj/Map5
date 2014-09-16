GeoBeans.Feature = GeoBeans.Class({
	
	featureType : null,
	
	fid 	 : null,
	geometry : null,
	values	 : null,
	symbolizer: null,
	
	initialize : function(featureType, fid, geometry, values){
		this.featureType = featureType;
		this.fid = fid;
		this.geometry = geometry;	
		this.values = values;
	},
	
	destroy : function(){
		this.featureType = null;
		this.geometry = null;
		this.values = null;
	}
});