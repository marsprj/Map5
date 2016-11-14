/**
 * @classdesc
 * 线几何对象
 * @class
 * @extends {GeoBeans.Geometry}
 * @param {Array} points 点坐标集合
 */
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
	
	hit : function(x, y, t){		
		if(!this.extent.contains(x, y)){
			return false;
		};
		
		var num = this.points.length-1;
		var p0=null, p1=null;
		var d=0;
		for(var i=0; i<num; i++){
			p0 = this.points[i];
			p1 = this.points[i+1];
			
			d = this.distance2segment(x, y, p0.x, p0.y, p1.x, p1.y);
			if(d<t){
				return true;
			}
		}
		return false;
	},
	

	
	distance2segment : function(x, y, x0, y0, x1, y1){
		
		var d = 0;
		if(Math.abs(x0-x1)<Math.ESPLON){
			// vertical
			var miny = y0 < y1 ? y0 : y1;
			var maxy = y0 > y1 ? y0 : y1;
			if((y>miny)&&(y<maxy)){
				d = Math.abs(x-x0);
			}
			else if(y<miny){
				d = Math.sqrt(Math.pow(x-x0, 2)+Math.pow(y-miny, 2));
			}
			else if(y>maxy){
				d = Math.sqrt(Math.pow(x-x0, 2)+Math.pow(y-maxy, 2));
			}
		}
		else if(Math.abs(y0-y1)<Math.ESPLON){
			// horizonal
			var minx = x0 < x1 ? x0 : x1;
			var maxx = x0 > x1 ? x0 : x1;
			if((x>minx)&&(x<maxx)){
				d = Math.abs(y-y0);
			}
			else if(x<minx){
				d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-minx, 2));
			}
			else if(y>maxy){
				d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-maxx, 2));
			}
		}
		else{
			var k_1  = -(x1-x0) / (y1-y0);
			var k_0 = -1 / k_1;
			var b_0 = y0 - k_0 * x0;
			var b_1 = y  - k_1 * x;

			var k_v = (k_1 - k_0);
			var xx  = (b_0 - b_1) / k_v;
			var yx  = k_1 * xx + b_1;

			var minx = x0 < x1 ? x0 : x1;
			var maxx = x0 > x1 ? x0 : x1;
			if(((xx>minx) && (xx<maxx)) || ((yx>miny) && (yx<maxy))){
				d = Math.sqrt(Math.pow(y-yx, 2)+Math.pow(x-xx, 2));
			}
			else{
				var d0 = Math.sqrt(Math.pow(y0-yx, 2)+Math.pow(x0-xx, 2));
				var d1 = Math.sqrt(Math.pow(y1-yx, 2)+Math.pow(x1-xx, 2));
				d = d0 < d1 ? d0 : d1;
			}		
		}
		return d;
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
	},

	getCentroid : function(){
		var x = 0.0;
		var y = 0.0;
		var pointsCount = 0;
		var point;
		for(var i = 0; i < this.points.length;++i){
			point = this.points[i];
			x += point.x;
			y += point.y;
		}
		x = x/pointsCount;
		y = y/pointsCount;
		var point = new GeoBeans.Geometry.Point(x,y);
		return point;
	}
});

/**
 * 计算点到线的距离
 * @param  {float} x 点的x坐标
 * @param  {float} y 点的y坐标
 * @return {float}   点到线的距离
 * @public
 * @override
 */
GeoBeans.Geometry.LineString.prototype.distance = function(x, y){
	var num = this.points.length-1;
	var p0=null, p1=null;
	var dmin=0,d=0;
	for(var i=0; i<num; i++){
		p0 = this.points[i];
		p1 = this.points[i+1];
		
		d = this.distance2segment(x, y, p0.x, p0.y, p1.x, p1.y);
		if(d<dmin){
			d = dmin;
		}
	}
	return dmin;
}