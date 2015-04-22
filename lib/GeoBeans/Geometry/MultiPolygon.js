GeoBeans.Geometry.MultiPolygon = GeoBeans.Class(GeoBeans.Geometry,{
	
	polygons : null,
	type : GeoBeans.Geometry.Type.MULTIPOLYGON,
	
	initialize : function(polygons){
		this.polygons = polygons;
		this.extent = this.computeExtent();
	},
	
	destory : function(){
		this.polygons = null;
	},
	
	hit : function(x, y, t){
		if(!this.extent.contain(x, y)){
			return false;
		}
		var p = null;
		var num = this.polygons.length;
		for(var i=0; i<num; i++){
			p = this.polygons[i];
			if(p.hit(x, y)){
				return true;
			}
		}
		return false;
	},
	
	computeExtent : function(){
		
		var extent = null;
		var len = this.polygons.length;
		
		if(len<1){
			return null;
		}
		var l = this.polygons[0];	
		extent = new GeoBeans.Envelope(l.extent.xmin,l.extent.ymin,l.extent.xmax,l.extent.ymax);
		
		var env = null;
		for(var i=1; i<len; i++){
			l = this.polygons[i];
			extent.union(l.extent);
		}
		return extent;
	},

	getCentroid : function(){
		var x = 0.0;
		var y = 0.0;
		var pointsCount = 0;
		var polygon,rings,ring,points;
		for(var i = 0; i < this.polygons.length;++i){
			polygon = this.polygons[i];
			rings = polygon.rings;
			for(var j = 0; j < rings.length; ++j){
				ring = rings[j];
				points = ring.points;
				pointsCount += points.length;
				for(var k = 0; k < points.length;++k){
					point = points[k];
					x += point.x;
					y += point.y;
				}
			}
		}
		x = x/pointsCount;
		y = y/pointsCount;
		var point = new GeoBeans.Geometry.Point(x,y);
		return point;

	}
});