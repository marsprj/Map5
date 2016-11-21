/**
 * @classdesc
 * 矩形对象
 * @class
 */
GeoBeans.Envelope = GeoBeans.Class({
	xmin :  Number.MAX_VALUE,
	xmax : -Number.MAX_VALUE,
	ymin :  Number.MAX_VALUE,
	ymax : -Number.MAX_VALUE,
	
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
	
	containOther : function(other){
		if(other == null){
			return false;
		} 
		return (this.xmin <= other.xmin)&&(this.xmax > other.xmax) 
			&&(this.ymin < other.ymin) && (this.ymax > other.ymax);
	},
	
	scale : function(scale){
		var cx = (this.xmin + this.xmax) / 2;
		var cy = (this.ymin + this.ymax) / 2;
		var nw_2 = (this.xmax - this.xmin) * scale / 2;
		var nh_2 = (this.ymax - this.ymin) * scale / 2;
		
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
		if(viewer == null){
			return false;
		}

		if(Math.abs(this.xmin - viewer.xmin) < Number.EPSILON 
			&& Math.abs(this.xmax - viewer.xmax) < Number.EPSILON 
			&& Math.abs(this.ymin - viewer.ymin) < Number.EPSILON 
			&& Math.abs(this.ymax - viewer.ymax) < Number.EPSILON){
			return true;
		}else{
			return false;
		}
	}
});

GeoBeans.Envelope.prototype.clone = function(){
	return (new GeoBeans.Envelope(this.xmin, 
								  this.ymin, 
								  this.xmax, 
								  this.ymax));
}

/**
 * 将Envelope的中心点移动到指定点
 * @param  {double} x x坐标
 * @param  {double} y x坐标
 */
GeoBeans.Envelope.prototype.moveTo = function(x, y){
	var c = this.getCenter()
	var ox = x - c.x;
	var oy = y - c.y;
	this.offset(ox,oy);
}

/**
 * 判断Envelope是否包含点
 * @param  {double} x x坐标
 * @param  {double} y x坐标
 * @return {Boolean} true  包含
 *                   false 不包含
 */
GeoBeans.Envelope.prototype.contains = function(x, y){
	if((x > this.xmin) && (x < this.xmax) && 
		   (y > this.ymin) && (y < this.ymax)){
	   return true;
	}
	return false;
}

/**
 * 判断Envelope是否与另一个Envelope相交
 * @param  {GeoBeans.Envelope} other 另一个Envelope
 * @return {Boolean} true  相交
 *                   false 不相交
 */
GeoBeans.Envelope.prototype.intersects = function(other){
	if(!isValid(other)){
		return false;
	}
	var xmin = this.xmin > other.xmin ? this.xmin : other.xmin;
	var xmax = this.xmax < other.xmax ? this.xmax : other.xmax;

	var ymin = this.ymin > other.ymin ? this.ymin : other.ymin;
	var ymax = this.ymax < other.ymax ? this.ymax : other.ymax;

	return (xmin < xmax) && (ymin < ymax) ;
}

/**
 * 判断Envelope是否合法
 * @return {Boolean} true  合法
 *                   false 不合法
 * @description Envelope合法性判断的标准是xmin<xmax && ymin<ymax
 */
GeoBeans.Envelope.prototype.isValid = function(){
	if(this.xmin >= this.max){
		return false;
	}
	if(this.ymin >= this.ymax){
		return false;
	}
	return true;
}