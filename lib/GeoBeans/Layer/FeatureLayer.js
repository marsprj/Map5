GeoBeans.Layer.FeatureLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	features : null,
	
	style : null,
		
	geometryType : null,
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.features = [];
	},
	
	destory : function(){
		this.features = null;
		this.style = null;
		this.renderer = null;
		this.geometryType = null;
		
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
	},
	
	addFeature : function(feature){
		if(feature!=null){
			this.features.push(feature);
		}
	},
	
	addFeatures : function(featuers){
		if(features==null){
			return;	
		}
		if(!(features instanceof Array)){
			return ;
		}
		for(var i=0,len=features.length; i<len; i++){
			var f = features[i];
			this.features.push(f);
		}
	},
	
	getFeature : function(i){
		if(i<0){
			return null;
		}
		if(i>=this.features.length){
			return null;
		}
		return this.features[i];
	},
	
	setStyle : function(style){
		this.style = style;
	},
	
	count : function(){
		return this.features.length;
	},
	
	draw : function(){
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
	
	drawFeatures : function(rule){
		var feature = null;
		for(var i=0,len=this.features.length; i<len; i++){
			feature = this.features[i];
			this.map.renderer.draw(feature, rule.symbolizer, this.map.transformation);
		}
	},
	
	init : function(){
	}
});