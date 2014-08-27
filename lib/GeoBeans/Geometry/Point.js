GeoBeans.Geometry.Point = GeoBeans.Class(GeoBeans.Geometry,{
	
	x : null,
	y : null,
	
	type : GeoBeans.Geometry.Type.POINT,
	
	initialize : function(x, y){
		
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	}
});