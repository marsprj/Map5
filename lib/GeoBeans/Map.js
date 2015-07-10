// JavaScript Document
GeoBeans.Map = GeoBeans.Class({
	
	// TOLERANCE : 10,
	TOLERANCE : 20,
	
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

	overlayLayer : null,
	
	// srid : "EPGS : 4326",
	srid : 4326,
	
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

	groupLayer : null,

	mapWorkspace : null,

	server : null,

	tracker : null,

	queryLayer : null,

	//拉框查询
	queryTrackLayer : null,

	queryRect : null,

	//control 状态
	// controlStatus : "normal",

	infoWindow : null,

	initialize: function (server,id,name,extent,srid) {
		var mapDiv = document.getElementById(id);
		if(mapDiv == null){
			return null;
		}
		mapDiv.innerHTML = '';
		if(server == null ||
			id == null || name == null){
			return;
		}
		if(extent != null){
			this.extent = extent;
		}
		if(srid != null){
			this.srid = srid;
		}
		this.server = server;
		this.id = id;
		this.name = name;
		this.mapWorkspace = new GeoBeans.MapWorkspace(this.server,
								this);
		
		this.layers = [];
		
		this.mapDiv = $("#" + id);
		// var canvas = $("#mapCanvas");
		// if(canvas.length != 0){
		// 	// canvas
		// }
		var mapCanvasHtml = "<canvas id='mapCanvas' height='" 
							+ $("#" + id).height() + "' width='" 
							+ $("#" + id).width() + "'></canvas>";

		$("#" + id).append(mapCanvasHtml);
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

		//track control
		var tracker = new GeoBeans.Control.TrackControl();
		this.tracker = tracker;
		this.controls.add(tracker);

		if(this.mapNavControl == null){
			this.mapNavControl = new GeoBeans.Control.MapNavControl(this);	
		}

		this.overlayLayer = new GeoBeans.Layer.OverlayLayer("overlay");
		this.overlayLayer.setMap(this);
		// this.overlayLayer.registerHitEvent();

		this.groupLayer = new GeoBeans.Layer.GroupLayer(this.server,
								this.name);
		this.groupLayer.setMap(this);
	
		var that = this;
		var resizeId;
		window.onresize = function(flag){
			clearTimeout(resizeId);
			resizeId = setTimeout(function(){
				var height = that.mapDiv.height();
				var width = that.mapDiv.width();
				console.log('before:width[' + that.canvas.width + "]");

				that.canvas.height = height;
				that.canvas.width = width;
				console.log('after:width[' + that.canvas.width + "]");
				that.height = height;
				that.width = width;

				if(that.viewer != null){
					if(that.baseLayer != null){
						var baseLayerCanvas = that.baseLayer.canvas;
						if(baseLayerCanvas != null){
							baseLayerCanvas.height = height;
							baseLayerCanvas.width = width;
						}
						that.baseLayer.scale = 1.0;
						var level = that.level;
						that.resolution = that.baseLayer.getResolution(level);
						that.updateMapExtent(that.resolution);
						var center = that.center;
						that.setCenter(center);
					}else{
						// var extent = that.scaleView(that.viewer);
						// that.viewer = extent;
						// that.transformation.update();
					}
					var extent = null;
					if(flag == "width"){
						extent = that.scaleViewWidth(that.viewer);
					}else if(flag == "height"){
						extent = that.scaleViewHeight(that.viewer);
					}else{
						extent = that.scaleView(that.viewer);
					}
					that.viewer = extent;


					that.transformation.update();

					var layers = that.getLayers();
					for(var i = 0; i < layers;++i){
						var layer = layers[i];
						if(layer != null){
							var canvas = layer.canvas;
							if(canvas != null){
								canvas.height = height;
								canvas.width = width;
							}
							var bufferCanvas = layer.bufferCanvas;
							if(bufferCanvas != null){
								bufferCanvas.height = height;
								bufferCanvas.width = width;
							}
						}
					}
					var groupLayer = that.groupLayer;
					if(groupLayer != null){
						groupLayer.canvas.height = height;
						groupLayer.canvas.width = width;
						groupLayer.flag = GeoBeans.Layer.Flag.READY;
					}

					
					that.draw();
				}
			},250);

		};
		var handler = window.onresize;
		handler.apply(window,[]);

		this.queryLayer = new GeoBeans.Layer.FeatureLayer.QueryLayer("query");
		this.queryLayer.setMap(this);

		
		var infoWindowHtml = "<div class='infoWindow' data-toggle='popover' "
			+ 	"title='Info' data-content=''></div>";
		$("#" + id).append(infoWindowHtml);
		this.infoWindow = this.mapDiv.find(".infoWindow");
		this.infoWindow.popover({
			animation: false,
			trigger: 'manual',
			placement : 'top',
			html : true
		});		
	},
	
	destroy : function(){
		this.canvas = null;
		this.renderer = null;
		this.layers = null;
		this.transformation = null;
		this.controls.cleanup();
		this.controls = null;
	},

	//重绘，大小改变时候
	resize : function(flag){
		var handler = window.onresize;
		handler.apply(window,[flag]);
	},

	//需要从服务端读取吗
	getLayers : function(){
		var layers = [];
		var dbLayers = this.groupLayer.getLayers();
		for(var i = 0; i < dbLayers.length;++i){
			layers.push(dbLayers[i]);
		}
		for(var i = 0; i < this.layers.length;++i){
			layers.push(this.layers[i]);
		}
		return layers;
	},

	getLayer : function(name){
		if(name == null){
	 		return;
	 	}
	 	var layer = null;
	 	var dbLayers = this.groupLayer.getLayers();
	 	var dbLayer = null;
	 	for(var i = 0; i　< dbLayers.length;++i){
	 		dbLayer = dbLayers[i];
	 		if(dbLayer.name == name){
	 			return dbLayer;
	 		}
	 	}
	 	for(var i = 0; i < this.layers.length;++i){
	 		var layer = this.layers[i];
	 		if(layer.name == name){
	 			return layer;
	 		}
	 	}
	},
	
	addLayer : function(layer,callback){
		if(layer == null){
			callback("layer is null");
			return;
		}

		var l = this.getLayer(layer.name);
		if(l != null){
			callback("this map has [" + layer.name + "] layer");
			return;
		}
		if(layer!=null){
			layer.setMap(this);
			//layer.init();
			if(layer instanceof GeoBeans.Layer.DBLayer){
				this.mapWorkspace.registerLayer(layer,
					this.addLayer_callback,callback);
				// this.groupLayer.addLayer(layer);
			}else if(layer instanceof GeoBeans.Layer.WMTSLayer){
				// WMTS图层，可设置为底图
				if(this.baseLayer == null){
					this.setBaseLayer(layer);
					if(this.level == null){
						var level = this.getLevel(this.viewer);
						this.setLevel(level);
					}
				}else{
					this.layers.push(layer);
				}
			}else{
				this.layers.push(layer);
				if(callback != null){
					callback("success");
				}
			}
		}
	},

	addLayer_callback : function(result,map,layer,callback){
		if(result == "success"){
			if(layer instanceof GeoBeans.Layer.DBLayer){
				map.groupLayer.addLayer(layer);
			}
			callback(result);
			map.draw();
		}else{
			callback(result);
		}
	},
	// removeLayer : function(name){
	// 	var len = this.layers.length;
	// 	for(var i=len-1; i>=0; i--){
	// 		var l = this.layers[i];
	// 		if(l.name == name){
	// 			this.layers.splice(i,1);
	// 			l.cleanup();
	// 		}
	// 	}
	// },
	 removeLayer : function(name,callback){
	 	if(name == null){
	 		return;
	 	}

	 	// var dbLayers = this.groupLayer.getLayers();
	 	// var dbLayer = null;
	 	// for(var i = 0; i　< dbLayers.length;++i){
	 	// 	dbLayer = dbLayers[i];
	 	// 	if(dbLayer.name == name){
	 	// 		this.mapWorkspace.unRegisterLayer(name,
	 	// 			this.unRegisterLayer_callback,callback);
	 	// 	}
	 	// }
	 	// for(var i = 0; i < this.layers.length;++i){
	 	// 	var layer = this.layers[i];
	 	// 	if(layer.name == name){

	 	// 	}
	 	// }
	 	var layer = this.getLayer(name);
	 	if(layer == null){
	 		return;
	 	}
	 	if(layer instanceof GeoBeans.Layer.DBLayer){
	 		this.mapWorkspace.unRegisterLayer(name,
	 				this.unRegisterLayer_callback,callback);
	 	}else{
	 		var layers = this.layers;
	 		for(var i = 0; i < layers.length;++i){
	 			if(layer.name == layers[i].name){
	 				this.layers.splice(i,1);
	 				layer.cleanup();
	 				if(callback != undefined){
	 					callback("success");
	 				}
	 			}
	 		}
	 	}
	 },

	unRegisterLayer_callback : function(result,map,layerName,callback){
		var layer = map.getLayer(layerName);
		if(result == "success"){
			if(layer instanceof GeoBeans.Layer.DBLayer){
				map.groupLayer.removeLayer(layer);
			}else{

			}
			map.draw();
			callback(result);
		}else{
			callback(result);
		}
	},

	setStyle : function(typeName,style,callback){
		this.mapWorkspace.setStyle(typeName,
			style,this.setStyle_callback,
			callback);
	},

	setStyle_callback : function(result,map,typeName,style,callback){
		var layer = map.getLayer(typeName);
		if(layer instanceof GeoBeans.Layer.DBLayer){
			map.groupLayer.update();
		}
		if(result == "success"){
			layer.setStyle(style);
			callback(result);
		}else{
			callback(result);
		}
	},

	removeBaseLayer : function(){
		this.baseLayer = null;
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
	
	/**
     * 根据viewer反算level
     */	
    getLevel:function(viewer){
    	var cx = this.center.x;
    	var cy = this.center.y;
    	var vw = this.width;
    	var vh = this.height;

    	var mw = cx - viewer.xmin;
    	var mh = cy - viewer.ymin;

    	var resolution = mw*2/vw;
    	if(this.baseLayer == null){
    		return null;
    	}
    	var level = this.baseLayer.getLevel(resolution);
    	return level;
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
		// map.drawLayers();
		map.drawLayersAll();
		map.renderer.restore();
	},


	// //绘制所有图层
	// drawLayers : function(){
		
	// 	for(var i = 0; i < this.layers.length; ++i){
	// 		var layer = this.layers[i];
	// 		layer.load();
	// 	}
	// 	for(var i = 0; i < this.layers.length; ++i){
	// 		if(layer.flag != GeoBeans.Layer.Flag.LOADED){
	// 			return;
	// 		}
	// 	}
	// 	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
	// 	if(this.baseLayer != null && this.baseLayer.visible){
	// 		this.renderer.drawImage(this.baseLayer.canvas,0,0,
	// 				this.baseLayer.canvas.width,this.baseLayer.canvas.height);
	// 	}
		
	// 	for(var i = 0; i < this.layers.length; ++i){
	// 		var layer = this.layers[i];
	// 		var canvas = layer.canvas;
	// 		if(layer.visible){
	// 			this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
	// 		}
	// 	}
	// },

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
		if(this.groupLayer.getLayers().length != 0){
			this.groupLayer.load();
		}
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			layer.load();
		}
		this.overlayLayer.load();

		this.queryLayer.load();

		if(this.groupLayer.getLayers().length != 0){
			if(this.groupLayer.flag != GeoBeans.Layer.Flag.LOADED){
				return;
			}
		}
		
		for(var i = 0; i < this.layers.length; ++i){
			if(layer.flag != GeoBeans.Layer.Flag.LOADED){
				return;
			}
		}

		var overlayLayerFlag = this.overlayLayer.getLoadFlag();
		if(overlayLayerFlag != GeoBeans.Layer.Flag.LOADED){
			return;
		}

		if(this.queryLayer.flag != GeoBeans.Layer.Flag.LOADED){
			return;
		}


		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		if(this.baseLayer != null && this.baseLayer.visible){
			this.renderer.drawImage(this.baseLayer.canvas,0,0,this.baseLayer.canvas.width,this.baseLayer.canvas.height);
		}
		if(this.groupLayer.getLayers().length != 0
			&& this.groupLayer.visible){
			var groupLayerCanvas = this.groupLayer.canvas;
			this.renderer.drawImage(groupLayerCanvas,0,0,
					groupLayerCanvas.width,groupLayerCanvas.height);
			var dbLayers = this.groupLayer.getLayers();
			for(var i = 0; i < dbLayers.length; ++i){
				var dbLayer = dbLayers[i];
				var heatMapLayer = dbLayer.heatMapLayer;
				if(heatMapLayer != null){
					var canvas = heatMapLayer.canvas;
					if(canvas != null && heatMapLayer.visible && dbLayer.visible){
						this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
					}
				}
			}
		}
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			if(!layer.visible){
				if(layer instanceof GeoBeans.Layer.ChartLayer){
					layer.hideLegend();
				}
				continue;
			}
			var canvas = layer.canvas;
			if(canvas != null){
				this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			}
			var hitCanvas = layer.hitCanvas;
			if(hitCanvas != null){
				this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
			}
			var bufferCanvas = layer.bufferCanvas;
			if(bufferCanvas != null){
				this.renderer.drawImage(bufferCanvas,0,0,bufferCanvas.width,bufferCanvas.height);
			}
			if(layer instanceof GeoBeans.Layer.ChartLayer){
				layer.showLegend();
			}
		}

		var canvas = this.overlayLayer.canvas;
		this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);

		var overlayHitCanvas = this.overlayLayer.hitCanvas;
		if(overlayHitCanvas != null){
			this.renderer.drawImage(overlayHitCanvas,0,0,overlayHitCanvas.width,overlayHitCanvas.height);
		}

		var overlayEditCanvas = this.overlayLayer.editCanvas;
		if(overlayEditCanvas != null){
			this.renderer.drawImage(overlayEditCanvas,0,0,overlayEditCanvas.width,overlayEditCanvas.height);
		}

		//queryLayer
		var queryLayerCanvas = this.queryLayer.canvas;
		if(queryLayerCanvas != null){
			this.renderer.drawImage(queryLayerCanvas,0,0,queryLayerCanvas.width,queryLayerCanvas.height);
		}

		// infoWindow 
		var that = this;
		if(this.infoWindow != null){
			var popover = this.mapDiv.find(".popover");
			if(popover.length == 1 ){
				var map_x = this.infoWindow.attr("x");
				var map_y = this.infoWindow.attr("y");
				if(!this.viewer.contain(map_x,map_y)){
					this.infoWindow.popover('hide');
					that.queryLayer.clearFeatures();
					return;
				}
				var point_s = this.transformation.toScreenPoint(map_x,map_y);
				this.infoWindow.css("left",point_s.x + "px");
				this.infoWindow.css("top",(point_s.y) + "px");
				this.infoWindow.popover('hide').popover("show");
				this.mapDiv.find(".popover-title")
					.append('<button type="button" class="close">&times;</button>');
				this.mapDiv.find(".popover-title .close").click(function(){
					$(this).parents(".popover").popover('hide');
				});				
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
	
	// 固定高度，拉伸宽度
	scaleViewWidth : function(extent){
		if(extent == null){
			return null;
		}
		this.center = extent.getCenter();
		var w_scale = this.width / this.height;

		var h_2 = extent.getHeight() / 2;
		var w_2 = h_2 * w_scale;
		
		var viewer = new GeoBeans.Envelope(	this.center.x - w_2,
										extent.ymin,
										this.center.x + w_2,											
										extent.ymax);
		return viewer;
	},

	// 固定宽度，拉伸高度
	scaleViewHeight : function(extent){
		if(extent == null){
			return null;
		}
		this.center = extent.getCenter();
		var w_2 = extent.getWidth() / 2;
		var h_2 = w_2 / w_scale;
		var viewer = new GeoBeans.Envelope(	extent.xmin,											
										this.center.y - h_2,
										extent.xmax,
										this.center.y + h_2);
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
		var zoom = level - this.level;
		var zoomSize = Math.pow(2,zoom);
		width = this.width * zoomSize;
		height = this.height * zoomSize;

		x = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.width);
		y = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.height);

		// //放大
		// if(this.level < level){
		// 	// x = 0 - this.width/2;
		// 	// y = 0 - this.height/2;
		// 	// width = this.width * 2;
		// 	// height = this.height * 2;
		// 	// x = 0 - this.width/2;
		// 	// y = 0 - this.height/2;
		// 	x = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.width);
		// 	y = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.height);
		// 	// width = this.width * zoomSize;
		// 	// height = this.height * zoomSize;

		// }else{
		// 	x = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.width);
		// 	y = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.height);
		// 	// x = 0 + this.width/4;
		// 	// y = 0 + this.height/4;
		// 	// width = this.width / 2;
		// 	// height = this.height /2;
		// }

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


	//覆盖物操作
	addOverlay:function(overlay){
		this.overlayLayer.addOverlay(overlay);
	},

	addOverlays:function(overlays){
		this.overlayLayer.addOverlays(overlays);
	},

	removeOverlay:function(id){
		this.overlayLayer.removeOverlay(id);
	},

	removeOverlays:function(ids){
		this.overlayLayer.removeOverlays(ids);
	},

	clearOverlays:function(){
		this.overlayLayer.clearOverlays();
	},

	getOverlays:function(){
		return this.overlayLayer.overlays;
	},
	getOverlay:function(id){
		return this.overlayLayer.overlays[id];
	},
	setFitView:function(overlay){
		var extent = overlay.getExtent();
		this.viewer = this.scaleView(extent);
		this.transformation.update();
		var level = this.getLevel(this.viewer);
		this.setLevel(level);
		this.draw();
	},
	//注册hit和edit事件
	registerOverlayEvent:function(){
		this.overlayLayer.registerHitEvent();
	},
	unregisterOverlayEvent:function(){
		this.overlayLayer.unregisterHitEvent();
	},

	drawGeometry : function(){
		// this.renderer.renderer
	},


	//拉框查询
	queryByRect : function(layerName,callback){
		if(layerName == null){
			return;
		}
		var layer = mapObj.getLayer(layerName);
		if(layer == null){
			return;
		}
		this.queryLayer.clearFeatures();
		
		this.queryTrackLayer = null;
		this.queryRect = null;
		this.tracker.trackRect(this.trackRect_callback
			,this,layer,callback);


	},

	trackRect_callback : function(rect,map,layer,callback_u){
		if(rect == null){
			return;
		}
		map.tracker.end();
		map.queryRect = rect;
		map.queryTrackLayer = layer;
		map.queryLayer.setLayer(layer);
		layer.getFeatureCount(rect,callback_u);
		// layer.getFeatureBBoxGet(rect,callback_u,
		// 	map.queryMaxFeatures,0,map.queryGetCount);
	},

	//拉框之分页查询
	queryByRectPage : function(maxFeatures,offset){
		// if(this.queryMaxFeatures == null 
		// 	|| this.queryRect == null){
		// 	return;
		// }
		// layer.getFeatureBBoxGet(rect,callback_u,
		// 	map.queryMaxFeatures,0);
		if(this.queryTrackLayer != null && this.queryRect != null){
			var features = this.queryTrackLayer.getFeatureBBoxGet(this.queryRect,
				maxFeatures,offset);
			this.queryLayer.setFeatures(features);
			this.drawLayersAll();
			return features;
		}
		return null;
	},
	queryByRectOutput : function(maxFeatures,offset){
		if(this.queryTrackLayer != null && this.queryRect != null){
			var url = this.queryTrackLayer.getFeautureBBoxGetOutput(this.queryRect,
				maxFeatures,offset);
			return url;
		}
		return null;
	},

	//闪烁
	setFeatureBlink : function(feature,count){
		if(feature == null || count == null){
			return;
		}
		this.queryLayer.setFeatureBlink(feature,count);
	},

	//热力图
	addHeatMap : function(layerName,field){
		var layer = this.getLayer(layerName);
		if(layer == null){
			return;
		}
		if(layer instanceof GeoBeans.Layer.DBLayer){
			layer.addHeatMap(field);
		}
	},

	removeHeatMap : function(layerName){
		var layer = this.getLayer(layerName);
		if(layer == null){
			return;
		}
		layer.removeHeatMap();
	},

	setHeatMapVisible : function(layerName,visible){
		var layer = this.getLayer(layerName);
		if(layer == null){
			return;
		}
		layer.setHeatMapVisible(visible);
	},

	//点击查询
	queryByClick : function(layerName,callback){
		this.endQuery();
		if(layerName == null){
			return;
		}
		var layer = mapObj.getLayer(layerName);
		if(layer == null){
			return;
		}

		this.tracker.trackInfo(this.queryByClick_callback
			,layer,this,callback);
	},

	queryByClick_callback : function(point,layer,map,callback_u){
		// map.tracker.end();
		if(point == null || layer == null){
			return;
		}
		var point_m = map.transformation.toMapPoint(point.x,point.y);

		var point_1 = new GeoBeans.Geometry.Point(point.x - map.tolerance/2,
			point.y - map.tolerance/2);
		var point_2 = new GeoBeans.Geometry.Point(point.x + map.tolerance/2,
			point.y + map.tolerance/2);
		var point_m_1 = map.transformation.toMapPoint(point_1.x,point_1.y);
		var point_m_2 = map.transformation.toMapPoint(point_2.x,point_2.y);
		// var point_m_1 = new GeoBeans.Geometry.Point(point.x - map.tolerance/2,
		// 	point.y - map.tolerance/2);
		// var point_m_2 = new GeoBeans.Geometry.Point(point.x + map.tolerance/2,
		// 	point.y + map.tolerance/2);
		var bbox = new GeoBeans.Envelope(point_m_1.x,point_m_2.y,
			point_m_2.x,point_m_1.y);

		//区分点线面
		var features = null;
		if(layer.geomType == GeoBeans.Geometry.Type.POLYGON
			|| layer.geomType == GeoBeans.Geometry.Type.MULTIPOLYGON){
			features = layer.getFeaturesWithin(point_m);
		}else{
			features = layer.getFeatureBBoxGet(bbox,null,null);
		}
		if(features.length == 0){
			map.infoWindow.popover("hide");
			map.queryLayer.clearFeatures();
			return;
		}
		
		var feature = features[0];
		if(callback_u != null){
			callback_u(layer,feature,point_m);
		}
		map.queryLayer.setLayer(layer);
		map.queryLayer.setFeatures([feature]);
		map.drawLayersAll();

		// map.tooltipFeature(point,layer,feature);
	},

	// tooltipFeature : function(point,layer,feature){
	// 	var tooltip = this.mapDiv.find(".info");
	// 	if(tooltip.length == 0){
	// 		// var html = "<div class='info' data-toggle='tooltip' "
	// 		// 	+ "data-html='true' data-placement='top'></div>";
	// 		var html = "<div class='info' data-toggle='popover' "
	// 		+ 	"title='Popover title' data-content='content'></div>";
	// 		this.mapDiv.append(html);
	// 		tooltip =  this.mapDiv.find(".info");
	// 		tooltip.popover({
	// 			animation: false,
	// 			trigger: 'manual',
	// 			placement : 'top',
	// 			html : true

	// 		});				
	// 	}

	// 	if(feature == null){
	// 		tooltip.popover('hide');
	// 		this.queryLayer.clearFeatures();
	// 		return;
	// 	}

	// 	var fields = layer.getFields();
	// 	if(fields == null){
	// 		return;
	// 	}
	// 	var field = null;
	// 	var name = null;
	// 	var type = null;
	// 	var html = "";
	// 	html += "<table class='table table-striped'>"
	// 		+ 	"<thead>"
	// 		+ 	"<tr>"
	// 		+ 	"<th>Field</th>"
	// 		+ 	"<th>Value</th>"
	// 		+	"</tr>"
	// 		+	"</thead>"
	// 		+ 	"<tbody>";
	// 	var values = feature.values;
	// 	if(values == null){
	// 		return;
	// 	}
	// 	for(var i = 0; i < fields.length;++i){
	// 		field = fields[i];
	// 		if(field == null){
	// 			continue;
	// 		}
	// 		type = field.type;
	// 		if(type != "geometry"){
	// 			name = field.name;
	// 			value = values[i];
	// 			html += "<tr>"
	// 			+  "	<td>" + name + "</td>"
	// 			+  "	<td>" + value + "</td>"
	// 			+  "	</tr>"
	// 		}
	// 	}
	// 	html += "</tbody>";
	// 	html += "</table>";

	// 	var point_m = this.transformation.toMapPoint(point.x,point.y);
	// 	tooltip.attr("x",point_m.x);
	// 	tooltip.attr("y",point_m.y);

	// 	tooltip.css("left",point.x + "px");
	// 	tooltip.css("top",(point.y + 20) + "px");
	// 	tooltip.popover('hide')
	// 		// .attr("data-content",values[1])
	// 		.attr("data-content",html)
	// 		.attr("data-original-title",layer.name)
	// 		.popover('show');
	// 	var that = this;
	// 	$('.popover-title')
	// 		.append('<button type="button" class="close">&times;</button>');
	// 	$('.popover-title').find(".close").click(function(){
	// 		$(this).parents(".popover").popover('hide');
	// 		that.queryLayer.clearFeatures();
	// 	});

	// 	this.queryLayer.setLayer(layer);
	// 	this.queryLayer.setFeatures([feature]);
	// 	this.drawLayersAll();
	// },

	endQuery : function(){
		this.tracker.end();
		this.queryLayer.clearFeatures();
		this.infoWindow.popover("hide");
	},

	//info window
	openInfoWindow : function(infoWindow,point){
		if(infoWindow == null || point == null){
			return;
		}

		var x = point.x;
		var y = point.y;

		var point_s = this.transformation.toScreenPoint(x,y);
		var x_s = point_s.x;
		var y_s = point_s.y;
		// var point_m = this.transformation.toMapPoint(point.x,point.y);

		this.infoWindow.attr("x",x);
		this.infoWindow.attr("y",y);

		this.infoWindow.css("left",x_s + "px");
		this.infoWindow.css("top", (y_s) + "px");

		var title = infoWindow.getTitle();
		var content = infoWindow.getContent();
		this.infoWindow.popover("hide")
			.attr("data-content",content)
			.attr("data-original-title",title)
			.popover("show");
		this.mapDiv.find(".popover-title")
			.append('<button type="button" class="close">&times;</button>');
		this.mapDiv.find(".popover-title .close").click(function(){
			$(this).parents(".popover").popover('hide');
		});
	},

	closeInfoWindow : function(){
		if(this.infoWindow == null){
			return;
		}
		this.infoWindow.popover("hide");
	},

	//zoomLayer
	zoomToLayer : function(layerName){
		if(layerName == null){
			return;
		}
		var layer = this.getLayer(layerName);
		if(layer == null){
			return;
		}
		var extent = layer.getExtent();
		if(extent == null){
			return;
		}
		this.setViewer(extent);
		this.draw();
	},

	getFeatures : function(layerName,maxFeatures,offset){
		if(layerName == null){
			return null;
		}

		var layer = mapObj.getLayer(layerName);
		if(layer != null && layer instanceof GeoBeans.Layer.DBLayer){
			var features = layer.getFeatureBBoxGet(null,maxFeatures,offset);
			return features;
		}
		return null;
	},

	// 按照filter查询
	getFeatureFilter : function(layerName,filter,maxFeatures,offset){
		var layer = this.getLayer(layerName);
		if(layer == null){
			return null;
		}
		this.queryLayer.setLayer(layer);
		var features = layer.getFeatureFilter(filter,maxFeatures,offset);
		this.queryLayer.setFeatures(features);
		this.drawLayersAll();
		return features;
	},

	// 按照filter查询个数
	getFeatureFilterCount : function(layerName,filter){
		var layer = this.getLayer(layerName);
		if(layer == null){
			return null;
		}
		var count = layer.getFeatureFilterCount(filter);
		return count;
	},

	// 按照filter进行导出
	queryByFilterOutput : function(layerName,filter,maxFeatures,offset){
		var layer = this.getLayer(layerName);
		if(layer == null){
			return null;
		}
		var url = layer.getFeatureFilterOutput(filter,maxFeatures,offset);
		return url;
	},

	// 获取分级图的样式
	getRangeChartStyle : function(baseLayerName,baseLayerField,dbName,tableName,
		tableField,chartField,count,colorMapID){
		if(baseLayerName == null || baseLayerField == null || dbName == null
			|| tableName == null || tableField == null ||chartField == null
			|| count == null || colorMapID == null){
			return null;
		}
		var chartLayer = new GeoBeans.Layer.ChartLayer("tmp",baseLayerName,
			baseLayerField,dbName,tableName,tableField,[chartField]);
		chartLayer.setMap(this);
		var chartFeatures = chartLayer.chartFeatures;
		if(chartFeatures == null || chartFeatures.length == 0){
			return null;
		}

		var chartFeatureType = chartFeatures[0].featureType;
		var chartFieldIndex = chartFeatureType.getFieldIndex(chartField);
		var nodes = this.getRangeChartNodes(chartFeatures,chartFieldIndex,count);
		if(nodes == null || nodes.length == 0){
			return null;
		}
		var styleMgr = new GeoBeans.StyleManager(this.server);
		var colors = styleMgr.getColorMap(colorMapID,count);
		var style = this.getRangeChartStyleByNodes(chartFeatures,
			chartFieldIndex,nodes,colors);
		if(style != null){
			style.nodes = nodes;
		}
		return style;
	},

	// 获取分级图的样式节点
	getRangeChartNodes : function(chartFeatures,chartFieldIndex,count){
		if(chartFeatures == null || chartFieldIndex == null
			|| count == null){
			return null;
		}
		var chartFeature = null;
		var min = null;
		var max = null;
		
		for(var i = 0; i < chartFeatures.length; ++i){
			chartFeature = chartFeatures[i];
			if(chartFeature == null){
				return;
			}
			var values = chartFeature.values;
			var value = values[chartFieldIndex];
			value = parseFloat(value);
			if(value == null){
				continue;
			}
			if(min == null){
				min = value;
			}else{
				min = (value < min ) ? value : min; 
			}
			if(max == null){
				max = value;
			}else{
				max = (value > max) ? value : max;
			}
		}	
		if(max == null || min == null || max == min){
			return null;
		}	

		var interval = (max - min) / count;
		var nodes = [];
		for(var i = 0 ; i < count; ++i){
			var node = min + interval * i;
			nodes.push(node);
		}
		nodes.push(max)
		return nodes;
	},

	// 根据节点生成分级图的样式
	getRangeChartStyleByNodes : function(chartFeatures,
			chartFieldIndex,nodes,colors){
		var style = new GeoBeans.Style.FeatureStyle("chart",
			GeoBeans.Style.FeatureStyle.GeomType.Polygon);
		var rules = [];
		for(var i = 0; i < nodes.length -1 ; ++i){
			var lower = nodes[i];
			var upper = nodes[i + 1];

			// 色阶值
			var colorValue = colors[i];  
			
			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();

			var color = new GeoBeans.Color();
			color.setByHex(colorValue,1);
			symbolizer.fill.color = color;

			color = new GeoBeans.Color();
			color.setByHex("#cccccc",1);
			symbolizer.stroke.color = color;

			var filter = new GeoBeans.IDFilter();
			for(var j = 0; j < chartFeatures.length; ++j){
				var chartFeature = chartFeatures[j];
				if(chartFeature == null){
					continue;
				}
				var values = chartFeature.values;
				if(values == null){
					continue;
				}
				var value = values[chartFieldIndex];
				if(value == null){
					continue;
				}
				if(value >= lower && value <= upper){
					var id = chartFeature.gid;
					filter.addID(id);
				}
			}
			var rule = new GeoBeans.Rule();
			rule.filter = filter; 
			rule.name = i;
			rule.symbolizer = symbolizer;
			rules.push(rule);
		}
		style.rules = rules;
		return style;
	}

});