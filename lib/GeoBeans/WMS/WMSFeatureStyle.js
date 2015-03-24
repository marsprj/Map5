GeoBeans.FeatureStyle = GeoBeans.Class(GeoBeans.WMSStyle,{

	rules : null,
	geomType : null,
	initialze : function(name){
		this.name = name;
		this.type = GeoBeans.WMSStyle.Type.FeatureType;
		this.rules = [];
	},
});

GeoBeans.WMSFeatureStyle.Type = {
	Point 					: "Point",
	LineString 				: "LineString",
	Polygon 				: "Polygon",
	MultiPoint 				: "MultiPoint",
	MultiLineSting 			: "MultiLineSting",
	MultiPolygon 			: "MultiPolygon",
	MultiGeometryCollection : "MultiGeometryCollection",
	Triangle 				: "Triangle"
};