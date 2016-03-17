GeoBeans.Overlay.Marker = GeoBeans.Class(GeoBeans.Overlay,{

	image : null,

	type : GeoBeans.Overlay.Type.MARKER,

	infoWindow : null,
	initialize : function(name,geometry,symbolizer,infoWindow){
		GeoBeans.Overlay.prototype.initialize.apply(this, arguments);
		this.infoWindow = infoWindow;
	}
})