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
	

	draw : function(){
		if(!this.isVisible()){
			this.clear();
			return;
		}

		if(this.featureType == null){
			this.workspace.getFeatureType(this.typeName,this,this.getFeatureType_callback);
		}else{
			this.loadFeatures();
		}
	},
	
	loadFeatures : function(){
		var viewer = this.map.getViewer();
		var extent = viewer.getExtent();
		this.viewer = new GeoBeans.Envelope(extent.xmin,extent.ymin,
			extent.xmax,extent.ymax);
		var bboxFilter = new GeoBeans.Filter.BBoxFilter(this.featureType.geomFieldName,this.viewer);
		var query = new GeoBeans.Query({
			typeName : this.name,
			fields : null,		// 字段
			maxFeatures : null, //返回结果数
			offset : null,		//偏移量
			orderby : null,		//排序类
			filter : bboxFilter 	//查询过滤条件
		});
		var handler = {
			target: this,
			execute : function(features){
				this.target.features = features;
				console.log("count:" + features.length);
				this.target.renderer.clearRect(0,0,this.target.canvas.width,this.target.canvas.height);
				this.target.drawLayerFeatures(features);
			}
		}
		this.query(query,handler);
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
			layer.loadFeatures();	
		}
	},

	// setFilter: function(filter){
	// 	this.filter = filter;
	// 	this.features = null;
	// },

	getFeatureType : function(){
		if(this.featureType==null){
			this.featureType = this.workspace.getFeatureType(this.typeName);
		}
		
		if(this.featureType==null){
			return;
		}
		return this.featureType;
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

