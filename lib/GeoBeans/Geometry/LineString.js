GeoBeans.Geometry.LineString = GeoBeans.Class(GeoBeans.Geometry,{
	
	points : null,
	type : GeoBeans.Geometry.Type.LINESTRING,
	
	initialize : function(points){
		this.points = points;		
		this.extent = this.computeExtent(this.points);
	},
	
	destory : function(){
		this.points = null;
	},
	
	distance : function(x, y){
		
		
	},
	
	computeExtent : function(points){
		var len = points.length;
		if(len==0){
			return null;
		}

		var pt = points[0];		
		var xmin = pt.x;
		var ymin = pt.y;
		var xmax = pt.x;
		var ymax = pt.y;

		for(var i=1; i<len; i++){
			pt = points[i];
			if(pt.x < xmin)		xmin = pt.x;
			if(pt.x > xmax)		xmax = pt.x;
			if(pt.y < ymin)		ymin = pt.y;
			if(pt.y > ymax)		ymax = pt.y;
		}

		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
	}
});