

GeoBeans.Overlay = GeoBeans.Class({
	geometry : null,
	symbolizer : null,
	id : null,
	layer : null,
	loadFlag : null,
	visible : true,


	initialize : function(id,geometry,symbolizer){
		this.id = id;
		this.geometry = geometry;
		this.symbolizer = symbolizer;
		this.loadFlag = GeoBeans.Overlay.Flag.READY;
		this.visible = true;
	},

	setLayer : function(layer){
		this.layer = layer;
	},

	draw : function(){
		if(this.visible){
			this.loadFlag = GeoBeans.Overlay.Flag.LOADED;
			var transformation = this.layer.map.transformation;
			this.layer.renderer.setSymbolizer(this.symbolizer);
			this.layer.renderer.drawGeometry(this.geometry,this.symbolizer,
				transformation);			
		}
	},

	setVisible : function(visible){
		this.visible = visible;
	}


});

GeoBeans.Overlay.Type = {
	MARKER : 'Marker',
	PLOYLINE : 'Polyline',
	CIRCLE : 'Circle'


};

GeoBeans.Overlay.Flag = {
	READY : "ready",
	LOADED : "loaded"
};