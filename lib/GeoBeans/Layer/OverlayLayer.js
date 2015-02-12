GeoBeans.Layer.OverlayLayer = GeoBeans.Class(GeoBeans.Layer,{
	
	overlays : null,

	initialize : function(){
		this.overlays = [];

	},

	addOverlay : function(overlay){
		if(overlay == null){
			return;
		}
		overlay.setLayer(this);
		this.overlays.push(overlay);

	},

	addOverlays : function(overlays){
		for(var i = 0; i < overlays.length; ++i){
			var overlay = overlays[i];
			this.addOverlay(overlay);
		}
	},

	removeOverlay : function(id){

		var len = this.overlays.length;
		for(var i=len-1; i>=0; i--){
			var o = this.overlays[i];
			if(o.id == id){
				this.overlays.splice(i,1);
			}
		}

	},
	
	removeOverlays : function(ids){
		this.overlays = [];
	},

	load : function(){
		this.renderer.clearRect();
		for(var i = 0; i < this.overlays.length;++i){
			var overlay = this.overlays[i];
			overlay.draw();
		}

	},

	draw : function(){
		var flag = this.getLoadFlag();
		if(flag == GeoBeans.Layer.Flag.LOADED){
			this.map.drawLayersAll();
		}
	},

	getLoadFlag : function(){
		for(var i = 0; i < this.overlays.length;++i){
			var overlay = this.overlays[i];
			var flag = overlay.loadFlag;
			if(flag != GeoBeans.Overlay.Flag.LOADED){
				return GeoBeans.Layer.Flag.READY;
			}
		}
		return GeoBeans.Layer.Flag.LOADED;		

	}







});