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
	
	initialize : function(name){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
		
		this.name = name;
		this.events = new GeoBeans.Events();
	},
	
	destory : function(){
		this.name = null;
		this.events = null;
		
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
	},
	
	setName : function(newName){
		this.name = newName
	},
	
	setMap : function(map){
		this.map = map;
		var mapCanvas = this.map.canvas;
		var mapCanvasHeight = mapCanvas.height;
		var mapCanvasWidth = mapCanvas.width;

		this.canvas = document.createElement("canvas");
		this.canvas.height = mapCanvasHeight;
		this.canvas.width = mapCanvasWidth;


		this.renderer = new GeoBeans.Renderer(this.canvas);

		// mapPoint_lt = map.transformation.toMapPoint(0,0);
		// mapPoint_rb = map.transformation.toMapPoint(mapCanvasWidth,mapCanvasHeight);


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

	drawLayerSnap : function(){
		// this.mapPoint_lt = this.map.transformation.toMapPoint(0,0);
		// this.mapPoint_rb = this.map.transformation.toMapPoint(this.canvas.width,this.canvas.height);

		// var transformation = this.map.transformation;
		// var screenPoint_lt = transformation.toScreenPoint(this.mapPoint_lt.x,this.mapPoint_lt.y);
		// var screenPoint_rb = transformation.toScreenPoint(this.mapPoint_rb.x,this.mapPoint_rb.y);

		// var width = screenPoint_rb.x - screenPoint_lt.x;
		// var height = screenPoint_rb.y - screenPoint_lt.y;
		// this.map.renderer.drawImage(this.canvas,screenPoint_lt.x,screenPoint_lt.y,
		// 						width,height);

		
		var transformation = this.map.transformation;
		var viewer = this.map.viewer;

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
