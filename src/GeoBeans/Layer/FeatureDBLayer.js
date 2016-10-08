GeoBeans.Layer.FeatureDBLayer = GeoBeans.Class(GeoBeans.Layer.DBLayer,{
	styleName 	: null,
	geomType 	: null,

	// 内带图层
	featureLayer : null,

	initialize : function(name,id,dbName,typeName,queryable,visible,styleName){
		GeoBeans.Layer.DBLayer.prototype.initialize.apply(this, arguments);

		if(styleName != undefined){
			this.styleName = styleName;
		}
		this.type = GeoBeans.Layer.DBLayer.Type.Feature;
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var featureLayer = new GeoBeans.Layer.FeatureLayer("tmp");
		featureLayer.setMap(map);
		this.featureLayer = featureLayer;
		this.featureLayer.renderer.context.globalCompositeOperation = "lighter";
	},

	setStyle : function(style){
		if(style == null){
			return;
		}
		this.style = style;
		this.styleName = style.name;
	},

	// 获取featureType
	getFeatureType : function(){
		if(this.featureType != null){
			return this.featureType;
		}else{
			if(this.map != null){
				var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
				this.featureType = new GeoBeans.FeatureType(workspace,
					this.name);
				if(this.featureType.fields == null){
					this.featureType.fields = this.featureType
					.getFields(this.map.name,null);
				}
				return this.featureType;
			}
		}
		return null;
	},

	getFeatureBBoxGet : function(bbox,maxFeatures,offset){
		var featureType = this.getFeatureType();
		var features = null;
		if(featureType != null){
			features = featureType.getFeatureBBoxGet(this.map.name,
				null,bbox,maxFeatures,offset);
		}
		return features;
	},

	getFeautureBBoxGetOutput : function(bbox,maxFeatures,offset){
		var url = null;
		var featureType = this.getFeatureType();
		if(featureType != null){
			 url = featureType.getFeatureBBoxGetOutput(this.map.name,
			null,bbox,maxFeatures,offset);
		}
		return url;
	},

	getFeatureCount : function(bbox,callback){
		var featureType = this.getFeatureType();
		if(featureType != null){
			var count = featureType.getCount(this.map.name,null,bbox);
			if(callback != null){
				callback(this,count);
			}else{
				return count;
			}
		}else{
			if(callback != null){
				callback(0);
			}else{
				return 0;
			}
		}
		
	},

	getFields : function(){
		var featureType = this.getFeatureType();
		var fields = null;
		if(featureType != null){
			fields = featureType.getFields(this.map.name,null);
		}
		return fields;
	},

	getHeatMapLayer : function(){
		return this.heatMapLayer;
	},

	addHeatMap : function(field,uniqueValue,config){
		if(field == null && uniqueValue == null){
			return;
		}
		// var fields = this.getFields();
		var featureType = this.getFeatureType();
		var fieldIndex = featureType.getFieldIndex(field);
		if(fieldIndex < 0  && uniqueValue == null){
			return;
		}else if(fieldIndex < 0 && uniqueValue != null){
			this.heatMapLayer 
			= new GeoBeans.Layer.HeatMapLayer(this.name + "-heatMap",config);
			this.heatMapLayer.setMap(this.map);
			this.heatMapLayer.setLayer(this,null,uniqueValue);
			return;
		}
		this.heatMapLayer 
			= new GeoBeans.Layer.HeatMapLayer(this.name + "-heatMap",config);
		this.heatMapLayer.setMap(this.map);
		this.heatMapLayer.setLayer(this,field,null);
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
		var features = null;
		var featureType = this.getFeatureType();
		if(featureType != null){
			features = featureType.getFeaturesWithin(this.map.name,
			null,point);
		}
		return features;
	},

	// 根据filter查询
	getFeatureFilter : function(filter,maxFeatures,offset,fields){
		var featureType = this.getFeatureType();
		if(featureType != null){
			features = featureType.getFeaturesFilter(this.map.name,
			null,filter,maxFeatures,offset,fields);
		}
		return features;
	},

	// 根据filter查询个数
	getFeatureFilterCount : function(filter){
		var count = 0;
		var featureType = this.getFeatureType();
		if(featureType != null){
			count = featureType.getFeatureFilterCount(this.map.name,
				null,filter);
		}
		return count;
	},

	// 根据filter异步查询个数
	getFeatureFilterCountAsync : function(filter,callback){
		var featureType = this.getFeatureType();
		if(featureType != null){
			featureType.getFeatureFilterCountAsync(this.map.name,
				null,filter,this,callback);
		}else{
			if(callback != null){
				callback(0);
			}
		}
	},

	// 输出
	getFeatureFilterOutput : function(filter,maxFeatures,offset){
		var url = null;
		var featureType = this.getFeatureType();
		if(featureType != null){
			url = featureType.getFeatureFilterOutput(this.map.name,
			null,filter,maxFeatures,offset);
		}
		
		return url;
	},	

	// 获取所有元素
	getFeatures : function(fields,obj,callback){
		var featureType = this.getFeatureType();
		if(featureType == null){
			if(callback != null){
				callback(null);
			}
			return;
		}

		featureType.getFeaturesFilterAsync2(this.map.name,null,null,null,null,fields,null,obj,callback);
	},

	// canvas绘制
	loadLocal : function(){
		// console.log(this.name + ";" + this.flag);
		var mapViewer = this.map.viewer;
		if(mapViewer != null && this.viewer != null && mapViewer.equal(this.viewer) 
			&& this.features != null && this.style != null && this.flag == GeoBeans.Layer.Flag.LOADED){
			
			this.renderer.clearRect();
			this.renderer.drawImage(this.featureLayer.canvas,0,0,this.map.width,this.map.height);
			return;		
		}

		if(this.xhr!= null){
			// this.xhr.abort();
			return;
		}

		this.features = [];
		
		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);

		
		if(this.featureType==null){
			this.featureType = this.getFeatureType();
		}
		
		if(this.featureType==null){
			return;
		}
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;
		
		var filter = new GeoBeans.Filter.BBoxFilter();
		filter.extent = this.viewer;
		filter.propName =this.featureType.geomFieldName;
		var fields = [this.featureType.geomFieldName];

		// 测试代码
		// var a = mapObj.getLayer("china_city_point_2");
		// var b = mapObj.getLayer("country");
		// console.log("a:" + a.flag);
		// console.log("b:" + b.flag);
		/*测试代码*/
		var xhr = this.featureType.getFeaturesFilterAsync2(this.map.name,null,filter,null,null,fields,
			null,this,this.getFeatures_callback);
		this.xhr = xhr;
		// this.requestFlag = true;
	},

	getFeatures_callback : function(layer,features){
		if(layer == null || features == null){
			return;
		}
		
		// layer.requestFlag = false;
		layer.features = features;
		layer.featureLayer.features = features;
		// layer.drawLayerSnap();
		layer.renderer.clearRect();
		layer.featureLayer.renderer.clearRect();
		// layer.drawLayer();
		layer.getStyle();
	},

	drawLayer : function(){
		this.xhr = null;
		var style = this.style;
		var features = this.features;
		if(style == null || features == null){
			return;
		}
		rules = style.rules;
		if(rules.length==0){
			return;
		}


		var time = new Date();
		for(var i=0; i<rules.length; i++){
			var rule = rules[i];
			var features = this.featureLayer.selectFeaturesByFilter(rule.filter);
			if(rule.symbolizer != null){
				if(rule.symbolizer.icon_url!=null){
				// if(rule.symbolizer.symbol != null){
					// this.renderer.drawIcons(features, rule.symbolizer, this.map.transformation);
				}else{
					this.featureLayer.drawFeatures(features, rule.symbolizer);
				}	
			}

			if(rule.textSymbolizer != null){
				this.featureLayer.labelFeatures(features,rule.textSymbolizer);
			}
		}
		this.renderer.drawImage(this.featureLayer.canvas,0,0,this.map.width,this.map.height);
		this.flag = GeoBeans.Layer.Flag.LOADED;
		this.map.drawLayersAll();
	},

	getStyle : function(){
		if(this.style != null){
			// return this.style;
			this.drawLayer();
			return;
		}
		if(this.styleName == null || this.styleName == ""){
			this.featureLayer.featureType = this.getFeatureType();
			var style = this.featureLayer.getDefaultStyle();
			if(style != null){
				this.style = style;
				this.drawLayer();
				return;
			}else{
				this.flag = GeoBeans.Layer.Flag.ERROR;
				return;
			}
		}else{
			var server = this.map.server;
			server = server.replace("/mgr","");
			var styleMgr = new GeoBeans.StyleManager(server);
			styleMgr.getStyleXML(this.styleName,this.getStyle_callback,this);
		}
		

	// 	var styleName = this.styleName;
	},

	getStyle_callback : function(style,layer){
		// console.log(style.name);
		if(style == null || layer == null){
			return;
		}
		layer.style = style;
		layer.drawLayer(); 
	},
});