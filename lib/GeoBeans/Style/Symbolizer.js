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

GeoBeans.Style.Symbolizer = GeoBeans.Class({
	shadowBlur	 : 0,
	shadowColor	 : "black",
	shadowOffsetX: 0,
	shadowOffsetY: 0,
	showShadow	 : false,
	
	initialize : function(size){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		//GeoBeans.Class.prototype.destroy.apply(this, arguments);
	},
});

GeoBeans.Style.PointSymbolizer = GeoBeans.Class(GeoBeans.Style.Symbolizer, {
	
	size 		 : 1.0,
	fillColor	 : "blue",
	outLineWidth : null,
	outLineColor : null,
	showOutline	 : false,
	icon_url	 : null,
	icon		 : null,
	icon_width	 : -1,
	icon_height  : -1,
	icon_offset_x: 0,
	icon_offset_y: 0,
	
	initialize : function(size){
		GeoBeans.Style.Symbolizer.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		GeoBeans.Style.Symbolizer.prototype.destroy.apply(this, arguments);
	},
});


GeoBeans.Style.LineSymbolizer = GeoBeans.Class(GeoBeans.Style.Symbolizer, {
	
	width : 1.0,
	color : "Red",
	lineCap : GeoBeans.Style.LineCap.BUTT,
	lineJoin : GeoBeans.Style.LineJoin.MITER,	
	
	initialize : function(){
		GeoBeans.Style.Symbolizer.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		GeoBeans.Style.Symbolizer.prototype.destroy.apply(this, arguments);
	},
});


GeoBeans.Style.PolygonSymbolizer = GeoBeans.Class(GeoBeans.Style.Symbolizer, {
	
	//fillColor	 : "Brown",
	fillColor	 : null,
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

GeoBeans.Style.TextSymbolizer = GeoBeans.Class(GeoBeans.Style.Symbolizer, {
	
	field		: null,
	fontFamily	: "Times New Roman",
	fontSize	: 10.0,
	fontWeight	: GeoBeans.Style.FontWeight.NORMAL,
	fontStyle	: GeoBeans.Style.FontStyle.NORMAL,
	
	fillColor	 : null,
	showFill	 : true,
	
	outLineWidth : null,
	outLineColor : null,
	outLineCap	 : null,
	outLineJoin  : null,
	showOutline	 : false,
	
	initialize : function(field){
		//GeoBeans.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){	
		//GeoBeans.prototype.destroy.apply(this, arguments);
	},
});