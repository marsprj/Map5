GeoBeans.Geometry.Point = GeoBeans.Class(GeoBeans.Geometry,{
	
	x : null,
	y : null,
	
	type : GeoBeans.Geometry.Type.POINT,
	
	initialize : function(x, y){
		
		this.x = parseFloat(x);
		this.y = parseFloat(y);

		this.extent = new GeoBeans.Envelope(this.x, this.y,this.x,this.y);
	},
	
	hit : function(x, y, t){		
		var d = Math.abs(this.x-x) + Math.abs(this.y-y);
		return (d<t);
	},

	getCentroid : function(){
		return new GeoBeans.Geometry.Point(this.x,this.y);
	}
});