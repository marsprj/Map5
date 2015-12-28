GeoBeans.Geometry.Circle = GeoBeans.Class(GeoBeans.Geometry,{
	center : null,
	radius : null,

	type : GeoBeans.Geometry.Type.CIRCLE,

	initialize : function(center,radius){
		this.center = center;
		this.radius = radius;
	}
});