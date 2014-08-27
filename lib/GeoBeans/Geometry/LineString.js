GeoBeans.Geometry.LineString = GeoBeans.Class(GeoBeans.Geometry,{
	
	points : null,
	type : GeoBeans.Geometry.Type.LINESTRING,
	
	initialize : function(points){
		this.points = points;		
	},
	
	destory : function(){
		this.points = null;
	}
});