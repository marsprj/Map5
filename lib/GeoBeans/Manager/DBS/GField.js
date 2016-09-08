GeoBeans.GField = GeoBeans.Class({
	name : null,
	type : null,
	length : null,

	initialize : function(name,type,length){
		this.name = name;
		this.type = type;
		this.length = length;
	},

});

GeoBeans.GFieldType = {
	Bool 	: "bool",
	Char 	: "char",
	Short 	: "short",
	Int 	: "int",
	Long 	: "long",
	Int64 	: "int64",
	Float 	: "float",
	Double 	: "double",
	String 	: "string",
	Time 	: "time",
	Blob 	: "blob",
	Geometry: "geometry"
};