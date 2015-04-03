GeoBeans.ColorRamp = GeoBeans.Class({
	beginColor 	: null,
	endColor 	: null,
	number 		: null,

	initialize : function(beginColor,endColor,number){
		this.beginColor = beginColor;
		this.endColor = endColor;
		this.number = number;
	},

	getValues : function(){
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

		var theR,theG,theB,theVal,value,color,hex;
		var values = [];
	    for(var i = 0; i <= this.number; i++) {
	    	theR = this.interpolateColor(beginColorR, endColorR, i, this.number);
	      	theG = this.interpolateColor(beginColorG, endColorG, i, this.number);
	      	theB = this.interpolateColor(beginColorB, endColorB, i, this.number);
	    	color = new GeoBeans.Color();
	    	color.set(parseInt(theR),parseInt(theG),
	    				parseInt(theB),1);
	    	hex = color.getHex();
	    	console.log(hex);
	    	values.push(hex);
	    }		
	    return values;
	},

	interpolateColor : function(pBegin, pEnd, pStep, pMax) {
	    if(pBegin < pEnd){
			return ((pEnd - pBegin)*(pStep/pMax)) + pBegin;
	    }else{
			return ((pBegin - pEnd)*(1-(pStep/pMax))) + pEnd;
	    }
	}

});