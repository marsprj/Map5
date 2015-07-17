GeoBeans.Layer.DBLayer = GeoBeans.Class(GeoBeans.Layer,{
	queryable 	: null,
	style 		: null,
	dbName 		: null,
	typeName 	: null,
	styleName 	: null,
	geomType 	: null,

	featureType : null,
	heatMapLayer: null,

	id 			: null,


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
			this.featureType.fields = this.featureType
				.getFields(this.map.name,null);
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

	getFeautureBBoxGetOutput : function(bbox,maxFeatures,offset){
		var url = this.featureType.getFeatureBBoxGetOutput(this.map.name,
			null,bbox,maxFeatures,offset);
		return url;
	},

	getFeatureCount : function(bbox,callback){
		var count = this.featureType.getCount(this.map.name,null,bbox);
		if(callback != null){
			callback(this,count);
		}else{
			return count;
		}
	},

	getFields : function(){
		var fields = this.featureType.getFields(this.map.name,null);
		return fields;
	},

	getHeatMapLayer : function(){
		return this.heatMapLayer;
	},

	addHeatMap : function(field){
		if(field == null){
			return;
		}
		// var fields = this.getFields();
		var fieldIndex = this.featureType.getFieldIndex(field);
		if(fieldIndex < 0 ){
			return;
		}
		this.heatMapLayer 
			= new GeoBeans.Layer.HeatMapLayer(this.name + "-heatMap");
		this.heatMapLayer.setMap(this.map);
		this.heatMapLayer.setLayer(this,field);
	},

	removeHeatMap : function(){
		if(this.heatMapLayer != null){
			this.heatMapLayer.destory();
			this.heatMapLayer = null;
		}
		
	},

	setHeatMapVisible : function(visible){
		if(this.heatMapLayer != null){
			this.heatMapLayer.visible = visible;
		}
	},

	getFeaturesWithin : function(point){
		var features =  this.featureType.getFeaturesWithin(this.map.name,
			null,point);
		return features;
	},

	// 根据filter查询
	getFeatureFilter : function(filter,maxFeatures,offset,fields){
		var features = this.featureType.getFeaturesFilter(this.map.name,
			null,filter,maxFeatures,offset,fields);
		return features;
	},

	// 根据filter查询个数
	getFeatureFilterCount : function(filter){
		var count = this.featureType.getFeatureFilterCount(this.map.name,
			null,filter);
		return count;
	},

	// 输出
	getFeatureFilterOutput : function(filter,maxFeatures,offset){
		var url = this.featureType.getFeatureFilterOutput(this.map.name,
			null,filter,maxFeatures,offset);
		return url;
	},

});