GeoBeans.Geometry.Polygon = GeoBeans.Class(GeoBeans.Geometry,{

	rings : null,
	type : GeoBeans.Geometry.Type.POLYGON,
	
	initialize : function(rings){
		this.rings = rings;
	}	
});