GeoBeans.Geometry.Circle = GeoBeans.Class(GeoBeans.Geometry,{
	center : null,
	radius : null,

	type : GeoBeans.Geometry.Type.CIRCLE,

	initialize : function(center,radius){
		this.center = center;
		this.radius = radius;
	},

	hit : function(x,y){
		var d = Math.abs(this.center.x -x) + Math.abs(this.center.y - y);
		return (d <= this.radius);
	},
});