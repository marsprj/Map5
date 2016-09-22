
GeoBeans.FieldType = {
	DOUBLE 	: "double",
	STRING	: "string",
	GEOMETRY: "geometry"
};

/**
 * @classdesc
 * Map5的Feature对象的字段类。
 * @class
 */
GeoBeans.Field = GeoBeans.Class({
	
	featureType : null,
	name	: null,
	type	: null,
	geomType: null,
	length 	: null,
	
	initialize : function(name, type, featureType,length){
		this.name = name;
		this.type = type;
		this.featureType = featureType;
		this.length = length;
	},
	
	destroy : function(){
		this.name = null;
		this.type = null;
		this.featureType = null;
	},
	
	setGeomType : function(type){
		this.geomType = type;
	}
});