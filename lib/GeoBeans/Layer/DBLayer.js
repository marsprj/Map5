GeoBeans.Layer.DBLayer = GeoBeans.Class(GeoBeans.Layer,{
	queryable 	: null,
	style 		: null,
	dbName 		: null,
	typeName 	: null,
	styleName 	: null,
	geomType 	: null,

	featureType : null,

	initialize : function(name,dbName,typeName,styleName){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.dbName = dbName;
		this.typeName = typeName;
		if(styleName != undefined){
			this.styleName = styleName;
		}
	},

	cleanup : function(){

	},

	setMap : function(){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);

		if(this.map != null){
			var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
			this.featureType = new GeoBeans.FeatureType(workspace,
				this.name);
		}
	},

	setStyle : function(style){
		if(style == null){
			return;
		}
		this.style = style;
		this.styleName = style.name;
	},

	getFeatureBBoxGet : function(bbox,maxFeatures,offset){
		var features = this.featureType.getFeatureBBoxGet(this.map.name,
				null,bbox,maxFeatures,offset);
		return features;
	},



	getFeatureCount : function(bbox,callback){
		var count = this.featureType.getCount(this.map.name,null,bbox);
		if(callback != null){
			callback(this,count);
		}
	}

	// getFeatureBBoxGet_callback : function()

});