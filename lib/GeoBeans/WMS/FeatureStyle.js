GeoBeans.WMSStyle.FeatureStyle = GeoBeans.Class(GeoBeans.WMSStyle,{
	// name 		: null,
	rules  		: null,
	geomType 	: null,
	initialize : function(name,type){
		this.name = name;
		this.type = type;
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