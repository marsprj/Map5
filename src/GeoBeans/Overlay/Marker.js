GeoBeans.Overlay.Marker = GeoBeans.Class(GeoBeans.Overlay,{

	image : null,

	type : GeoBeans.Overlay.Type.MARKER,

	options : null,
	
	initialize : function(id,geometry,symbolizer,options){
		GeoBeans.Overlay.prototype.initialize.apply(this, arguments);
		this.options = options;
	}
});