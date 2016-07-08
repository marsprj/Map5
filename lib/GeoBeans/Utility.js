GeoBeans.Utility  = {
	getDistance : function(x,y,x1,y1){
		return Math.sqrt((x - x1)*(x - x1) + (y - y1)*(y - y1));
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


	// 随机数
	getRandom : function(min,max){
		var range = max - min;
		var rand = Math.random();

		return min + Math.round(rand * range);
	}
};