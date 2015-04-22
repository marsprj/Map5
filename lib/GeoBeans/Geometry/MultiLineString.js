GeoBeans.Geometry.MultiLineString = GeoBeans.Class(GeoBeans.Geometry,{
	
	lines : null,
	type : GeoBeans.Geometry.Type.MULTILINESTRING,
	
	initialize : function(lines){
		this.lines = lines;	
		this.extent = this.computeExtent();
	},
	
	destory : function(){
		this.lines = null;
	},
	
	hit : function(x, y, t){		
		if(!this.extent.contain(x, y)){
			return false;
		};
		
		var num = this.lines.length;
		for(var i=0; i<num; i++){
			var l = this.lines[i];
			if(l.hit(x, y, t)){
				return true;
			}
		}
		return false;
	},
	
	computeExtent : function(){
		
		var extent = null;
		var len = this.lines.length;
		
		if(len<1){
			return null;
		}
		var l = this.lines[0];	
		extent = new GeoBeans.Envelope(l.extent.xmin,l.extent.ymin,l.extent.xmax,l.extent.ymax);
		
		var env = null;
		for(var i=1; i<len; i++){
			l = this.lines[i];
			extent.union(l.extent);
		}
		return extent;
	},


	getCentroid : function(){
		var x = 0.0;
		var y = 0.0;
		var pointsCount = 0;
		for(var i = 0; i < this.lines.length;++i){
			var line = this.lines[i];
			var points = line.points;
			pointsCount += points.length;
			for(var j = 0; j < points.length;++j){
				var point = points[j];
				x += point.x;
				y += point.y;
			}
		}
		x = x/pointsCount;
		y = y/pointsCount;
		var point = new GeoBeans.Geometry.Point(x,y);
		return point;
	}
	
});