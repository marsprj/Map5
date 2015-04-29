GeoBeans.Layer.DBLayer = GeoBeans.Class(GeoBeans.Layer,{
	queryable : null,
	style : null,
	dbName : null,
	typeName : null,

	initialize : function(name,dbName,typeName){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.dbName = dbName;
		this.typeName = typeName;

	}
});