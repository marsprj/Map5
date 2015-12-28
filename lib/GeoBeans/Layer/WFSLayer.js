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

	draw : function(){

		if(this.features !=null){
			this.drawLayerSnap();
			this.renderer.clearRect();
			this.drawLayer();
			this.map.renderer.drawImage(this.canvas,0,0,this.canvas.width,this.canvas.height);
			return;
		}
		
		if(this.featureType==null){
			this.featureType = this.workspace.getFeatureType(this.typeName);
		}
		
		if(this.featureType==null){
			return;
		}
		
		var that = this;
		this.featureType.getFeatures(function(featureType, features){
			that.setTransformation(that.map.transformation);
			that.features = features;
			that.drawLayerSnap();
			that.renderer.clearRect();
			that.drawLayer();
			that.map.renderer.drawImage(that.canvas,0,0,that.canvas.width,that.canvas.height);
		});
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

	CLASS_NAME : "GeoBeans.Layer.WFSLayer"

});
