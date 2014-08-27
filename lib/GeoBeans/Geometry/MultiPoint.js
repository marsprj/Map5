GeoBeans.Geometry.MultiPoint = GeoBeans.Class(GeoBeans.Geometry,{
	
	points : null,
	type : GeoBeans.Geometry.Type.MULTIPOINT,
	
	initialize : function(points){
		this.points = points;		
	},
	
	destory : function(){
		this.points = null;
	}
});