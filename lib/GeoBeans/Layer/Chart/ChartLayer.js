GeoBeans.Layer.ChartLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{

	baseLayerName 	: null,
	baseLayerField 	: null,
	dbName 			: null,
	tableName 		: null,
	tableField 		: null,
	chartFields 	: null,

	chartFeatureType: null,
	type 			: null,

	// 在图上展示的表格数据，经过空间字段筛选的
	chartFeatures 	: null,

	initialize : function(name,baseLayerName,baseLayerField,
		dbName,tableName,tableField,chartFields){
		GeoBeans.Layer.FeatureLayer.prototype.initialize.apply(this, arguments);
		this.baseLayerName = baseLayerName;
		this.baseLayerField = baseLayerField;
		this.dbName = dbName;
		this.tableName = tableName;
		this.tableField = tableField;
		this.chartFields = chartFields;

	},

	cleanup : function(){
		this.removeLegend();
		this.name = null;
		this.baseLayerName = null;
		this.baseLayerField = null;
		this.dbName = null;
		this.tableName = null;
		this.tableField = null;
		this.chartFields = null;
	},

	setFeatureType : function(featureType){
		this.featureType = featureType;
	},

	setFeatures : function(features){
		this.features = features;
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var chartFeatures = this.getChartFeatures();
		if(chartFeatures != null){
			this.chartFeatures = chartFeatures;
		}
		var extent = this.getBaseLayerExtent();
		if(extent != null){
			this.extent = extent;			
		}
	},

	// 获得底图的范围
	getBaseLayerExtent : function(){
		var layer = this.map.getLayer(this.baseLayerName);
		if(layer != null){
			var extent = layer.getExtent();
			return extent;
		}
		return null;
	},

	getChartFeatures : function(){
		if(this.baseLayerName == null || this.baseLayerField == null
			|| this.dbName == null || this.tableName == null 
			|| this.tableField == null){
			return null;
		}
		var layer = this.map.getLayer(this.baseLayerName);
		if(layer == null){
			return null;
		}
		//计算表的要素
		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var tableFeatureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		this.chartFeatureType = tableFeatureType;
		var tableFields = tableFeatureType.getFields(null,this.dbName);

		// var tableFeatures = tableFeatureType.getFeatures(null,this.dbName,null,null,null);
		var tableFeatures = tableFeatureType.getFeaturesFilter(null,
			this.dbName,null,null,null,[this.tableField].concat(this.chartFields));
		var tableFieldIndex = tableFeatureType.getFieldIndex(this.tableField);
		if(tableFieldIndex == -1){
			return null;
		}

		// 计算
		var baseLayerFeatureType = layer.featureType;
		var baseLayerGeomField = baseLayerFeatureType.geomFieldName;
		var fields = null;
		if(this.type == GeoBeans.Layer.ChartLayer.Type.BAR || 
			this.type == GeoBeans.Layer.ChartLayer.Type.PIE){
			fields = [this.baseLayerField,baseLayerGeomField];
		}else{
			fields = [this.baseLayerField];
		}
		// var baseLayerFeatures = baseLayerFeatureType.getFeatures(this.map.name,null,null,null);
		var baseLayerFeatures = baseLayerFeatureType.getFeaturesFilter(this.map.name,
			null,null,null,null,fields);
		var baseLayerFields = layer.getFields();
		var baseLayerFieldIndex = baseLayerFeatureType.getFieldIndex(this.baseLayerField);
		if(baseLayerFieldIndex == -1){
			return null;
		}
		var chartFeatures = this.getValidChartFeatures(tableFeatures,tableFieldIndex,
		baseLayerFeatures,baseLayerFieldIndex);
		return chartFeatures;

	},

	// 获取有效的表数据
	getValidChartFeatures : function(tableFeatures,tableFieldIndex,
		baseLayerFeatures,baseLayerFieldIndex){
		if(tableFeatures == null || tableFieldIndex == null 
			|| baseLayerFeatures == null || baseLayerFieldIndex == null){
			return null;
		}
		var chartFeatures = [];
		for(var i = 0; i < tableFeatures.length; ++i){
			var tableFeature = tableFeatures[i];
			if(tableFeature == null){
				continue;
			}
			var tableValues = tableFeature.values;
			if(tableValues == null){
				continue;
			}
			var tableValue = tableValues[tableFieldIndex];
			if(tableValue == null){
				continue;
			}
			for(var j = 0; j < baseLayerFeatures.length; ++j){
				var feature = baseLayerFeatures[j];
				if(feature == null){
					continue;
				}
				var values = feature.values;
				if(values == null){
					continue;
				}
				var value = values[baseLayerFieldIndex];
				// var value = values[0];
				if(value == null){
					continue;
				}
				if(value == tableValue){
					tableFeature.geometry = feature.geometry;
					tableFeature.gid = feature.fid;
					chartFeatures.push(tableFeature);
					break;
				}
			}
		}
		return chartFeatures;
	},

	setBaseLayer : function(baseLayerName){
		this.baseLayerName = baseLayerName;
		this.chartFeatures = this.getChartFeatures();
	},

	getBaseLayer : function(){
		return this.baseLayerName;
	},

	setBaseLayerField : function(baseLayerField){
		this.baseLayerField = baseLayerField;
		this.chartFeatures = this.getChartFeatures();
	},

	getBaseLayerField : function(){
		return this.baseLayerField;
	},

	setDbName : function(dbName){
		this.dbName = dbName;
		this.chartFeatures = this.getChartFeatures();
	},

	getDbName : function(){
		return this.dbName;
	},

	setTableName : function(tableName){
		this.tableName = tableName;
		this.chartFeatures = this.getChartFeatures();
	},

	getTableName : function(){
		return this.tableName;
	},

	setTableField : function(tableField){
		this.tableField = tableField;
		this.chartFeatures = this.getChartFeatures();
	},

	getTableField : function(){
		return this.tableField;
	},

	setChartFields : function(chartFields){
		this.chartFields = chartFields;
		this.chartFeatures = this.getChartFeatures();
	},

	getChartFields : function(){
		return this.chartFields;
	},


	setChartOption : function(chartOption){
		this.chartOption = chartOption;
	},

	getChartOption : function(){
		return this.chartOption;
	},

	addLegend : function(){

	},

	showLegend : function(){
		this.map.mapDiv.find(".chart-legend#"+this.name).css("display","block");
	},

	hideLegend : function(){
		this.map.mapDiv.find(".chart-legend#"+this.name).css("display","none");
	},

	removeLegend : function(){
		this.map.mapDiv.find(".chart-legend#"+this.name).remove();
	},

	setName : function(name){
		this.name = name;
	}


});

//专题图类型
GeoBeans.Layer.ChartLayer.Type ={
	RANGE 	: "range",
	BAR 	: "bar",
	PIE 	: "pie"
};