function createSymbolizer1(){
	var symbolizer, rule, style;
	symbolizer = new GeoBeans.Style.PolygonSymbolizer();
	symbolizer.fillColor = "Red";
	symbolizer.showOutline = false;
	
	return symbolizer;
}

function createSymbolizer2(){
	var symbolizer, rule, style;
	symbolizer = new GeoBeans.Style.PolygonSymbolizer();
	symbolizer.fillColor = "Blue";
	symbolizer.outLineColor = "#471953";
	symbolizer.showOutline = true;
	
	return symbolizer;
}

var g_s_hited  = createSymbolizer1();
var g_s_normal = createSymbolizer2();
		
GeoBeans.Layer.FeatureLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	features : null,
	
	style : null,
		
	geometryType : null,
	
	enableHit : false,
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		//this.features = [];
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
	},
	
	enableHit : function(enable){
		this.enableHit = enable;
	},
	
	hit : function(x, y){
		if(this.features==null){
			return;
		}
		
		var render = this.map.renderer;
		var transformation = this.map.transformation;
		
		var len = this.features.length;
		for(var i=0; i<len; i++){
			var f = this.features[i];
			var g = f.geometry;
			if(g!=null){
				if(g.hit(x, y)){
					render.drawGeometry(g, g_s_hited, transformation);
				}else{
					render.drawGeometry(g, g_s_normal, transformation);
				}
			}
		}
	},
	
	resigterHitEvent : function(){
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
					
					layer.hit(mp.x, mp.y);
				}
			}
			
		};
		map.canvas.addEventListener('mousemove', hitEvent);
	},
	
	CLASS_NAME : "GeoBeans.Layer.FeatureLayer"
});
