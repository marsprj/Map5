GeoBeans.Envelope = GeoBeans.Class({
	xmin : null,
	xmax : null,
	ymin : null,
	ymax : null,
	
	initialize : function(xmin, ymin, xmax, ymax){
		this.xmin = xmin;
		this.ymin = ymin;
		this.xmax = xmax;
		this.ymax = ymax;
	},
	
	getWidth : function(){
		return this.xmax - this.xmin;
	},
	
	getHeight : function(){
		return this.ymax - this.ymin;
	},
	
	getCenter : function(){
		var x = (this.xmin + this.xmax) / 2;
		var y = (this.ymin + this.ymax) / 2;
		var c = new GeoBeans.Geometry.Point(x, y);
		return c;
	},
	offset : function(ox, oy){
		this.xmin += ox;
		this.xmax += ox;
		this.ymin += oy;
		this.ymax += oy;
	}, 
	
	union : function(other){
		this.xmin = this.xmin < other.xmin ? this.xmin : other.xmin;
		this.xmax = this.xmax > other.xmax ? this.xmax : other.xmax;
		this.ymin = this.ymin < other.ymin ? this.ymin : other.ymin;
		this.ymay = this.ymay > other.ymay ? this.ymay : other.ymay;
	},
	
	contain : function(x, y){
		if((x > this.xmin) && (x < this.xmax) && 
   		   (y > this.ymin) && (y < this.ymax)){
		   return true;
		}
		return false;
	}
});
