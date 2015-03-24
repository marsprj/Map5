GeoBeans.WMSStyle = GeoBeans.Class({
	name : null,
	// service : "ims",
	type : null,
	// id : null,

	initialize : function(name){
		this.name = name;
		// this.type = type;
	}

});

GeoBeans.WMSStyle.Type = {
	FeatureType : "featureType",
	RasterType : "rasterType"
	// POINT : "Point",
	// LINESTRING : "LineString",
	// POLYGON : "Polygon"
};