// JavaScript Document
GeoBeans.Map = GeoBeans.Class({
	
	TOLERANCE : 10,
	
	mapDiv : null,
	/*
	 * HTML 5 canvas
	 */
	canvas : null,
	
	events : null,
	
	controls : null,
	
	/**
	 * 地图当前视口
	 **/
	viewer : null,
	
	/**
	 * center有默认值(0,0)
	 **/
	center : null,
	
	/**
	 * level有默认值null
	 **/
	level  : null,
	
	resolution : null,
	
	layers : null,
	
	baseLayer : null,
	
	srid : "EPGS : 4326",
	
	minScale : null,
	
	maxScale : null,
	
	width : null,
	
	height : null,
	
	renderer : null,
	
	bgColor : 'rgba(255,255,255,1)',
	
	tolerance : 5,
	
	transformation : null,
	
	/* set whether the map can be drag */
	dragable : true,
	
	snap : null,
	
	initialize: function (id, options) {
		
		this.layers = [];
		
		var mapDiv = document.getElementById(id);
		if(mapDiv == null){
			return;
		}
		this.mapDiv = $("#" + id);
		var mapCanvasHtml = "<canvas id='mapCanvas' height='" 
							+ $("#" + id).height() + "' width='" 
							+ $("#" + id).width() + "'></canvas>";

		$("#" + id).append(mapCanvasHtml);

		// var infoHtml = "<div id='info' data-toggle='tooltip' data-placement='top'></div>";
		// $("#mapCanvas").after(infoHtml);
		// $("#" + id + " #info").tooltip({
		// 								  animation: false,
		// 								  trigger: 'manual'
		// 								});	

		this.canvas = document.getElementById("mapCanvas");
		this.width = $("#" + id).width();
		this.height = $("#" + id).height();		
		this.center = new GeoBeans.Geometry.Point(0,0);		
		
		this.transformation = new GeoBeans.Transformation(this);		
		this.renderer = new GeoBeans.Renderer(this.canvas);

		this.controls = new GeoBeans.Control.Controls(this);
		
		// drag map control
		var dragControl = new GeoBeans.Control.DragMapControl(this);
		dragControl.enable(true);
		this.controls.add(dragControl);
		// scroll map control
		var scrollControl = new GeoBeans.Control.SrollMapControl(this);
		scrollControl.enable(true);
		this.controls.add(scrollControl);

		if(this.mapNavControl == null){
			this.mapNavControl = new GeoBeans.Control.MapNavControl(this);	
		}
		
	},
	
	destroy : function(){
		this.canvas = null;
		this.renderer = null;
		this.layers = null;
		this.transformation = null;
		this.controls.cleanup();
		this.controls = null;
	},
	
	addLayer : function(layer){
		if(layer!=null){
			layer.setMap(this);
			//layer.init();
			this.layers.push(layer);
		}
	},

	removeLayer : function(name){
		var len = this.layers.length;
		for(var i=len-1; i>=0; i--){
			var l = this.layers[i];
			if(l.name == name){
				this.layers.splice(i,1);
				l.cleanup();
			}
		}
	},
	
	setViewer : function(extent){		
		this.viewer = this.scaleView(extent);
		this.transformation.update();
	},
	
	getViewer : function(){		
		return this.viewer;
	},
	
	/**
	 * 更新center点后，需要更新map的视口
	 * 触发draw事件
	 **/
	setCenter : function(center){
		
		if(this.viewer!=null){
			var offset_x = center.x - this.center.x;
			var offset_y = center.y - this.center.y;
			this.viewer.offset(offset_x, offset_y);
			this.center = center;
			
			this.transformation.update();
			
			//this.draw();
		}
		else{
			this.center = center;
		}
	},
	
	offset : function(offset_x, offset_y){
		
		if(this.viewer!=null){
			this.viewer.offset(offset_x, offset_y);
			this.center.x += offset_x;
			this.center.y += offset_y;
			this.transformation.update();			
		}
		else{
			this.center.x += offset_x;
			this.center.y += offset_y;
		}
	},
	
	/**
	 * 可以根据Level确定map的
	 * 1. resolution
	 * 2. viewer(center有默认值)
	 */	
	setLevel : function(level){
		this.level = level;
		if(this.baseLayer!=null){
			
			this.baseLayer.scale = 1.0;
			this.resolution = this.baseLayer.getResolution(level);
			this.updateMapExtent(this.resolution);
			
			this.transformation.update();
		}
	},
	
	
	/**
	 * 根据map的width和height的比例，重新计算extent的范围
	 * 1. extent的center保持不变
	 * 2. extent的长宽比和map一致
	 **/
	formulateExtent : function(extent){
		
	},
	
	setResolution : function(resolution){
		this.resolution = resolution;
	},
	
	setBaseLayer : function(layer){
		this.baseLayer = layer;
		if(this.baseLayer!=null){
			this.baseLayer.setMap(this);
		}
	},
	
	/**
     * 根据resolution和中心点计算当前视图范围的地图viewer
     */
	updateMapExtent : function(resolution){
		var cx = this.center.x;
		var cy = this.center.y;
		var vw = this.width;
		var vh = this.height;
		
		var mw = resolution * vw / 2; 
		var mh = resolution * vh / 2; 
		
		var xmin = cx - mw;
		var xmax = cx + mw;
		var ymin = cy - mh;
		var ymax = cy + mh;
		
		if(this.viewer!=null){
			this.viewer.xmin = xmin;
			this.viewer.xmax = xmax;
			this.viewer.ymin = ymin;
			this.viewer.ymax = ymax;
		}else{
			this.viewer = new GeoBeans.Envelope(xmin, ymin, xmax, ymax);
		}
	},
	
	draw : function(){
		this.renderer.save();
		if(this.baseLayer!=null){
			this.baseLayer.preDraw();
			this.baseLayer.loadingTiles(this.drawBaseLayerCallback);
		}else{
			this.drawLayersAll();
			// this.drawLayers();
			this.renderer.restore();			
		}

		//设置地图控件
		this.mapNavControl.setZoomSlider(this.level);
	},

	drawBaseLayerCallback:function(map){
		// map.baseLayer.draw();
		// map.renderer.drawImage(map.baseLayer.canvas,0,0,map.baseLayer.canvas.width,map.baseLayer.canvas.height);
		// for(var i=0; i<map.layers.length; i++){
		// 	map.layers[i].draw();
		// }
		map.drawLayers();
		map.renderer.restore();
	},


	//绘制所有图层
	drawLayers : function(){
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			layer.load();
		}
		for(var i = 0; i < this.layers.length; ++i){
			if(layer.flag != GeoBeans.Layer.Flag.LOADED){
				return;
			}
		}
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		if(this.baseLayer != null){
			this.renderer.drawImage(this.baseLayer.canvas,0,0,this.baseLayer.canvas.width,this.baseLayer.canvas.height);
		}
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			var canvas = layer.canvas;
			this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
		}
	},

	//绘制hit图层
	drawHitLayer : function(){

		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		//先绘制底图
		if(this.baseLayer != null){
			this.renderer.drawImage(this.baseLayer.canvas,0,0,this.baseLayer.canvas.width,this.baseLayer.canvas.height);
		}
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];

			var canvas = layer.canvas;
			this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			var hitCanvas = layer.hitCanvas;
			if(hitCanvas != null){
				this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
			}
		}

	},

	//绘制所有图层，较为通用，包括hitCanvas和bufferCanvas
	drawLayersAll : function(){
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			layer.load();
		}
		for(var i = 0; i < this.layers.length; ++i){
			if(layer.flag != GeoBeans.Layer.Flag.LOADED){
				return;
			}
		}
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		if(this.baseLayer != null){
			this.renderer.drawImage(this.baseLayer.canvas,0,0,this.baseLayer.canvas.width,this.baseLayer.canvas.height);
		}
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];

			var canvas = layer.canvas;
			this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			var hitCanvas = layer.hitCanvas;
			if(hitCanvas != null){
				this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
			}
			var bufferCanvas = layer.bufferCanvas;
			if(bufferCanvas != null){
				this.renderer.drawImage(bufferCanvas,0,0,bufferCanvas.width,bufferCanvas.height);
			}
		}
	},
	
	drawCache : function(){
		this.drawBackground();
		if(this.baseLayer!=null){
			this.baseLayer.drawCache();
		}
	},
	
	drawBackground : function(){
		var context = this.renderer.context;
		context.fillStyle = this.bgColor;
		context.fillRect(0,0,this.width,this.height);
	},

	
	enableDrag : function(dragable){
		//this.dragable = dragable;
		var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		if(i>=0){
			this.controls.get(i).enable(dragable);
		}
	},
	
	addEventListener : function(event, handler){
		var map = this;
		this.canvas.addEventListener(event, function(evt){
		var x = evt.layerX;
			var y = evt.layerY;
			
			var mp = map.transformation.toMapPoint(x, y);
			var args = new GeoBeans.Event.MouseArgs();
			args.buttn = null;
			args.X = x;
			args.Y = y;
			args.mapX = mp.x;
			args.mapY = mp.y;
			handler(args);
		});
	},
	
	scaleView : function(extent){
		var v_scale = extent.getWidth() / extent.getHeight();
		var w_scale = this.width / this.height;
		
		this.center = extent.getCenter();
		var viewer = null;
		
		if(v_scale > w_scale){
			//strech height
			var w_2 = extent.getWidth() / 2;
			var h_2 = w_2 / w_scale;
			viewer = new GeoBeans.Envelope(	extent.xmin,											
											this.center.y - h_2,
											extent.xmax,
											this.center.y + h_2);
		}
		else{
			//strech width
			var h_2 = extent.getHeight() / 2;
			var w_2 = h_2 * w_scale;
			
			viewer = new GeoBeans.Envelope(	this.center.x - w_2,
											extent.ymin,
											this.center.x + w_2,											
											extent.ymax);
		}
		
		return viewer;
	},
	
	screenCopy : function(){
//		var img = new Image();
//		img.src = this.canvas.toDataURL("image/png");
//		return img;

		var imgData = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		return imgData;
	},
	
	
	saveSnap : function(){
		this.snap = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	},
	
	restoreSnap : function(){
		if(this.snap!=null){
			this.renderer.context.putImageData(this.snap, 0, 0);
		}
	},
	
	putSnap : function(x, y){
		if(x=='undefined')	x =0;
		if(y=='undefined')	y =0;
		if(this.snap!=null){
			this.renderer.context.putImageData(this.snap, x, y);
		}
	},
	
	cleanupSnap : function(){
		this.snap = null;
	},



	drawBaseLayerSnap:function(level){

		var centerx = this.center.x;
		var centery = this.center.y;

		// var centersc_point = this.transformation.toScreenPoint(centerx,centery);
		// centerx = centersc_point.x;
		// centery = centersc_point.y;
		var x = null;
		var y = null;
		var width = null;
		var height = null;
		//放大
		if(this.level < level){
			x = 0 - this.width/2;
			y = 0 - this.height/2;
			width = this.width * 2;
			height = this.height * 2;
		}else{
			x = 0 + this.width/4;
			y = 0 + this.height/4;
			width = this.width / 2;
			height = this.height /2;
		}

		if(this.snap != null){
			var newCanvas = $("<canvas>")
			    .attr("width", this.snap.width)
			    .attr("height", this.snap.height)[0];
			newCanvas.getContext("2d").putImageData(this.snap, 0, 0);
			// this.renderer.context.scale(2,2);		
			this.renderer.context.drawImage(newCanvas,x,y,width,height);
			// this.renderer.context.putImageData(this.snap,x,y,0,0,width,height);
		}
	},

	//设置导航
	setNavControl:function(flag){
		if(this.mapNavControl== null){
			this.mapNavControl = new GeoBeans.Control.MapNavControl(this);
		}
		this.mapNavControl.setEnable(flag);
	},

	// 添加热力图
	addHeatMap : function(layer,field){
		if(layer == null || field == null){
			return;
		}
		
	}

});