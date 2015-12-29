GeoBeans.Geometry.LinearRing = GeoBeans.Class(GeoBeans.Geometry.LineString,{
	
	points : null,
	
	initialize : function(points){
		GeoBeans.Geometry.LineString.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		GeoBeans.Geometry.LineString.prototype.destory.apply(this, arguments);
	},
	
	numPoints : function(){
		return this.points.length;
	}
});