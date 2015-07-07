GeoBeans.ColorRangeMap = GeoBeans.Class({
	beginColor 	: null,
	endColor 	: null,
	min 		: null,
	max 		: null,

	initialize : function(beginColor,endColor,min,max){
		this.beginColor = beginColor;
		this.endColor = endColor;
		this.min = min;
		this.max = max;
	},

	getValue : function(value){
		// if(value < this.min )

		var beginColorStr = this.beginColor.slice(1,this.beginColor.length);
		var endColorStr = this.endColor.slice(1,this.endColor.length);

		var beginColor_16 = parseInt("0x" + beginColorStr,16);
		var beginColorR = (beginColor_16 & 0xff0000) >> 16;
		var beginColorG = (beginColor_16 & 0x00ff00) >> 8;
		var beginColorB = (beginColor_16 & 0x0000ff) >> 0;

		var endColor_16 = parseInt("0x" + endColorStr,16);
		var endColorR = (endColor_16 & 0xff0000) >> 16;
		var endColorG = (endColor_16 & 0x00ff00) >> 8;
		var endColorB = (endColor_16 & 0x0000ff) >> 0;

		theR = this.getColorValue(beginColorR, endColorR,value);
	    theG = this.getColorValue(beginColorG, endColorG, value);
	    theB = this.getColorValue(beginColorB, endColorB, value);

	    color = new GeoBeans.Color();
    	color.set(parseInt(theR),parseInt(theG),
    				parseInt(theB),1);
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
	}


});