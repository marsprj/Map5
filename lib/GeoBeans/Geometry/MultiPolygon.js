GeoBeans.Geometry.MultipolygonstringPolygon = GeoBeans.Class(GeoBeans.Geometry,{
	
	polygons : null,
	type : GeoBeans.Geometry.Type.MULTIPOLYGON,
	
	initialize : function(polygons){
		this.polygons = polygons;		
	},
	
	destory : function(){
		this.polygons = null;
	}
});