/**
 * @classdesc
 * 颜色对象
 * @class
 */
GeoBeans.Color = GeoBeans.Class({
	r : null,
	g : null,
	b : null,
	a : null,

	initialize = function(){
		this.r = parseInt(Math.random()*255);
		this.g = parseInt(Math.random()*255);
		this.b = parseInt(Math.random()*255);
		this.a = Math.random();
	}
}

/**
 * [set description]
 * @param {[type]} r [description]
 * @param {[type]} g [description]
 * @param {[type]} b [description]
 * @param {[type]} a [description]
 */
GeoBeans.Color.prototype.set = function(r,g,b,a){
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

/**
 * [setByHex description]
 * @param {[type]} hex [description]
 * @param {[type]} a   [description]
 */
GeoBeans.Color. prototype.setHex = function(hex,a){
		if(hex != null){
	    hex = hex.replace('#','');
	    var r = parseInt(hex.substring(0,2), 16);
	    var g = parseInt(hex.substring(2,4), 16);
	    var b = parseInt(hex.substring(4,6), 16);

	    this.r = r;
	    this.g = g;
	    this.b = b;			
	}

   	if(a != null){
   		this.a = parseFloat(a);
   	}		
}

/**
 * [getRgb description]
 * @return {[type]} [description]
 */
GeoBeans.Color.prototype.getRgb = function(){
	return "rgb(" + this.r + "," + this.g + 
		"," + this.b + ")";
}

/**
 * [getRgba description]
 * @return {[type]} [description]
 */
GeoBeans.Color.prototype.getRgba = function(){
	return "rgba(" + this.r + "," + this.g 
		+ "," + this.b + "," + this.a + ")";
}

/**
 * [getOpacity description]
 * @return {[type]} [description]
 */
GeoBeans.Color.prototype.getOpacity = function(){
	return this.a;
}

/**
 * [setOpacity description]
 * @param {[type]} opacity [description]
 */
GeoBeans.Color.prototype.setOpacity = function(opacity){
	this.a = opacity;
}

/**
 * [setRgb description]
 * @param {[type]} rgb [description]
 * @param {[type]} a   [description]
 */
GeoBeans.Color. prototype.setRgb = function(rgb,a){
	if(rgb != null){
		var index1 = rgb.indexOf("(");
		var index2 = rgb.indexOf(")");
		var rgbValue = rgb.slice(index1+1,index2);
		var r = rgbValue.slice(0,rgbValue.indexOf(","));
		var b = rgbValue.slice(rgbValue.lastIndexOf(",")+1,
						rgbValue.length);
		var g = rgbValue.slice(rgbValue.indexOf(",")+1,
						rgbValue.lastIndexOf(","));
		this.r = parseInt(r);
		this.g = parseInt(g);
		this.b = parseInt(b);
	}

	if(a != null){
		this.a = parseFloat(a);
	}
}

/**
 * [getHex description]
 * @return {[type]} [description]
 */
GeoBeans.Color.prototype.getHex = function(){
	var rgb = this.getRgb();
	if (rgb.charAt(0) == '#'){
		return rgb;
	}
	var ds = rgb.split(/\D+/);
	var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
	return "#" + this.zero_fill_hex(decimal, 6);		
}

/**
 * [clone description]
 * @return {[type]} [description]
 */
GeoBeans.Color.prototype.clone = function(){
	var clone = new GeoBeans.Color();
	clone.r = this.r;
	clone.g = this.g;
	clone.b = this.b;
	clone.a = this.a;
	return clone;
}

/**
 * [setHsl description]
 * @param {[type]} h [description]
 * @param {[type]} s [description]
 * @param {[type]} l [description]
 * @param {[type]} a [description]
 */
GeoBeans.Color. prototype.setHsl = function(h,s,l,a){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);

       
    }
    this.r = Math.round(r * 255);
    this.g = Math.round(g * 255);
    this.b = Math.round(b * 255);
	if(a != null){
		this.a = parseFloat(a);
	}
}

/**
 * [getHsl description]
 * @return {[type]} [description]
 */
GeoBeans.Color.prototype.getHsl = function(){
	var r = this.r/255, g = this.g/255, b = this.b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
    	h : h,
    	s : s,
    	l : l
    };
}

/**
 * [setAbgr description]
 * @param {[type]} abgr [description]
 */
GeoBeans.Color. prototype.setAbgr = function(abgr){
	if(abgr.length == 8){
		var a = parseInt(abgr.slice(0,2), 16);

		this.a = parseFloat(a/255);
		this.r = parseInt(abgr.slice(6,8), 16);
	    this.g = parseInt(abgr.slice(4,6), 16);
	    this.b = parseInt(abgr.slice(2,4), 16);
	}
}

/**
 * [zero_fill_hex description]
 * @private
 * @param  {[type]} num    [description]
 * @param  {[type]} digits [description]
 * @return {[type]}        [description]
 */
GeoBeans.Color.prototype.zero_fill_hex = function(num, digits){
	var s = num.toString(16);
	while (s.length < digits)
    	s = "0" + s;
	return s;
}
