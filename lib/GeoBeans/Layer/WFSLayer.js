GeoBeans.Layer.WFSLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer, {
	
	style : null,
	
	server: null,
	url : null,
	typeName : null,
	format : "GML2",
	version : "1.0.0",
	srs : "EPSG:4326",
	features : null,
	maxFeatures : 50,
	filter : null,
	
	workspace : null,

	//当前视图的viewer
	viewer : null,
	
	initialize : function(name, server, typeName, format){
		GeoBeans.Layer.FeatureLayer.prototype.initialize.apply(this, arguments);
		
		this.name = name;
		this.server = server;
		this.typeName = typeName;
		this.format = format;
		this.image = new Image();
		
		this.workspace = new GeoBeans.WFSWorkspace(this.name, this.server, this.version);
		
	},
	
	destory : function(){
		
		this.server= null;
		this.name = null;
		this.server = null;
		this.typeName = null;
		this.format = null;
		
		this.featureType = null,
		this.workspace = null;
		
		GeoBeans.Layer.FeatureLayer.prototype.destory.apply(this, arguments);
	},
	

	load : function(){

		var mapViewer = this.map.viewer;
		if(mapViewer != null && this.viewer != null 
			&& mapViewer.equal(this.viewer) && this.features != null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			this.drawLayerSnap();
			this.renderer.clearRect();
			this.drawLayer();
			this.drawBufferFeaturesCanvas();
			// this.flag = GeoBeans.Layer.Flag.READY;	
			return;		
		}

		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);

		
		if(this.featureType==null){
			this.featureType = this.workspace.getFeatureType(this.typeName);
		}
		
		if(this.featureType==null){
			return;
		}
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;
		this.featureType.getFeaturesBBox(function(featureType, features){
			that.setTransformation(that.map.transformation);
			that.features = features;
			that.drawLayerSnap();
			that.renderer.clearRect();
			that.drawLayer();
			that.drawBufferFeaturesCanvas();
			// that.map.drawLayers();
			that.map.drawLayersAll();

			that.flag = GeoBeans.Layer.Flag.LOADED;
		},this.viewer,this.filter);	
	},

	load : function(){
		if(this.features == null){
			this.getFeatures();
		}else{
			GeoBeans.Layer.FeatureLayer.prototype.load.apply(this, arguments);
		}
		
	},
	// 先获取featuretype,然后获取fields,最后获取所有的元素，都改为异步调用
	getFeatures : function(){
		if(this.features != null){
			// return this.features;
			this.load();
		}

		if(this.featureType == null){
			// this.featureType = this.getFeatureType();
			this.workspace.getFeatureType(this.typeName,this,this.getFeatureType_callback);
			return;
		}
		this.getFields();
		// console.log("featureType" + this.featureType);
		// console.log(this.featureType);
	},

	getFeatureType_callback : function(layer,featureType){
		if(layer != null && featureType != null){
			layer.featureType = featureType;
			// layer.getFeatures();
			layer.getFields(layer.getFields_callback);
		}
	},

	getFields : function(){
		// if(this.fields != null){
		// 	// return this.fields;
		// 	this.getFields_callback(this,this.fields);
		// 	return;
		// }

		if(this.featureType == null){
			return;
		}		
		this.featureType.getFieldsAsync(this,this.getFields_callback);
	},

	getFields_callback : function(layer,fields){
		if(fields != null && layer != null){
			layer.getAllFeatures();	
		}
	},

	getAllFeatures : function(){
		if(this.featureType == null){
			return;
		}
		this.featureType.getFeaturesAsync(null,null,null,this,this.getAllFeatures_callback);
	},

	getAllFeatures_callback : function(layer,features){
		if(layer != null && features != null){
			layer.features = features;
			layer.load();
			layer.map.drawLayersAll();
		}
	},
	
	// draw : function(){

	// 	if(this.features !=null){
	// 		this.drawLayerSnap();
	// 		this.renderer.clearRect();
	// 		this.drawLayer();
	// 		this.map.renderer.drawImage(this.canvas,0,0,this.canvas.width,this.canvas.height);
	// 		return;
	// 	}
		
	// 	if(this.featureType==null){
	// 		this.featureType = this.workspace.getFeatureType(this.typeName);
	// 	}
		
	// 	if(this.featureType==null){
	// 		return;
	// 	}
		
	// 	var that = this;
	// 	this.featureType.getFeatures(function(featureType, features){
	// 		that.setTransformation(that.map.transformation);
	// 		that.features = features;
	// 		that.drawLayerSnap();
	// 		that.renderer.clearRect();
	// 		that.drawLayer();
	// 		that.map.renderer.drawImage(that.canvas,0,0,that.canvas.width,that.canvas.height);
	// 	});
	// },
	
	setFilter: function(filter){
		this.filter = filter;
		this.features = null;
	},

	getFeatureType : function(){
		if(this.featureType==null){
			this.featureType = this.workspace.getFeatureType(this.typeName);
		}
		
		if(this.featureType==null){
			return;
		}
		return this.featureType;
	},

	CLASS_NAME : "GeoBeans.Layer.WFSLayer",


	getFeatureBBoxGet :function(bbox,maxFeatures,offset){
		var featureType = this.getFeatureType();
		var features = null;
		if(featureType != null){
			features = featureType.getFeatureBBoxGet(this.map.name,
				null,bbox,maxFeatures,offset);
		}
		return features;
	},


	// // 根据filter
	// getFeatureFilter : function(filter,maxFeatures,offset){

	// },

	// 根据filter查询
	// getFeatureFilter : function(filter,maxFeatures,offset,fields){
	// 	var featureType = this.getFeatureType();
	// 	if(featureType != null){
	// 		features = featureType.getFeaturesFilter(null,
	// 		null,filter,maxFeatures,offset,fields);
	// 	}
	// 	return features;
	// },


	getFeatureFilter : function(filter,maxFeatures,offset,fields,callback){
		var featureType = this.getFeatureType();
		this.getFeatureFilter_callback_u = callback;
		if(featureType != null){
			featureType.getFeaturesFilterAsync2(null,null,filter,maxFeatures,offset,fields,null,this,
				this.getFeatureFilter_callback);
		}
	},

	getFeatureFilter_callback : function(layer,features){
		if(layer != null){
			layer.map.queryLayer.setFeatures(features);
			layer.map.drawLayersAll();
			layer.getFeatureFilter_callback_u(features);
			layer.getFeatureFilter_callback_u = null;
		}
	},
});
