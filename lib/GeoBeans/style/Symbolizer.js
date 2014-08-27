GeoBeans.Style.LineCap = {
	BUTT	: "butt",
	ROUND	: "round",
	SQUARE	: "square"
};

GeoBeans.Style.LineJoin = {
	BEVEL	: "bevel",	//斜角
	ROUND	: "round",	//圆角
	MITER	: "miter"	//默认。创建尖角。
};

GeoBeans.Style.FontStyle = {
	NORMAL	: "normal",
	ITALIC	: "italic",
	OBLIQURE: "oblique"
};

GeoBeans.Style.FontWeight = {
	NORMAL	: "normal",
	BOLD	: "bold",
	BOLDER	: "bolder",
	LIGHTER : "lighter"
};

GeoBeans.Style.PointSymbolizer = GeoBeans.Class({
	
	size 		 : 1.0,
	fillColor	 : "blue",
	outLineWidth : null,
	outLineColor : null,
	showOutline	 : false,
	
	initialize : function(size){
		GeoBeans.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		GeoBeans.prototype.destroy.apply(this, arguments);
	},
});


GeoBeans.Style.LineSymbolizer = GeoBeans.Class({
	
	width : 1.0,
	color : "Red",
	lineCap : GeoBeans.Style.LineCap.BUTT,
	lineJoin : GeoBeans.Style.LineJoin.MITER,	
	
	initialize : function(){
		GeoBeans.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		GeoBeans.prototype.destroy.apply(this, arguments);
	},
});


GeoBeans.Style.PolygonSymbolizer = GeoBeans.Class({
	
	fillColor	 : "Brown",
	outLineWidth : null,
	outLineColor : null,
	outLineCap	 : null,
	outLineJoin  : null,
	showOutline	 : false,
	
	initialize : function(){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){	
		//GeoBeans.Class.prototype.destroy.apply(this, arguments);
	},
});

GeoBeans.Style.TextSymbolizer = GeoBeans.Class({
	
	field		: null,
	fontFamily	: null,
	fontSize	: 10.0,
	fontWeight	: GeoBeans.Style.FontWeight.NORMAL,
	fontStyle	: GeoBeans.Style.FontStyle.NORMAL,
	
	initialize : function(name){
		GeoBeans.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		GeoBeans.prototype.destroy.apply(this, arguments);
	},
});