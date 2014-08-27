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
	}
});
