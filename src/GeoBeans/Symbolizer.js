/**
 * @classdesc
 * 几何对象样式基类。
 * @class
 */
GeoBeans.Symbolizer = GeoBeans.Class({
	type : null,

	initialize : function(){
		
	},

	destroy : function(){

	},

	clone : function(){
		
	}
});

GeoBeans.Symbolizer.Type = {
	Point 		: "point",
	Line 		: "line",
	Polygon		: "polygon",
	Text 		: "text",
	Raster 		: "raster" 
};
