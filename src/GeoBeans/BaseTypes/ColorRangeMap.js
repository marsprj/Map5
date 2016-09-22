/**
 * @classdesc
 * 颜色谱对象
 * @class
 */
GeoBeans.ColorRangeMap = GeoBeans.Class({
	beginColor 	: null,
	endColor 	: null,
	min 		: null,
	max 		: null,
	beginColorHSV : null,
	endColorHSV : null,

	initialize : function(beginColor,endColor,min,max){
		this.beginColor = beginColor;
		this.endColor = endColor;
		this.min = min;
		this.max = max;

		var beginColorStr = this.beginColor.slice(1,this.beginColor.length);
		var endColorStr = this.endColor.slice(1,this.endColor.length);

		var beginColor_16 = parseInt("0x" + beginColorStr,16);
		var beginColorR = (beginColor_16 & 0xff0000) >> 16;
		var beginColorG = (beginColor_16 & 0x00ff00) >> 8;
		var beginColorB = (beginColor_16 & 0x0000ff) >> 0;
		this.beginColorHSV = this.rgb_2_hsv(beginColorR,beginColorG,beginColorB);


		var endColor_16 = parseInt("0x" + endColorStr,16);
		var endColorR = (endColor_16 & 0xff0000) >> 16;
		var endColorG = (endColor_16 & 0x00ff00) >> 8;
		var endColorB = (endColor_16 & 0x0000ff) >> 0;
		this.endColorHSV = this.rgb_2_hsv(endColorR,endColorG,endColorB);

	},

	getValue : function(value){

	    var h = this.getColorValue(this.beginColorHSV.h,this.endColorHSV.h,value);
	    var s = this.getColorValue(this.beginColorHSV.s,this.endColorHSV.s,value);
	    var v = this.getColorValue(this.beginColorHSV.v,this.endColorHSV.v,value);

	    var rgb = this.hsv_2_rgb(h,s,v);
	    color = new GeoBeans.Color();
    	
		color.set(parseInt(rgb.r),parseInt(rgb.g),parseInt(rgb.b),1);
    	return color;
	},

	getColorValue : function(pBegin,pEnd,value){
		var step = null;
		if(value < this.min){
			step = 0;
		}else if(value > this.max){
			step = this.max - this.min;
		}else{
			step = value - this.min;
		}
		if(pBegin < pEnd){
			return ((pEnd - pBegin)*(step/(this.max-this.min))) + pBegin;
	    }else{
			return ((pBegin - pEnd)*(1-(step/(this.max-this.min)))) + pEnd;
	    }
	},

	rgb_2_hsv : function(r,g,b){
		var h,s,v;
		var min_v = Math.min(r,g,b);
		var max_v = Math.max(r,g,b);

		v = max_v;
		var delta = max_v - min_v;
		if(max_v != 0){
			s = delta/max_v;
		}else{
			// r = g = b = 0 // s = 0, v is undefined
			s= 0;
			h = -1;
			return {
			 	h : h,
			 	s : s,
			 	v : v
			};
		}

		if(r == max_v){
			h = (g - b) / delta; //between yellow & magenta
		}else if(g == max_v){
			h = 2 + ( b - r ) / delta; // between cyan & yellow
		}else{
			h = 4 + ( r - g ) / delta; // between magenta & cyan
		}

		h *= 60; // degrees

		if( h < 0 )
		{
			h += 360;
		}
		return {
		 	h : h,
		 	s : s,
		 	v : parseFloat(v/255)
		};
	},

	hsv_2_rgb : function(h,s,v){
		var r,g,b;
		if(s == 0){
			// achromatic (grey)
			r = g = b= v;
			return {
				r : r*255,
				g : g*255,
				b : b*255
			}
		}
		h /= 60;
		var i = Math.floor(h);
		var f = h - i;
		var p = v * ( 1 - s );
		var q = v * ( 1 - s * f );
		var t = v * ( 1 - s * ( 1 - f ) );
		switch(i){
			case 0: 
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			default: // case 5:
				r = v;
				g = p;
				b = q;
				break;
			}			
		return {
			r : r*255,
			g : g*255,
			b : b*255
		};
	},


});