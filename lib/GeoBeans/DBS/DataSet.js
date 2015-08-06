GeoBeans.DataSet = GeoBeans.Class({
	dataSource : null,
	name : null,
	type : null,
	geometryType : null,
	srid : null,
	thumbnail : null,

	featureType : null,
	fields : null,

	initialize : function(dataSource,name,
		type,geometryType,srid,thumbnail){
		this.dataSource = dataSource;
		this.name = name;
		this.type = type;
		this.geometryType = geometryType;
		this.srid = srid;
		this.thumbnail = thumbnail;

		if(this.dataSource != null){
			var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.dataSource.server,"1.0.0");
			this.featureType = new GeoBeans.FeatureType(workspace,
				this.name);
		}
	},


	getFields : function(){
		if(this.fields != null){
			return this.fields;
		}
		var fields = this.featureType.getFields(null,
			this.dataSource.name);
		this.fields = fields;
		return this.fields;
	},

	getFeatures : function(maxFeatures,offset){
		var features = this.featureType
			.getFeatures(null,this.dataSource.name,
				maxFeatures,offset);
		return features;
	},

	getPreview : function(width,height){
		var url = this.dataSource.server + "?" + "service="
			+ this.dataSource.service + "&version=" + this.dataSource.version
			+ "&request=GetPreview&sourceName=" + this.dataSource.name 
			+ "&dataSetName=" + this.name + "&width=" + width + "&height="
			+ height;
		return url;
	},

	//个数
	getFeatureCount : function(){
		var count = this.featureType
			.getCount(null,this.dataSource.name, null);
		return count;
	}

});