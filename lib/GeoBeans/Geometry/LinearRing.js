GeoBeans.Geometry.LinearRing = GeoBeans.Class(GeoBeans.Geometry,{
	
	points : null,
	
	initialize : function(points){
		this.points = points;		
	},
	
	destory : function(){
		this.points = null;
	},
	
	numPoints : function(){
		return this.points.length;
	}
});