GeoBeans.Overlay = GeoBeans.Class({
	geometry : null,
	symbolizer : null,
	id : null,
	layer : null,
	loadFlag : null,
	visible : true,
	isEdit : false,
	isHit : false,
	kvMap : {},

	// 弹出框网址
	htmlPath : null,


	initialize : function(id,geometry,symbolizer){
		this.id = id;
		this.geometry = geometry;
		this.symbolizer = symbolizer;
		this.loadFlag = GeoBeans.Overlay.Flag.READY;
		this.visible = true;
		this.kvMap = {};
	},

	destroy : function(){
		
		this.geometry.destroy();
		this.symbolizer.destroy();
		this.id = null;
		this.loadFlag = null;
		this.visible = null;
		this.kvMap = null;
		this.geometry = null;
		this.symbolizer = null;
	},

	setLayer : function(layer){
		this.layer = layer;
	},

	draw : function(){
		if(this.visible){
			this.loadFlag = GeoBeans.Overlay.Flag.LOADED;
			this.layer.renderer.setSymbolizer(this.symbolizer);
			this.layer.renderer.drawOverlay(this, this.symbolizer,this.layer.map.getMapViewer());			
		}
	},

	setVisible : function(visible){
		this.visible = visible;
	},

	beginEdit : function(){
		var symbolizer = this.layer.getEditOverlaySymbolizer(this);
		this.layer.drawEditOverlay(this,symbolizer);
		this.isEdit = true;
	},

	endEdit : function(){
		this.isHit = false;
		this.isEdit = false;
		this.layer.editOverlay = null;
		this.layer.editRenderer.clearRect();
		this.layer.map.drawLayersAll();
	},

	getKeyValueMap : function(){
		return this.kvMap;
	},

	hasKey : function(key){
		if(key in this.kvMap){
			return true;
		}else{
			return false;
		}
	},

	getValue : function(key){
		if(this.hasKey(key)){
			return this.kvMap[key];
		}else{
			return null;
		}
	},

	removeKey : function(key){
		if(this.hasKey(key)){
			delete this.kvMap[key];
		}
	},

	addKeyValue : function(key,value){
		if(this.hasKey(key)){
			return;
		}else{
			this.kvMap[key] = value;
		}
	},

	removeKeys : function(){
		for(var key in this.kvMap){
			this.removeKey(key);
		}
		this.kvMap = {};
	},

	clone : function(){
		var geometry = new GeoBeans.Geometry();
		geometry = this.geometry;

		var symbolizer = new GeoBeans.Style.Symbolizer();
		symbolizer = this.symbolizer;

		var kvMap_c = {};

		var id = this.id;
		var overlay = new GeoBeans.Overlay(id,geometry,symbolizer);
		overlay.visible = this.visible;
		overlay.isEdit = this.isEdit;
		overlay.isHit = this.isHit;

		for(var key in this.kvMap){
			var value = this.kvMap[key];
			kvMap_c[key] = value;
		}
		overlay.kvMap = kvMap_c;
		return overlay;
	},

	getExtent : function(){
		var geometry = this.geometry;
		var extent = null;
		if(this.type == GeoBeans.Overlay.Type.MARKER){
			var x = geometry.x;
			var y = geometry.y;
			extent = new GeoBeans.Envelope(x-1,y-1,x+1,y+1);
		}else{
			extent = geometry.extent;
		}
		return extent;
	}
});

GeoBeans.Overlay.Type = {
	MARKER : 'Marker',
	PLOYLINE : 'Polyline',
	CIRCLE : 'Circle',
	POLYGON : 'Polygon',
	LABEL : "label"
};

GeoBeans.Overlay.Flag = {
	READY : "ready",
	LOADED : "loaded"
};