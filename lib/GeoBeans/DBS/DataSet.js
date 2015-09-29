GeoBeans.DataSet = GeoBeans.Class({
	dataSource : null,
	name : null,
	type : null,
	geometryType : null,
	srid : null,
	thumbnail : null,

	featureType : null,
	fields : null,

	count : null,
	extent : null,

	initialize : function(dataSource,name,
		type,geometryType,srid,thumbnail,count,extent){
		this.dataSource = dataSource;
		this.name = name;
		this.type = type;
		this.geometryType = geometryType;
		this.srid = srid;
		this.thumbnail = thumbnail;

		this.count = count;
		this.extent = extent;

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

	getFieldsWithoutGeom : function(){
		var fields = this.getFields();
		if(fields == null){
			return null;
		}
		var fields_2 = [];
		var field = null;
		var type = null;
		for(var i = 0; i < fields.length; ++i){
			field = fields[i];
			if(field == null){
				continue;
			}
			type = field.type;
			if(type != GeoBeans.FieldType.GEOMETRY){
				fields_2.push(field.name);
			}
		}
		return fields_2;
	},

	getFeatures : function(maxFeatures,offset,fields,callback){
		// var features = this.featureType
		// 	.getFeatures(null,this.dataSource.name,
		// 		maxFeatures,offset);
		// return features;
		// this.featureType.getFeaturesAsync(null,this.dataSource.name,
		// 		maxFeatures,offset,fields,callback);
		this.featureType.getFeaturesFilterAsync(null,this.dataSource.name,
				null,maxFeatures,offset,fields,null,callback);
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