GeoBeans.DataSet = GeoBeans.Class({
	name : null,
	type : null,
	geometryType : null,
	srid : null,

	initialize : function(name,type,geometryType,srid){
		this.name = name;
		this.type = type;
		this.geometryType = geometryType;
		this.srid = srid;
	},

	


});