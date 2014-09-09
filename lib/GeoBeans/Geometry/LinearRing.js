GeoBeans.Geometry.LinearRing = GeoBeans.Class(GeoBeans.Geometry.LineString,{
	
	points : null,
	
	initialize : function(points){
		GeoBeans.Geometry.LineString.prototype.initialize.apply(this, arguments);
		//this.points = points;		
	},
	
	destory : function(){
		GeoBeans.Geometry.LineString.prototype.destory.apply(this, arguments);
		//this.points = null;
	},
	
	numPoints : function(){
		return this.points.length;
	}
});