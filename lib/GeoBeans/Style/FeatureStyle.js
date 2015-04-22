GeoBeans.Style.FeatureStyle = GeoBeans.Class(GeoBeans.Style,{
	name 		: null,
	rules  		: null,
	geomType 	: null,
	initialize : function(name,geomType){
		this.name = name;
		// this.type = type;
		this.geomType = geomType;
		this.type = GeoBeans.Style.Type.FeatureType;
		this.rules = [];
	},

	addRule : function(rule){
		this.rules.push(rule);
	},

	removeRule : function(index){
		this.rules.splice(index,1);
	},

	clone : function(){
		var clone = new GeoBeans.Style.FeatureStyle(this.name,
					this.geomType);
		for(var i = 0; i < this.rules.length;++i){
			var rule = this.rule[i].clone();
			clone.addRule(rule);
		}
		return clone;

	}
});

GeoBeans.Style.FeatureStyle.GeomType = {
	Point 					: "Point",
	LineString 				: "LineString",
	Polygon 				: "Polygon"
	// MultiPoint 				: "MultiPoint",
	// MultiLineSting 			: "MultiLineSting",
	// MultiPolygon 			: "MultiPolygon",
	// MultiGeometryCollection : "MultiGeometryCollection",
	// Triangle 				: "Triangle"
};