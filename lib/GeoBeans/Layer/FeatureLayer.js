
GeoBeans.Layer.FeatureLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	features : null,
	
	style : null,
		
	geometryType : null,
	
	featureType : null,
	
	enableHit : false,
	selection : null,
	unselection : null,

	hitControl : null,
	hitEvent : null,
	hitTooltipEvent : null,

	//选中的绘制图层
	hitCanvas : null,
	hitRenderer : null,
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.featureType = null;
		
		this.selection = [];
		this.unselection = [];
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
	/******************************************************************/
	/* Draw Layer                                                     */
	/******************************************************************/
	drawLayer : function(){
		// this.renderer.clearRect();

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
				if(rule.symbolizer instanceof GeoBeans.Style.PointSymbolizer){
					var symbolizer = rule.symbolizer;
					if(symbolizer.icon_url!=null){
						this.renderer.drawIcons(features, rule.symbolizer, this.map.transformation);
					}else{
						this.drawFeatures(features, rule.symbolizer);
					}
				}
				else{
					this.drawFeatures(features, rule.symbolizer);
				}
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
		

		this.renderer.save();
		this.renderer.setSymbolizer(symbolizer);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			if((symbolizer!=null) && (symbolizer!='undefined')){
				this.renderer.draw(feature, symbolizer, this.map.transformation);
			}
		}
		this.renderer.restore();
	},
	
	labelFeatures : function(features, symbolizer){
		var len = features.length;
		if(len == 0){
			return;
		}
		
		this.map.renderer.save();
		this.map.renderer.setSymbolizer(symbolizer);
		
		var feature = features[0];
		var findex = feature.featureType.getFieldIndex(symbolizer.field);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			this.map.renderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
		}
		this.map.renderer.restore();
	},
	
	drawFeature : function(feature, symbolizer){

		var rules = this.selectRules(feature);
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			if( (symbolizer==null) || (symbolizer=='undefined')){
				symbolizer = r.symbolizer;
			}
			this.map.renderer.save();
			this.map.renderer.setSymbolizer(symbolizer);
			if(symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				var findex = feature.featureType.getFieldIndex(symbolizer.field);
				this.map.renderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
			}
			else{
				this.map.renderer.draw(feature, symbolizer, this.map.transformation);
			}
			this.map.renderer.restore();
		}
		rules = null;
	},
	
	clearFeature : function(feature){
		switch(feature.geometry.type){
			case GeoBeans.Geometry.Type.POINT:
			case GeoBeans.Geometry.Type.MULTIPOINT:{
					var s = this.getSymbolizer(feature);
					this.map.renderer.clear(feature.geometry, this.map.bgColor, s.size, this.map.transformation);	
				}
				break;
			default:{
				this.map.renderer.clear(feature.geometry, this.map.bgColor, 0, this.map.transformation);
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
	
	selectRules : function(f){
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
					if(value==r.filter.value){
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
	
	getSymbolizer : function(feature){
		var rules = this.selectRules(feature);
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			var s = r.symbolizer;
			if(!(s instanceof GeoBeans.Style.TextSymbolizer)){
				return s;
			}
		}
		return null;
	},
	/******************************************************************/
	/* Draw Layer End                                                 */
	/******************************************************************/

	setHitControl : function(control){
		if((control==null) || (control=='undefined')){
			return;
		}
		this.hitControl = null;
		this.hitControl = control;
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
		
		// this.unselection = this.selection;
		this.selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					this.selection.push(f);
				}
			}
		}
		
		// //去掉this.unselection中仍被hit的feature
		// var of=null, nf=null;
		// var on = this.unselection.length;
		// var nn = this.selection.length;
		// for(i=on; i>=0; i--){
		// 	of = this.unselection[i];
		// 	for(j=0; j<nn; j++){
		// 		nf = this.selection[j];
		// 		if(of==nf){
		// 			this.unselection.splice(i,1);
		// 			break;
		// 		}
		// 	}
		// }
		
		// //重绘未被选中的Feature
		// on = this.unselection.length;
		// for(i=0; i<on; i++){
		// 	of = this.unselection[i];
		// 	this.clearFeature(of);
		// 	this.drawFeature(of);
		// }
		
		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawHitLayer();
		if(callback!=undefined){
			callback(this, this.selection);
		}
	},
	
	registerHitEvent : function(callback){
		var map = this.map;
		var layer = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;

		this.hitCanvas = document.createElement("canvas");
		this.hitCanvas.width = this.canvas.width;
		this.hitCanvas.height = this.canvas.height;

		this.hitRenderer  = new GeoBeans.Renderer(this.hitCanvas);


		this.hitEvent = function(evt){
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
		map.canvas.addEventListener('mousemove', this.hitEvent);
		this.events.addEvent('mousemove', this.hitEvent);
	},

	unRegisterHitEvent : function(){
		this.map.canvas.removeEventListener('mousemove',this.hitEvent);
		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawHitLayer();
	},
	//绘制选中的图层
	drawHitFeature : function(feature, symbolizer){

		var rules = this.selectRules(feature);
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			if( (symbolizer==null) || (symbolizer=='undefined')){
				symbolizer = r.symbolizer;
			}
			this.hitRenderer.save();
			this.hitRenderer.setSymbolizer(symbolizer);
			if(symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				var findex = feature.featureType.getFieldIndex(symbolizer.field);
				this.hitRenderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
			}
			else{
				this.hitRenderer.draw(feature, symbolizer, this.map.transformation);
			}
			this.hitRenderer.restore();
		}
		rules = null;

		this.map.drawHitLayer();
	},	

	cleanup : function(){

		// this.enableHit(false);
		this.enableHit = false;
		this.map.canvas.removeEventListener('mousemove', this.hitEvent);
		this.map.canvas.removeEventListener('mousemove', this.hitTooltipEvent);
		
	},
	

	registerHitTooltipEvent : function(callback){
		var map = this.map;
		var layer = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;

		this.hitTooltipEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					// var mp = map.transformation.toMapPoint(evt.layerX, evt.layerY);
					
					// layer.hitTooltip(mp.x, mp.y, callback);
					layer.hitTooltip(evt.layerX, evt.layerY, callback);
				}
			}
			
		};

		map.canvas.addEventListener("mousemove", this.hitTooltipEvent);
	},

	hitTooltip : function(x, y, callback){
		if(this.features==null || callback == null){
			return;
		}
		var map = this.map;
		var mp = map.transformation.toMapPoint(x, y);

		var layerX = mp.x;
		var layerY = mp.y;

		var render = this.map.renderer;
		var transformation = this.map.transformation;

		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(layerX, layerY, this.map.tolerance)){
					callback(this,x,y,f);
					return;
				}
			}
		}
		callback(this,x,y,null);		
	},

	CLASS_NAME : "GeoBeans.Layer.FeatureLayer"
});
