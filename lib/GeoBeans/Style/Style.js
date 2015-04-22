GeoBeans.Style = GeoBeans.Class({
	name : null,
	type : null,

	initialize : function(name){
		this.name = name;
	}
});

GeoBeans.Style.Type = {
	FeatureType : "featureType",
	RasterType : "rasterType"
};