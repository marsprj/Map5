/**
 * @classdesc
 * 多边形几何对象
 * @class
 * @extends {GeoBeans.Geometry}
 * @param {Array} rings 封闭的圆环集合
 */
GeoBeans.Geometry.Polygon = GeoBeans.Class(GeoBeans.Geometry,{

	rings : null,
	type : GeoBeans.Geometry.Type.POLYGON,
	
	initialize : function(rings){
		this.rings = rings;
		this.extent = this.computeExtent();
	},
	
	hit : function(x, y, t){
		if(!this.extent.contain(x, y)){
			return false;
		}
		
		var nc = 0; //number of shooted segment
		var rn = this.rings.length;
		for(var i=0; i<rn; i++){
			var r = this.rings[i];
			var ps = r.points;
			var pn = ps.length-1;
			var s,e;
			for(var j=0; j<pn; j++){
				s = ps[j];
				e = ps[j+1];
				if(this.isSegmentShooted(x, y, s, e)){
					nc++;
				}
			}
		}
		var mod = nc % 2;
		return (mod!=0);
	},
	
	computeExtent : function(){
		var extent = null;
		var len = this.rings.length;
		
		if(len<1){
			return null;
		}
		var l = this.rings[0];	
		extent = new GeoBeans.Envelope(l.extent.xmin,l.extent.ymin,l.extent.xmax,l.extent.ymax);
		
		var env = null;
		for(var i=1; i<len; i++){
			l = this.rings[i];
			extent.union(l.extent);
		}
		return extent;
	},
	
	getCrossedSegments : function(){
		
		
	},
	
	isSegmentShooted : function(x, y, spt, ept){
		if(Math.abs(spt.y-ept.y)<Number.EPSILON){
			//horizonal segment	
			if(Math.abs(y-spt.y)<Number.EPSILON){
				return false;
			}
			if(Math.abs(y-ept.y)<Number.EPSILON){
				return false;
			}
		}
		else{
			if(((y>spt.y) && (y<ept.y))||
			   ((y>ept.y) && (y<spt.y))){
				   if((x<spt.x)&&(x<ept.x)){
					   return true;
				   }
			}
		}
		return false;
	},

	getCentroid : function(){
		var x = 0.0;
		var y = 0.0;
		var pointsCount = 0;
		for(var i = 0; i < this.rings.length;++i){
			var ring = this.rings[i];
			if(ring == null){
				continue;
			}
			var points = ring.points;
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
	},

	toPointsArray : function(){
		var pointArray = [];
		for(var i = 0; i < this.rings.length; ++i){
			var ring = this.rings[i];
			if(ring == null){
				continue;
			}
			var points = ring.points;
			for(var j = 0; j < points.length; ++j){
				var point = points[j];
				var x = point.x;
				var y = point.y;
				pointArray.push(x);
				pointArray.push(y);
			}
		}
		return pointArray;
	},


	getOutRing : function(){
		if(this.rings == null){
			return null;
		}
		if(this.rings.length == 1){
			return this.rings[0];
		}

		var out = this.rings[0];
		if(out.extent == null){
			return null;
		}
		for(var i=1; i < this.rings.length;++i){
			var ring = this.rings[i];
			if(ring == null){
				continue;
			}
			var extent = ring.extent;
			if(extent.contain(out.extent)){
				out = ring;
			}
		}
		return out;
	},	

});
