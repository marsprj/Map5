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
			if((y>=miny)&&(y<=maxy)){
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
			if((x>=minx)&&(x<=maxx)){
				d = Math.abs(y-y0);
			}
			else if(x<minx){
				d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-minx, 2));
			}
			else if(x>maxx){
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
			var miny = y0 < y1 ? y0 : y1;
			var maxy = y0 > y1 ? y0 : y1;
			if((xx>minx) && (xx<maxx)){
				d = Math.sqrt(Math.pow(y-yx, 2)+Math.pow(x-xx, 2));
			}
			else{
				var d0 = Math.sqrt(Math.pow(y0-y, 2)+Math.pow(x0-x, 2));
				var d1 = Math.sqrt(Math.pow(y1-y, 2)+Math.pow(x1-x, 2));
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
	},

	_getClockDirection : function(points){
		if(points == null || !($.isArray(points))){
			return null;
		}
		var length = points.length;
		var point = null;
		var yTrans = -1;
		var count = 0;
		var j = null,k = null,z = null;
		for(var i = 0; i < length;++i){
			j = (i + 1) % length;  
            k = (i + 2) % length;  
			point = points[i];
			z = (points[j].x - points[i].x) * (points[k].y * yTrans - points[j].y * yTrans);  
            z -= (points[j].y * yTrans - points[i].y * yTrans) * (points[k].x - points[j].x);  
            if(z < 0){
            	count --;
            }else if(z > 0){
            	count ++;
            }
		}

		if(count>0){
			return "Counterclockwise";
		}else if(count < 0){
			return "Clockwise";
		}else{
			return null;
		}
	},

	/**
	 * 获取和y轴之间的角度
	 * @public
	 * @param  {float} px 中心点x
	 * @param  {float} py 中心点y
	 * @param  {float} mx 待求点x
	 * @param  {float} my 待求点y
	 * @return {float}    角度
	 */
	getAngle : function(px,py,mx,my){
      	var x = Math.abs(px-mx);
        var y = Math.abs(py-my);
        var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        var cos = y/z;
        var radina = Math.acos(cos);//用反三角函数求弧度
        var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

        if(mx>px && my<py){
        	angle = 180 - angle;
        }else if(mx>px && my == py){
        	angle = 90;
        }else if(mx == px && my > py){
        	angle = 180;
        }else if(mx < px && my < py){
        	angle = 180 + angle;
        }else if(mx < px && my == py){
        	angle = 270;
        }else if(mx < px && my > py){
        	angle = 360 - angle;
        }

        // if(mx>px&&my>py){//鼠标在第四象限
        //     angle = 180 - angle;
        // }

        // if(mx==px&&my>py){//鼠标在y轴负方向上
        //     angle = 180;
        // }

        // if(mx>px&&my==py){//鼠标在x轴正方向上
        //     angle = 90;
        // }

        // if(mx<px&&my>py){//鼠标在第三象限
        //     angle = 180+angle;
        // }

        // if(mx<px&&my==py){//鼠标在x轴负方向
        //     angle = 270;
        // }

        // if(mx<px&&my<py){//鼠标在第二象限
        //     angle = 360 - angle;
        // }
		return angle;
	},


  	uuid : function (len, radix) {
  		var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var chars = CHARS, uuid = [], i;
		radix = radix || chars.length;

		if (len) {
		// Compact form
			for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
			} else {
				// rfc4122, version 4 form
				var r;

				// rfc4122 requires these characters
				uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
				uuid[14] = '4';

				// Fill in random data.  At i==19 set the high bits of clock sequence as
				// per rfc4122, sec. 4.1.5
				for (i = 0; i < 36; i++) {
					if (!uuid[i]) {
					   r = 0 | Math.random()*16;
					   uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
					}
				}
		}

		return uuid.join('');
   },


};


String.prototype.like = function(search) {
    if (typeof search !== 'string' || this === null) {return false; }
    // Remove special chars
    search = search.replace(new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g"), "\\$1");
    // Replace % and _ with equivalent regex
    search = search.replace(/%/g, '.*').replace(/_/g, '.');
    // Check matches
    return RegExp('^' + search + '$', 'gi').test(this);
};

function isValid(o){
	return ((o!=null) && (o!=undefined));
}

function isDefined(o){
	return ((o!=null) && (o!=undefined));
}

Math.ESPLON = 0.000001;