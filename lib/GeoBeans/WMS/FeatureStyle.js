GeoBeans.WMSStyle.FeatureStyle = GeoBeans.Class(GeoBeans.WMSStyle,{
	name 		: null,
	rules  		: null,
	geomType 	: null,
	initialize : function(name,geomType){
		this.name = name;
		// this.type = type;
		this.geomType = geomType;
		this.type = GeoBeans.WMSStyle.Type.FeatureType;
		this.rules = [];
	},

	addRule : function(rule){
		this.rules.push(rule);
	}
});

GeoBeans.WMSStyle.FeatureStyle.Type = {
	Point 					: "Point",
	LineString 				: "LineString",
	Polygon 				: "Polygon",
	MultiPoint 				: "MultiPoint",
	MultiLineSting 			: "MultiLineSting",
	MultiPolygon 			: "MultiPolygon",
	MultiGeometryCollection : "MultiGeometryCollection",
	Triangle 				: "Triangle"
};