GeoBeans.Color = GeoBeans.Class({
	r : null,
	g : null,
	b : null,
	a : null,

	initialize : function(){
		// this.r = Math.random()*255;
		// this.g = Math.random()*255;
		// this.b = Math.random()*255;
		// this.a = Math.random();
		this.r = parseInt(Math.random()*255);
		this.g = parseInt(Math.random()*255);
		this.b = parseInt(Math.random()*255);
		this.a = 1;
	},

	set : function(r,g,b,a){
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	},

	setByHex : function(hex,a){
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

	},

	setByRgb : function(rgb,a){
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
	},

	getRgb : function(){
		return "rgb(" + this.r + "," + this.g + 
			"," + this.b + ")";
	},

	getRgba : function(){
		return "rgba(" + this.r + "," + this.g 
			+ "," + this.b + "," + this.a + ")";
	},

	getOpacity : function(){
		return this.a;
	},


	zero_fill_hex : function(num, digits){
		var s = num.toString(16);
		while (s.length < digits)
	    	s = "0" + s;
		return s;
	},

	getHex : function(){
		var rgb = this.getRgb();
		if (rgb.charAt(0) == '#'){
			return rgb;
		}
		var ds = rgb.split(/\D+/);
		var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
		return "#" + this.zero_fill_hex(decimal, 6);		
	}


});