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
	featureType : null,
	
	
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

		if(this.features !=null){
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
			that.features = features;
			that.drawLayer();
		});
	},
	
	drawFeatures : function(rule){
		var feature = null;
		for(var i=0,len=this.features.length; i<len; i++){
			feature = this.features[i];
			this.map.renderer.draw(feature, rule.symbolizer, this.map.transformation);
		}
	},
	
	drawLayer : function(){
		var style = this.style;
		if(style==null){
			return;
		}
		rules = style.rules;
		if(rules.length==0){
			return;
		}
		for(var i=0; i<rules.length; i++){
			var rule = rules[i];
			this.drawFeatures(rule);
		}
	},
	
	setStyle : function(style){
		this.style = style;
	},
	
	cleanFeatures : function(){
		
	},

	
	CLASS_NAME : "GeoBeans.Layer.WFSLayer"

});
