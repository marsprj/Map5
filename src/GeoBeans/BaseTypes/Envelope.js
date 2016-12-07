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

GeoBeans.Envelope.prototype.intersectSegment = function(x0, y0, x1, y1){
	if(this.contains(x0, y0)){
		return true;
	}

	if(this.contains(x1, y1)){
		return true;
	}

	if(Math.abs(y0-y1)<GeoBeans.Math.EPSILON){
		var v1,v2;
		v1 = y0 < this.ymin ? -1 : 1;
		v2 = y1 < this.ymin ? -1 : 1;
		if(v1!=v2){
			return true;
		}
		else{
			v1 = y0 < this.ymax ? -1 : 1;
			v2 = y1 < this.ymax ? -1 : 1;
			if(v1!=v2){
				return true;
			}	
			else{
				return false;
			}
		}
	}
	else if(Math.abs(x0-x1)<GeoBeans.Math.EPSILON){
		var h1,h2;
		h1 = x0 < this.xmin ? -1 : 1;
		h2 = x1 < this.xmin ? -1 : 1;
		if(h1!=h2){
			return true;
		}
		else{
			h1 = x0 < this.xmax ? -1 : 1;
			h2 = x1 < this.xmax ? -1 : 1;
			if(h1!=h2){
				return true;
			}	
			else{
				return false;
			}
		}
	}
	else{
		var x,y;
		var k = (y1-y0) / (x1-x0);
		//左边界
		y = k * (this.xmin - x0) + y0;
		if( (y>=this.ymin) && (y<this.ymax)){
			return true;
		}

		//右边界
		y = k * (this.xmax - x0) + y0;
		if( (y>=this.ymin) && (y<this.ymax)){
			return true;
		}		

		//上边界
		x = (this.ymin - y0) / k + x0;
		if( (x>=this.xmin) && (x<this.xmax)){
			return true;
		}

		//下边界
		x = (this.ymax - y0) / k + x0;
		if( (x>=this.xmin) && (x<this.xmax)){
			return true;
		}		

	}

	return false;
}

// GeoBeans.Envelope.prototype.intersectSegment = function(x0, y0, x1, y1){
// 	var h1,h2,v1,v2;
// 	var intersects = false;
// 	//左边界
// 	h1 = x0 < this.xmin ? -1 : 1;
// 	h2 = x1 < this.xmin ? -1 : 1;
// 	//判断h1和h2的符号。
// 	//1）如果h1和h2符号不同，说明线段[x0,y0]-[x1,y1]位于左边界两侧，可能相交。
// 	//   此时需要判断与上下便边界是否相交
// 	//2）如果h1和h2符号不同，说明位于左边界同侧，不可能相交。
// 	if(h1!=h2){
// 		//判断与上边界的符号。
// 		v1 = y0 < this.ymin ? -1 : 1;
// 		v2 = y1 < this.ymin ? -1 : 1;
// 		if(v1!=v2){
// 			intersects = true;
// 		}
// 		else{
// 			//位于上边界的同侧，则判断与下边界是否相交
// 			if(h1<0){
// 				//这种情况说明,segment位于上边界上方，无需处理
// 			}
// 			else{
// 				v1 = y0 < this.ymax ? -1 : 1;
// 				v2 = y1 < this.ymax ? -1 : 1;
// 				if(v1!=v2){
// 					intersects = true;		
// 				}
// 			}
// 		}
// 	}
// 	else{
// 		//处理右边界的情况
// 		if(h1>0){
// 			h1 = x0 < this.xmax ? -1 : 1;
// 			h2 = x1 < this.xmax ? -1 : 1;
// 			if(h1!=h2){
// 				//判断与上边界的符号。
// 				v1 = y0 < this.ymin ? -1 : 1;
// 				v2 = y1 < this.ymin ? -1 : 1;
// 				if(v1!=v2){
// 					intersects = true;
// 				}
// 				else{
// 					//位于上边界的同侧，则判断与下边界是否相交
// 					if(h1<0){
// 						//这种情况说明,segment位于上边界上方，无需处理
// 					}
// 					else{
// 						v1 = y0 < this.ymax ? -1 : 1;
// 						v2 = y1 < this.ymax ? -1 : 1;
// 						if(v1!=v2){
// 							intersects = true;		
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// 	return intersects;
// }

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