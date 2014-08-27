GeoBeans.Layer.MarkerLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	markers : null,	
	style : null,
		
	geometryType : null,
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.markers = [];
		this.isBaseLayer = false;
	},
	
	destory : function(){
		this.markers = null;
		this.renderer = null;
		
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
	},
	
	addMarker : function(marker){
		if(marker!=null){
			marker.setLayer(this);
			this.markers.push(marker);
		}
	},
	
	addMarkers : function(markers){
		if(markers==null){
			return;	
		}
		if(!(markers instanceof Array)){
			return ;
		}
		for(var i=0,len=markers.length; i<len; i++){
			var m = markers[i];
			m.setLayer(this);
			this.markers.push(m);
		}
	},
	
	count : function(){
		return this.markers.length;
	},
	
	init : function(){},
	
	draw : function(){
		var marker = null;
		for(var i=0,len=this.markers.length; i<len; i++){
			marker = this.markers[i];
			marker.draw();
		}
	},		
});