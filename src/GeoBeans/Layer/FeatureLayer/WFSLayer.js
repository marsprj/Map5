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
	

	// load : function(){

	// 	var viewer = this.map.getViewer();
	// 	var extent = viewer.getExtent();
	// 	if(extent != null && this.viewer != null 
	// 		&& extent.equal(this.viewer) && this.features != null){
	// 		this.flag = GeoBeans.Layer.Flag.LOADED;
	// 		this.drawLayerSnap();
	// 		this.renderer.clearRect();
	// 		this.drawLayer();
	// 		this.drawBufferFeaturesCanvas();
	// 		// this.flag = GeoBeans.Layer.Flag.READY;	
	// 		return;		
	// 	}

	// 	this.viewer = new GeoBeans.Envelope(extent.xmin,extent.ymin,
	// 		extent.xmax,extent.ymax);

		
	// 	if(this.featureType==null){
	// 		this.featureType = this.workspace.getFeatureType(this.typeName);
	// 	}
		
	// 	if(this.featureType==null){
	// 		return;
	// 	}
	// 	var that = this;
	// 	that.flag = GeoBeans.Layer.Flag.READY;
	// 	this.featureType.getFeaturesBBox(function(featureType, features){
	// 		that.setTransformation(that.map.getViewer().transformation);
	// 		that.features = features;
	// 		that.drawLayerSnap();
	// 		that.renderer.clearRect();
	// 		that.drawLayer();
	// 		that.drawBufferFeaturesCanvas();
	// 		// that.map.drawLayers();
	// 		that.map.drawLayersAll();

	// 		that.flag = GeoBeans.Layer.Flag.LOADED;
	// 	},this.viewer,this.filter);	
	// },

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
			this.load();
		}

		if(this.featureType == null){
			this.workspace.getFeatureType(this.typeName,this,this.getFeatureType_callback);
			return;
		}
		this.getFields();
	},

	getFeatureType_callback : function(layer,featureType){
		if(layer != null && featureType != null){
			layer.featureType = featureType;
			layer.getFields(layer.getFields_callback);
		}
	},

	getFields : function(){
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
		// 避免重复请求
		if(this.xhr == null){
			this.xhr = this.featureType.getFeaturesAsync(null,null,null,this,this.getAllFeatures_callback);	
		}else{
			// 失败处理
		}
		
	},

	getAllFeatures_callback : function(layer,features){
		if(layer != null && features != null){
			layer.features = features;
			layer.load();
			layer.map.drawLayersAll();
		}
	},

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


	CLASS_NAME : "GeoBeans.Layer.FeatureLayer.WFSLayer"
});

/**
 * 查询
 * @param  {GeoBeasn.Filter} filter  查询过滤器
 * @param  {function} 		 handler 查询结果处理的回调函数
 * @return {GeoBeans.Feature}        目标要素集合
 */
GeoBeans.Layer.WFSLayer.prototype.query = function(query, handler){
	var featureType = this.getFeatureType();
	featureType.query(query, handler);
}

/**
 * 矩形查询过滤器
 * @param  {[type]} query   [description]
 * @param  {[type]} handler [description]
 * @return {[type]}         [description]
 */
GeoBeans.Layer.WFSLayer.prototype.queryByRect = function(query, handler){
	var featureType = this.getFeatureType();
	featureType.query(query, handler);
}