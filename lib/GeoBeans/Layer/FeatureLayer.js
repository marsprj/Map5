
GeoBeans.Layer.FeatureLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	features : null,
	
	style : null,
		
	geometryType : null,
	
	featureType : null,
	
	enableHit : false,
	
	selection : null,
	selection_old : null,
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.featureType = null;
		
		this.selection = [];
		this.selection_old = [];
	},
	
	destory : function(){
		this.features = null;
		this.style = null;
		this.renderer = null;
		this.geometryType = null;
		
		this.featureType = null;
		
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
			var features = this.selectFeatures(rule.filter);						
			this.drawFeatures(features, rule.symbolizer);
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
			var features = this.selectFeatures(rule.filter);
			if(rule.symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				this.labelFeatures(features, rule.symbolizer);
			}
			else{
				this.drawFeatures(features, rule.symbolizer);
			}
		}
	},
	
	
//	drawFeatures : function(rule){
//		var feature = null;
//		for(var i=0,len=this.features.length; i<len; i++){
//			feature = this.features[i];
//			this.map.renderer.draw(feature, rule.symbolizer, this.map.transformation);
//		}
//	},

	drawFeatures : function(features, symbolizer){		
		if(features.length==0){
			return;
		}
		
		this.map.renderer.setSymbolizer(symbolizer);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			if((symbolizer!=null) && (symbolizer!='undefined')){
				this.map.renderer.draw(feature, symbolizer, this.map.transformation);
			}
		}
	},
	
	labelFeatures : function(features, symbolizer){
		var len = features.length;
		if(len == 0){
			return;
		}
		
		this.map.renderer(symbolizer);
		
		var feature = features[0];
		var findex = feature.featureType.getFieldIndex(symbolizer.field);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			this.map.renderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
		}
	},
	
	drawFeature : function(feature, symbolizer){
		var rules = this.selectRules();
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			if( (symbolizer==null) || (symbolizer=='undefined')){
				symbolizer = r.symbolizer;
			}
			this.map.renderer.setSymbolizer(symbolizer);
			if(symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				var findex = feature.featureType.getFieldIndex(symbolizer.field);
				this.map.renderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
			}
			else{
				this.map.renderer.draw(feature, symbolizer, this.map.transformation);
			}
		}
	},	

	selectFeatures : function(filter){
		if(filter==null){
			return this.features;
		}
		
		var selection = [];
		var fname = filter.field;
		var value = null;
		var findex = this.featureType.getFieldIndex(fname);
		if(findex >= 0){
			var f = null;
			var len = this.features.length;
			for(var i=0; i<len; i++){
				f = this.features[i];
				value = f.values[findex];
				if(value==filter.value){
					selection.push(f);
				}
			}
		}
		
		return selection;
	},
	
	selectRules : function(feature){
		var rules = [];
		
		if(this.style!=null){
			var len = this.style.rules.length;
			for(var i=0; i<len; i++){
				var r = this.style.rules[i];
				if(r.filter!=null){
					var fname = r.filter.field;
					var value = null;
					var findex = this.featureType.getFieldIndex(fname);
					value = f.values[findex];
					if(value==filter.value){
						rules.push(r);
					}	
				}
				else{
					rules.push(r);
				}
			}
		}
		return rules;
	},
	
	init : function(){
	},
	
	enableHit : function(enable){
		this.enableHit = enable;
	},
	
	hit : function(x, y, callback){
		if(this.features==null){
			return;
		}
		
		var render = this.map.renderer;
		var transformation = this.map.transformation;
		
		this.selection_old = this.selection;
		this.selection = [];
		
		var len = this.features.length;
		for(var i=0; i<len; i++){
			var f = this.features[i];
			var g = f.geometry;
			if(g!=null){
				if(g.hit(x, y)){
					this.selection.push(f);
				}
			}
		}
		if(callback!=undefined){
			callback(this, this.selection, this.selection_old);
		}
	},
	
	resigterHitEvent : function(callback){
		var map = this.map;
		var layer = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;
		var hitEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					var mp = map.transformation.toMapPoint(evt.layerX, evt.layerY);
					
					layer.hit(mp.x, mp.y, callback);
				}
			}
			
		};
		map.canvas.addEventListener('mousemove', hitEvent);
		this.events.addEvent('mousemove', hitEvent);
	},
	
	CLASS_NAME : "GeoBeans.Layer.FeatureLayer"
});
