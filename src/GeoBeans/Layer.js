/**
 * @classdesc
 * Map5的图层类。
 * @class
 */
GeoBeans.Layer = GeoBeans.Class({
	
	id : null,
	
	name : null,
	
	visible : true,
	
	srid : "EPSG:4326",
	
	extent : null,
	
	map : null,
	
	events : null,

	canvas : null,

	renderer : null,

	mapPoint_lt : null,
	mapPoint_rb : null,

	transformation_brf : null,

	flag : null,
	
	initialize : function(name){
		this.name = name;
		this.events = new GeoBeans.Events();

		this.flag = GeoBeans.Layer.Flag.READY;
	},
	
	destroy : function(){
		this.name = null;
		this.events = null;
		
	},
	
	setName : function(newName){
		this.name = newName
	},
	
	setMap : function(map){
		this.map = map;
		var mapCanvas = this.map.canvas;
		if(mapCanvas == null){
			return;
		}
		var mapCanvasHeight = mapCanvas.height;
		var mapCanvasWidth = mapCanvas.width;

		this.canvas = document.createElement("canvas");
		this.canvas.height = mapCanvasHeight;
		this.canvas.width = mapCanvasWidth;


		this.renderer = new GeoBeans.Renderer(this.canvas);
	},
	
	setVisiable : function(visible){
		this.visible = visible;
	},
	
	getExtent : function(){
		return this.extent;
	},
	
	draw : null,
	
	load : null,

	
	unregisterEvents : function(){
		
	},

	cleanup : function(){},


	setTransformation : function(transformation){
		if(transformation == null || transformation.view_c == null){
			return;
		}
		this.transformation_brf = new GeoBeans.Transformation();
		this.transformation_brf.map = transformation.map;
		this.transformation_brf.scale = transformation.scale;

		this.transformation_brf.view_c = new GeoBeans.Geometry.Point(transformation.view_c.x,
																	transformation.view_c.y);
		this.transformation_brf.view_h = transformation.view_h;
		this.transformation_brf.view_w = transformation.view_w;
		this.transformation_brf.win_cx = transformation.win_cx;
		this.transformation_brf.win_cy = transformation.win_cy;
		this.transformation_brf.win_h = transformation.win_h;
		this.transformation_brf.win_w = transformation.win_w;

	},

	//绘制截屏
	drawLayerSnap : function(){
		
		var transformation = this.map.transformation;
		var viewer = this.map.viewer;
		if(viewer == null){
			return;
		}

		var map_lt = new GeoBeans.Geometry.Point(viewer.xmin,viewer.ymax);
		var map_rb = new GeoBeans.Geometry.Point(viewer.xmax,viewer.ymin);

		var screen_lt = this.transformation_brf.toScreenPoint(map_lt.x,map_lt.y);
		var screen_rb = this.transformation_brf.toScreenPoint(map_rb.x,map_rb.y);

		var width = screen_rb.x - screen_lt.x;
		var height = screen_rb.y - screen_lt.y;


		this.renderer.context.drawImage(this.canvas,screen_lt.x,screen_lt.y,
			width,height,0,0,this.map.canvas.width,this.map.canvas.height);
		this.map.renderer.drawImage(this.canvas,0,0);

		this.setTransformation(transformation);
	},

	CLASS_NAME : "GeoBeans.Layer"
});

/**
 * 单个图层重绘
 * @public
 * @return {[type]} [description]
 */
GeoBeans.Layer.prototype.refresh = function() {
	this.draw();
};


GeoBeans.Layer.Flag = {
	READY : "ready",
	LOADED : "loaded",
	ERROR : "error"
};