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
		this.ymax = this.ymax > other.ymax ? this.ymax : other.ymax;
	},
	
	// 包含
	contain : function(x, y){
		if((x > this.xmin) && (x < this.xmax) && 
   		   (y > this.ymin) && (y < this.ymax)){
		   return true;
		}
		return false;
	},

	containOther : function(other){
		if(other == null){
			return false;
		} 
		return (this.xmin <= other.xmin)&&(this.xmax > other.xmax) 
			&&(this.ymin < other.ymin) && (this.ymax > other.ymax);
	},
	
	scale : function(rate){
		var cx = (this.xmin + this.xmax) / 2;
		var cy = (this.ymin + this.ymax) / 2;
		var nw_2 = (this.xmax - this.xmin) * rate / 2;
		var nh_2 = (this.ymax - this.ymin) * rate / 2;
		
		this.xmin = cx - nw_2;
		this.xmax = cx + nw_2;
		this.ymin = cy - nh_2;
		this.ymax = cy + nh_2;
	},

	toString : function(){
		var str = "";
		str += this.xmin + ",";
		str += this.ymin + ",";
		str += this.xmax + ",";
		str += this.ymax;
		return str;
	},

	equal : function(viewer){
		if(this.xmin == viewer.xmin && this.xmax == viewer.xmax 
			&& this.ymin == viewer.ymin && this.ymax == viewer.ymax){
			return true;
		}else{
			return false;
		}
	},

	//相交
	intersects : function(other){
		var xmin = this.xmin > other.xmin ? this.xmin : other.xmin;
		var xmax = this.xmax < other.xmax ? this.xmax : other.xmax;

		var ymin = this.ymin > other.ymin ? this.ymin : other.ymin;
		var ymax = this.ymax < other.ymax ? this.ymax : other.ymax;

		return (xmin < xmax) && (ymin < ymax) ;
	},

	// 沿着中心点旋转，逆时针角度
	rotate : function(angle){

		var x_min = this.xmin * Math.cos(angle * Math.PI/180) - this.ymin * Math.sin(angle * Math.PI/180);
		var y_min = this.xmin * Math.sin(angle * Math.PI/180) + this.ymin * Math.cos(angle * Math.PI/180);

		var x_max = this.xmax * Math.cos(angle * Math.PI/180) - this.ymax * Math.sin(angle * Math.PI/180);
		var y_max = this.xmax * Math.sin(angle * Math.PI/180) + this.ymax * Math.cos(angle * Math.PI/180);


		var xmin = (x_min < x_max) ? x_min : x_max;
		var xmax = (x_min > x_max) ? x_min : x_max;
		var ymin = (y_min < y_max) ? y_min : y_max;
		var ymax = (y_min > y_max) ? y_min : y_max;
		return new GeoBeans.Envelope(Math.round(xmin* 1000000)/1000000
			,Math.round(ymin* 1000000)/1000000
			,Math.round(xmax* 1000000)/1000000
			,Math.round(ymax* 1000000)/1000000);
	},

	// 旋转之后，
	rotateMaxMin : function(angle){
		var x_min = this.xmin * Math.cos(angle * Math.PI/180) - this.ymin * Math.sin(angle * Math.PI/180);
		var y_min = this.xmin * Math.sin(angle * Math.PI/180) + this.ymin * Math.cos(angle * Math.PI/180);

		var x_max = this.xmax * Math.cos(angle * Math.PI/180) - this.ymax * Math.sin(angle * Math.PI/180);
		var y_max = this.xmax * Math.sin(angle * Math.PI/180) + this.ymax * Math.cos(angle * Math.PI/180);

		var point_min = new GeoBeans.Geometry.Point(x_min,y_min);

		var point_max = new GeoBeans.Geometry.Point(x_max,y_max);

		return {
			min : point_min,
			max : point_max
		}
	}
});
