GeoBeans.Layer.MapLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	style_name : null,
	style : null,
	geomType : null,
	fields : null,
	
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		
		this.style_name= null;
		
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
	},
	
	draw : function(){
	},


	setStyle : function(style){
		// this.style = style;
	}

});