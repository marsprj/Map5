/**
 * @classdesc
 * 拾取要素控制
 * @class
 * @extends {GeoBeans.Control}
 */
GeoBeans.Control.FeatureHitControl = GeoBeans.Class(GeoBeans.Control, {
	
	map : null,
	layer : null,
	onmousemove : null,
	callback : null,
	tolerance : 10,

	selection : [],
	
	ptsymbol : null,
	lnsymbol : null,
	rnsymbol : null,
	
	initialize : function(layer, callback){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);
		this.type = "FeatureHitControl";
		this.layer = layer;
		this.map = layer.map;
		this.callback = callback;
		this.ptsymbol = this.createPointSymbolizer();
		this.lnsymbol = this.createLineSymbolizer();
		this.rnsymbol = this.createPolygonSymbolizer();
		if(this.map!=null){

		}
	},

	destory : function(){
		this.layer = null;
		this.enabled(false); 
		GeoBeans.Control.prototype.destory.apply(this, arguments);		
	},
	
	enable : function(f){
		if(this.map==null){
			return;
		}
		this.enabled = f;
		if(this.enabled){
			var x_o = null;
			var y_o = null;
			var that = this;
			this.onmousemove = function(e){
				if(x_o==null){
					x_o = e.layerX;
					y_o = e.layerY;
				}
				else{
					var dis = Math.abs(e.layerX-x_o) + Math.abs(e.layerY-y_o);
					if(dis > that.tolerance){
						//console.log(dis);
						x_o = e.layerX;
						y_o = e.layerY;					
						var mp = that.map.getViewer().toMapPoint(e.layerX, e.layerY);
						that.hit(mp.x, mp.y, that.callback);
					}
				}
			};
			this.map.canvas.addEventListener("mousemove", this.onmousemove);
		}
		else{
			this.map.canvas.addEventListener("mousemove", this.onmousemove);
			this.onmousemove = null;
		}
	},

	hit : function(x, y, callback){
		if(this.layer==null){
			return;
		}
		
		var features = this.layer.features;
		if(features==null){
			return;
		}

		var render = this.map.renderer;
		
		
		this.selection = [];
		//console.log(x + "," + y);
		var i=0, j=0;
		var f=null, g=null;
		var len = features.length;
		for(i=0; i<len; i++){
			f = features[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					this.selection.push(f);
				}
			}
		}
		
		this.map.restoreSnap();
		this.highlight(this.selection);
		if(callback!=undefined){
			callback(this.layer, this.selection);
		}
	},

	highlight : function(features){
		var renderer = this.map.renderer;
		var len = features.length;
		for(var i=0; i<len; i++){
			var f = features[i];
			var g = f.geometry;
			switch(g.type){
				case GeoBeans.Geometry.Type.POINT:
				case GeoBeans.Geometry.Type.MULTIPOINT:
					renderer.setSymbolizer(this.ptsymbol);
					renderer.drawGeometry(g,this.ptsymbol,this.map.getViewer());
					break;
				case GeoBeans.Geometry.Type.LINESTRING:
				case GeoBeans.Geometry.Type.MULTILINESTRING:
					renderer.setSymbolizer(this.lnsymbol);
					renderer.drawGeometry(g,this.lnsymbol,this.map.getViewer());
					break;
				case GeoBeans.Geometry.Type.POLYGON:
				case GeoBeans.Geometry.Type.MULTIPOLYGON:
					renderer.setSymbolizer(this.rnsymbol);
					renderer.drawGeometry(g,this.rnsymbol,this.map.getViewer());
					break;
			}
		}
	},

	createPointSymbolizer : function(){
		var symbolizer;
		symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		symbolizer.size = 5;
		symbolizer.fillColor = "rgba(255,0,0,0.25)";
		symbolizer.outLineWidth = 1.0;
		symbolizer.outLineColor = "rgba(255,255,0,0.55)";
		symbolizer.outLineCap	= GeoBeans.Style.Stroke.LineCapType.ROUND;
		symbolizer.outLineJoin  = GeoBeans.Style.Stroke.LineJoinType.ROUND;
		symbolizer.showOutline = true;
		return symbolizer
	},

	createLineSymbolizer : function(){
		var symbolizer;
		symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		symbolizer.width = 1;
		symbolizer.color = "Red";
		symbolizer.lineCap	= GeoBeans.Style.Stroke.LineCapType.ROUND;
		symbolizer.lineJoin  = GeoBeans.Style.Stroke.LineJoinType.ROUND;
		return symbolizer;
	},
	
	createPolygonSymbolizer : function(){
		var symbolizer;
		symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		symbolizer.size = 5;
		symbolizer.fillColor = "rgba(255,0,0,0.25)";
		symbolizer.outLineWidth = 1.0;
		symbolizer.outLineColor = "rgba(255,255,0,0.55)";
		symbolizer.outLineCap	= GeoBeans.Style.Stroke.LineCapType.ROUND;
		symbolizer.outLineJoin  = GeoBeans.Style.Stroke.LineJoinType.ROUND;
		symbolizer.showOutline = true;
		return symbolizer
	},
});