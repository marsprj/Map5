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
	
	workspace : null,
	
	
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
		if(this.features !=null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			this.drawLayerSnap();
			this.renderer.clearRect();
			this.drawLayer();
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
			that.map.drawLayers();
			that.flag = GeoBeans.Layer.Flag.LOADED;
		});				
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
	
	CLASS_NAME : "GeoBeans.Layer.WFSLayer"

});
