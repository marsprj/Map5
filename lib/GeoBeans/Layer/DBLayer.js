GeoBeans.Layer.DBLayer = GeoBeans.Class(GeoBeans.Layer,{
	queryable 	: null,
	style 		: null,
	dbName 		: null,
	typeName 	: null,
	styleName 	: null,
	geomType 	: null,

	initialize : function(name,dbName,typeName,styleName){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.dbName = dbName;
		this.typeName = typeName;
		if(styleName != undefined){
			this.styleName = styleName;
		}
	},

	setStyle : function(style){
		if(style == null){
			return;
		}
		this.style = style;
		this.styleName = style.name;
	},

});