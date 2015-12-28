GeoBeans.Overlay.Marker = GeoBeans.Class(GeoBeans.Overlay,{

	image : null,

	type : GeoBeans.Overlay.Type.MARKER,

	initialize : function(geometry,symbolizer){
		GeoBeans.Overlay.prototype.initialize.apply(this, arguments);
	}

})