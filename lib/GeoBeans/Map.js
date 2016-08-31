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

	// mapWorkspace : null,

	server : null,

	tracker : null,

	queryLayer : null,

	//拉框查询
	queryTrackLayer : null,

	// 鼠标track的查询空间数据
	queryGeometry : null,

	//control 状态
	// controlStatus : "normal",

	infoWindow : null,

	// 整体绘制
	totalFlag : true,

	// 本地绘制
	drawLocalFlag : false,

	// 全景图
	panoramaLayer : null,

	// 图片图层
	imageLayer : null,

	//图例列表
	legendList : null,


	// rippleLayer hit layers
	hitRippleLayers : null,

	animateCanvas : null,


	baseLayerCanvas : null,

	// 授权时间
	authTime : null,

	// 缩略图
	thumbnail : null,

	// 动画图层
	animationLayer : null,

	// 旋转角度
	rotateAngle : null,

	// initialize: function (server,id,name,extent,srid,viewer) {
	initialize: function (id,name,extent,srid,viewer) {	
		var mapDiv = document.getElementById(id);
		if(mapDiv == null){
			return null;
		}
		mapDiv.innerHTML = '';
		// if(server == null ||
		// 	id == null || name == null){
		// 	return;
		// }
		if(extent != null){
			this.extent = extent;
		}else{
			this.extent = new GeoBeans.Envelope(-180,-90,180,90);
		}
		if(srid != null){
			this.srid = srid;
		}
		if(viewer != null){
			this.viewer = viewer;
		}else{
			this.viewer = this.extent;
		}
		this.server = null;
		this.id = id;
		this.name = name;
		// this.mapWorkspace = new GeoBeans.MapWorkspace(this.server,
		// 						this);
		
		this.layers = [];
		this.legendList = [];
		
		this.mapDiv = $("#" + id);

		var canvasID = this.id + "_canvas";
		var mapCanvasHtml = "<canvas id='" + canvasID + "' class='mapCanvas' height='" 
							+ $("#" + id).height() + "' width='" 
							+ $("#" + id).width() + "'></canvas>";

		// $("#" + id).append(mapCanvasHtml);
		this.mapDiv[0].innerHTML = mapCanvasHtml;
		
		this.width = $("#" + id).width();
		this.height = $("#" + id).height();		
		this.center = new GeoBeans.Geometry.Point(0,0);		


		var baseCanvasID = id + "_basecanvas";
		var canvasHtml = "<canvas  id='" + baseCanvasID  +"' class='map5-base-canvas' height='" 
					+ this.height + "' width='" 
					+ this.width + "'></canvas>";
		this.mapDiv[0].innerHTML += canvasHtml;
		this.baseLayerCanvas = document.getElementById(baseCanvasID);
		this.baseLayerRenderer = new GeoBeans.Renderer(this.baseLayerCanvas);
		
		this.transformation = new GeoBeans.Transformation(this);	
		this.canvas = document.getElementById(canvasID);	
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

		var zoomControl = new GeoBeans.Control.ZoomControl();
		this.controls.add(zoomControl);

		if(this.mapNavControl == null){
			this.mapNavControl = new GeoBeans.Control.MapNavControl(this);	
			this.mapNavControl.setEnable(false);
		}

		this.overlayLayer = new GeoBeans.Layer.OverlayLayer("overlay");
		this.overlayLayer.setMap(this);
		// this.overlayLayer.registerHitEvent();

		this.groupLayer = new GeoBeans.Layer.GroupLayer(this.server,
								this.name);
		this.groupLayer.setMap(this);


		this.panoramaLayer = new GeoBeans.Layer.PanoramaLayer("panorama");
		this.panoramaLayer.setMap(this);

		this.imageLayer = new GeoBeans.Layer.ImageLayer("imageLayer");
		this.imageLayer.setMap(this);


		this.hitRippleLayers = [];
	
		// console.log(this.viewer.toString());
		// 设置范围
		if(this.viewer != null){
			this.setViewer(this.viewer);
		}

		this.maplex = new GeoBeans.Maplex(this);

		this.events = [];
		// console.log(this.viewer.toString());
		var that = this;
		var resizeId;
		window.onresize = function(flag){
			clearTimeout(resizeId);
			resizeId = setTimeout(function(){
				var height = that.mapDiv.height();
				var width = that.mapDiv.width();
				if(height == 0 ||  width == 0){
					return;
				}
				if(height == that.canvas.height && width == that.canvas.width){
					return;
				}
				console.log('before:height[' + that.canvas.height + "]");
				console.log('before:width[' + that.canvas.width + "]");

				that.canvas.height = height;
				that.canvas.width = width;
				console.log('after:height[' + that.canvas.height + "]");
				console.log('after:width[' + that.canvas.width + "]");
				that.height = height;
				that.width = width;
				// flag = "width";

				var viewer = that.viewer;
				if(viewer != null){
					var xmin = viewer.xmin;
					var xmax = viewer.xmax;
					var ymin = viewer.ymin;
					var ymax = viewer.ymax;
					if(!$.isNumeric(xmin) || !$.isNumeric(xmax) || !$.isNumeric(ymin) || !$.isNumeric(ymax)){
						return;
					}
				}

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
					console.log(that.viewer.toString());


					that.transformation.update();

					var layers = that.layers;
					for(var i = 0; i < layers.length;++i){
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
							var featureLayerCanvas = layer.featureLayerCanvas;
							if(featureLayerCanvas != null){
								featureLayerCanvas.height = height;
								featureLayerCanvas.width = width;
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
		if(this.infoWindow!=undefined)
		{
			if(this.infoWindow.popover!=undefined)
			{
				this.infoWindow.popover({
					animation: false,
					trigger: 'manual',
					placement : 'top',
					html : true
				});			
			}
		}


		var copyRightHtml = "<div class='map5-copyright'>GeoBeans © </div>";
		$("#" + id).append(copyRightHtml);

		// tooltip
		var tooltipHtml = "<div class='map5-tooltip'></div>";
		this.mapDiv.append(tooltipHtml);

		// 授权时间
		this.authTime = new Date("2016-07-26 00:00:00");
	},
	
	destroy : function(){


		this.mapDiv.find(".chart-legend ").remove();
		this.mapDiv.find("canvas").remove();
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.setNavControl(false);
		this.controls.cleanup();
		this.infoWindow.popover("destroy");
		this.unRegisterMapRippleHitEvent();
		this.controls.cleanup();


		this.canvas = null;
		this.animateCanvas = null;
		this.baseLayerCanvas = null;
		this.renderer = null;
		this.layers = null;
		this.transformation = null;
		this.controls = null;
		this.infoWindow = null;
		this.stopAnimate();
		this.mapDiv = null;
		
	},

	// 关闭地图
	close : function(){
		
		this.destroy();

	},

	//重绘，大小改变时候
	resize : function(flag){
		var handler = window.onresize;
		handler.apply(window,[flag]);
	},

	//本地读取
	// 暂时注销
	// getLayers : function(){
	// 	var layers = [];
	// 	var dbLayers = this.groupLayer.getLayers();
	// 	for(var i = 0; i < dbLayers.length;++i){
	// 		layers.push(dbLayers[i]);
	// 	}
	// 	for(var i = 0; i < this.layers.length;++i){
	// 		layers.push(this.layers[i]);
	// 	}
	// 	return layers;
	// },

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
	
	// addLayer : function(layer,callback){
	// 	if(layer == null){
	// 		if(callback != null){
	// 			callback("layer is null");
	// 		}
	// 		return;
	// 	}

	// 	var l = this.getLayer(layer.name);
	// 	if(l != null){
	// 		if(callback != null){
	// 			callback("this map has [" + layer.name + "] layer");
	// 		}
	// 		return;
	// 	}
	// 	if(layer!=null){
	// 		if(layer instanceof GeoBeans.Layer.DBLayer){
	// 			this.mapWorkspace.registerLayer(layer,
	// 				this.addLayer_callback,callback);
	// 		}else if(layer instanceof GeoBeans.Layer.WMTSLayer){
	// 			layer.setMap(this);
	// 			// WMTS图层，可设置为底图
	// 			if(this.baseLayer == null){
	// 				this.setBaseLayer(layer);
	// 				if(this.level == null){
	// 					var level = this.getLevel(this.viewer);
	// 					this.setLevel(level);
	// 				}
	// 			}else{
	// 				this.layers.push(layer);
	// 			}
	// 		}else{
	// 			this.layers.push(layer);
	// 			layer.setMap(this);
	// 			if(callback != null){
	// 				callback("success");
	// 			}
	// 		}

	// 	}
	// },

	// 统一添加图层
	addLayer : function(layer){
		if(layer == null){
			return "";
		}

		var l = this.getLayer(layer.name);
		if(l != null){
			console.log("this map has [" + layer.name + "] layer")
			return "this map has [" + layer.name + "] layer";
		}
		if(layer instanceof GeoBeans.Layer.ChartLayer ){
			var l = this.getLayer(layer.baseLayerName);
			if(l == null){
				console.log("this map does not has [" + layer.baseLayerName + "] layer");
				return "this map does not has [" + layer.baseLayerName + "] layer";
			}
			if(layer instanceof GeoBeans.Layer.RangeChartLayer){
				var index = l.featureType.getFieldIndex(layer.baseLayerField);
				if(index == -1){
					console.log("layer does not has this field[" +　layer.baseLayerField + "]");
					return "layer does not has this field[" +　layer.baseLayerField + "]";	
				}
			}
			if(layer instanceof GeoBeans.Layer.HeatMapLayer){
				var geomType = l.getGeomType();
				if(geomType != GeoBeans.Geometry.Type.POINT){
					console.log("base layer is not point layer");
					return "base layer is not point layer";
				}
			}
		}
		this.layers.push(layer);
		if(layer instanceof GeoBeans.Layer.TileLayer){
			if(this.baseLayer == null){
				this.baseLayer = layer;
			}
		}
		layer.setMap(this);
	},
	// 插入一个图层
	// insertLayer : function(layer,callback){
	// 	if(layer == null){
	// 		if(callback != null){
	// 			callback("layer is null");
	// 		}
	// 		return;
	// 	}
	// 	var l = this.getLayer(layer.name);
	// 	if(l != null){
	// 		if(callback != null){
	// 			callback("this map has [" + layer.name + "] layer");
	// 		}
	// 		return;
	// 	}
	// 	if(layer != null){
	// 		if(layer instanceof GeoBeans.Layer.DBLayer){
	// 			this.mapWorkspace.registerLayer(layer,
	// 				this.insertLayer_callback,callback);
	// 		}else if(layer instanceof GeoBeans.Layer.WMTSLayer){
	// 			layer.setMap(this);
	// 			if(this.baseLayer == null){
	// 				this.setBaseLayer(layer);
	// 				if(this.level == null){
	// 					var level = this.getLevel(this.viewer);
	// 					this.setLevel(level);
	// 				}
	// 				if(callback != null){
	// 					callback('success');
	// 				}
	// 			}else{
	// 				if(callback != null){
	// 					callback("this map has another base layer");
	// 				}
	// 				return;
	// 				// this.layers.unshift(layer);
	// 			}
	// 		}else{
	// 			this.layers.unshift(layer);
	// 			layer.setMap(this);
	// 			if(callback != null){
	// 				callback("success");
	// 			}
	// 		}
	// 	}
	// },

	// addLayer_callback : function(result,map,layer,callback){
	// 	if(result instanceof GeoBeans.Layer){
	// 		if(result instanceof GeoBeans.Layer.DBLayer){
	// 			map.groupLayer.addLayer(result);
	// 			result.setMap(map);
	// 		}
	// 		if(callback != null){
	// 			callback("success");
	// 		}
	// 		map.draw();
	// 	}else{
	// 		if(callback != null){
	// 			callback(result);
	// 		}
	// 	}
	// },

	// 初始化底图
	// 暂时注销
	// initBaseLayer : function(){
	// 	var level = this.level; 
	// 	if(this.level == null){
	// 		viewer = this.viewer;
	// 		level = this.getLevel(viewer);
	// 	}
	// 	if(this.baseLayer.imageScale == 1.0){

	// 	}else{
	// 		this._setLevel(level);
	// 	}
		

	// 	var center = this.center;
	// 	if(center == null){
	// 		center = new GeoBeans.Geometry.Point(0,0);	
	// 		this.setCenter(center);
	// 	}
	// },

	// 需要向服务端注册
	// 暂时注销
	// insertLayer : function(layer,callback){
	// 	if(layer == null){
	// 		if(callback != null){
	// 			callback("layer is null");
	// 		}
	// 		return;
	// 	}

	// 	var l = this.getLayer(layer.name);
	// 	if(l != null){
	// 		if(callback != null){
	// 			callback("this map has [" + layer.name + "] layer");
	// 		}
	// 		return;
	// 	}

	// 	// 数据库图层
	// 	if(layer instanceof GeoBeans.Layer.DBLayer ){
	// 		this.mapWorkspace.registerLayer(layer,this.insertLayer_callback,callback);
	// 		return;
	// 	}
	// 	// 底图，先删除
	// 	if(layer instanceof GeoBeans.Layer.TileLayer){
	// 		if(this.baseLayer != null){
	// 			this.baseLayer_change = layer;
	// 			this.unRegisterBaseLayer(callback);
	// 			// this.removeLayer(this.baseLayer);
	// 			return;
	// 		}else{
	// 			this.mapWorkspace.registerLayer(layer,this.insertLayer_callback,callback);
	// 			return;
	// 		}
	// 	}

	// 	this.layers.unshift(layer);
	// 	layer.setMap(this);
	// 	if(callback != null){
	// 		callback("success");
	// 	}
	// },

	// insertLayer_callback : function(result,map,layer,callback){
	// 	if(result instanceof GeoBeans.Layer){
	// 		if(result instanceof GeoBeans.Layer.DBLayer){
	// 			map.groupLayer.insertLayer(result);
	// 			result.setMap(map);
	// 		}else if(result instanceof GeoBeans.Layer.TileLayer){
	// 			map.setBaseLayer(result);
	// 		}
	// 		if(callback != null){
	// 			callback("success",layer);
	// 		}
	// 		map.draw();
	// 	}else{
	// 		if(callback != null){
	// 			callback(result);
	// 		}
	// 	}
	// },

	removeLayer : function(name,callback){
	 	if(name == null){
	 		return;
	 	}

	 	var layer = this.getLayer(name);
	 	if(layer == null){
	 		return;
	 	}
	 	
 		var layers = this.layers;
 		for(var i = 0; i < layers.length;++i){
 			if(layer.name == layers[i].name){
 				if(layer== this.baseLayer){
 					this.removeBaseLayer();
 				}
 				this.layers.splice(i,1);
 				layer.destroy();
 				layer = null;
 				if(callback != undefined){
 					callback("success");
 				}
 				break;
 			}
 		}
	 },

	 removeBaseLayer : function(){
	 	var baseLayerName = this.baseLayer.name;

	 	var layer = null;
	 	for(var i = 0; i < this.layers.length;++i){
	 		layer = this.layers[i];
	 		if(layer instanceof GeoBeans.Layer.TileLayer && layer != this.baseLayer){
	 			this.baseLayer = layer;
	 		}
	 	}
	 	if(this.baseLayer.name == baseLayerName){
	 		this.baseLayer = null;
	 		this.level = null;
	 	}
	 	this.baseLayerRenderer.clearRect();
	 },

	 // 暂时注销
	// unRegisterLayer_callback : function(result,map,layerName,callback){
	// 	var layer = map.getLayer(layerName);
	// 	if(result == "success"){
	// 		if(layer instanceof GeoBeans.Layer.DBLayer){
	// 			map.groupLayer.removeLayer(layer);
	// 		}
	// 		map.draw();
	// 		if(callback != null){
	// 			callback(result);
	// 		}
			
	// 	}else{
	// 		if(callback != null){
	// 			callback(result);
	// 		}
	// 	}
	// },

	// 暂时注销
	// setStyle : function(typeName,style,callback){
	// 	var layer = this.getLayer(typeName);
	// 	if(layer instanceof GeoBeans.Layer.FeatureDBLayer){
	// 		this.mapWorkspace.setStyle(typeName,
	// 		style,this.setStyle_callback,
	// 		callback);
	// 	}else if(layer instanceof GeoBeans.Layer.WFSLayer){
	// 		layer.setStyle(style);
	// 		callback("set " + layer.name + "style ");
	// 	}
	// },

	// setStyle_callback : function(result,map,typeName,style,callback){
	// 	var layer = map.getLayer(typeName);
	// 	if(layer instanceof GeoBeans.Layer.DBLayer){
	// 		map.groupLayer.update();
	// 		layer.update();
	// 	}
	// 	if(result == "success"){
	// 		layer.setStyle(style);
	// 		callback(result);
	// 	}else{
	// 		callback(result);
	// 	}
	// },

	// 服务端注销底图
	// unRegisterBaseLayer : function(callback){
	// 	if(this.baseLayer != null){
	// 		this.mapWorkspace.unRegisterLayer(this.baseLayer.name,
	//  				this.unRegisterBaseLayer_callback,callback);
	// 	}
	// },

	// unRegisterBaseLayer_callback : function(result,map,layerName,callback){
	// 	if(result == "success"){
	// 		map.removeBaseLayer();
	// 		if(map.baseLayer_change != null){
	// 			map.insertLayer(map.baseLayer_change,callback);
	// 			map.baseLayer_change = null;
	// 			return;
	// 		}
	// 		if(callback != null){
	// 			callback("success");
	// 		}
	// 	}else{
	// 		if(callback != null){
	// 			callback(result);
	// 		}
	// 	}
	// },


	
	setViewer : function(extent){	
		// if(extent == null){
		// 	return;
		// }	
		// this.viewer = this.scaleView(extent);
		// this.transformation.update();
		if(extent == null){
			return;
		}
		if(this.baseLayer != null){
			var level = this.getLevel(extent);
			this._setLevel(level);
			// console.log(level);
			var center = extent.getCenter();
			this.setCenter(center);
		}else{
			// this.map.setViewer(rect);
			this.viewer = this.scaleView(extent);
			this.transformation.update();
		}
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

	getCenter : function(){
		return this.center;
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
			
			// this.baseLayer.scale = 1.0;
			this.baseLayer.imageScale = 1.0;
			this.resolution = this.baseLayer.getResolutionByLevel(level);
			this.updateMapExtent(this.resolution);
			
			this.transformation.update();
		}
	},

	// 不改变缩放比例
	_setLevel :function(level){
		this.level = level;
		if(this.baseLayer!=null){
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
	
	// setBaseLayer : function(layer){
	// 	this.baseLayer = layer;
	// 	if(this.baseLayer!=null){
	// 		this.baseLayer.setMap(this);
	// 	}
	// },


	// setBaseLayer : function(layer){
	// 	// if(this.baseLayer != null){
	// 	// 	this.baseLayer.cleanup();
	// 	// 	// this.baseLayer_change = layer;
	// 	// 	this.removeBaseLayer(callback);
	// 	// }else{
	// 		this.baseLayer = layer;
	// 		if(this.baseLayer != null){
	// 			var baseLayerCanvas = this.baseLayerCanvas;
	// 			if(baseLayerCanvas == null){
	// 				var canvasID = this.id + "_canvas";
	// 				var baseCanvasID = this.id + "_basecanvas";
	// 				var canvasHtml = "<canvas  id='" + baseCanvasID  +"' class='map5-base-canvas' height='" 
	// 							+ this.canvas.height + "' width='" 
	// 							+ this.canvas.width + "'></canvas>";
	// 				this.mapDiv.find("#" + canvasID).after(canvasHtml);
	// 				this.baseLayerCanvas = document.getElementById(baseCanvasID);
	// 			}
	// 			this.baseLayer.map = this;
	// 			this.baseLayer.canvas = this.baseLayerCanvas;
	// 			this.baseLayer.renderer = new GeoBeans.Renderer(this.baseLayerCanvas);
	// 		}
	// 	// }
	// },

	// 不注册
	setBaseLayer : function(layer){
		if(this.baseLayer != null){
			this.removeBaseLayer();
		}
		this.baseLayer = layer;
		if(this.baseLayer != null){
			var baseLayerCanvas = this.baseLayerCanvas;
			if(baseLayerCanvas == null){
				var canvasID = this.id + "_canvas";
				var baseCanvasID = this.id + "_basecanvas";
				var canvasHtml = "<canvas  id='" + baseCanvasID  +"' class='map5-base-canvas' height='" 
							+ this.canvas.height + "' width='" 
							+ this.canvas.width + "'></canvas>";
				this.mapDiv.find("#" + canvasID).after(canvasHtml);
				this.baseLayerCanvas = document.getElementById(baseCanvasID);
			}
			this.baseLayer.map = this;
			this.baseLayer.canvas = this.baseLayerCanvas;
			this.baseLayer.renderer = new GeoBeans.Renderer(this.baseLayerCanvas);
		}
	},

	// // 不注销
	// removeBaseLayer : function(){
	// 	if(this.baseLayer != null){
	// 		this.baseLayer.renderer.clearRect();
	// 		this.baseLayerCanvas.remove();
	// 		this.baseLayerCanvas = null;
	// 		this.baseLayerSnap = null;
	// 		this.baseLayer.destroy();
	// 		this.baseLayer = null;
	// 		this.level = null;
	// 	}
	// },

	getBaseLayer : function(){
		return this.baseLayer;
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

		// 考虑角度
		// var mw = resolution * Math.cos(-this.rotateAngle*Math.PI/180) * vw / 2; 
		// var mh = resolution * Math.sin(-this.rotateAngle*Math.PI/180) * vh / 2; 
		
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

		var viewer = this.viewer;
		// var rotateViewer = this.viewer.rotate(this.rotateAngle);
		// // rotateViewer.union(viewer);
		// // 
		// this.viewer = rotateViewer;

	},
	
	/**
     * 根据viewer反算level
     */	
    getLevel:function(viewer){
    	// new add
    	if(viewer == null){
    		return this.level;
    	}
    	// var cx = this.center.x;
    	// var cy = this.center.y;
    	var cx = viewer.getCenter().x;
    	var cy = viewer.getCenter().y;
    	var vw = this.width;
    	var vh = this.height;

    	var mw = cx - viewer.xmin;
    	var mh = cy - viewer.ymin;

    	var resolution = mw*2/vw;
    	if(this.baseLayer == null){
    		return null;
    	}
    	var level = this.baseLayer.getLevel(resolution);
    	if(level == null){
    		return 1;
    	}
    	return level;
    },

    // 获取最大图层
    getMaxLevel : function(){
    	var layer = null;
    	var maxLevel = null;
    	for(var i = 0; i < this.layers.length;++i){
    		layer = this.layers[i];
    		if(layer instanceof GeoBeans.Layer.TileLayer){
    			var level = layer.getMaxLevel();
    			if(maxLevel == null){
    				maxLevel = level;
    			}else{
    				if(level > maxLevel){
    					maxLevel = level;
    				}
    			}
    		}
    	}
    	return maxLevel;
    },

    // 获取最小图层
    getMinLevel : function(){
    	var layer = null;
    	var minLevel = null;
    	for(var i = 0; i < this.layers.length;++i){
    		layer = this.layers[i];
    		if(layer instanceof GeoBeans.Layer.TileLayer){
    			var level = layer.getMinLevel();
    			if(minLevel == null){
    				minLevel = level;
    			}else{
    				if(level < minLevel){
    					minLevel = level;
    				}
    			}
    		}
    	}
    	return minLevel;
    },

   	// 暂时注销
    // // 默认是整体绘制的，但是若设置单独绘制则flag为真
    // setDrawLayerSingle : function(flag){
    // 	if(flag){
    // 		this.totalFlag = false;
    // 	}else{
    // 		this.totalFlag = true;
    // 	}
    // },

    // setDrawFeatureLayerLocal : function(flag){
    // 	if(flag){
    // 		this.drawLocalFlag = true;
    // 		// 同时需要分开绘制
    // 		this.setDrawLayerSingle(true);
    // 	}else{
    // 		this.drawLocalFlag = false;
    // 	}
    // },

    // totalFlag 是否所有的一起刷新
	draw : function(){
		var time = new Date();
		// var delta = time.getTime() - this.authTime.getTime();
		// if(delta > 30*24*3600*1000){
		// 	alert("请联系管理员进行授权");
		// 	return;
		// }

		// this.renderer.save();
		this.time = new Date();
		// if(this.baseLayer!=null){
		// 	if(this.baseLayer.visible){
				
		// 		this.initBaseLayer();
		// 		this.baseLayer.preDraw();
		// 		this.baseLayer.loadingTiles(this.drawBaseLayerCallback);
		// 	}else{
		// 		this.baseLayer.renderer.clearRect();
		// 	}
		// 	this.drawLayersAll();
		// }else{
		// 	this.drawLayersAll();
		// 	this.renderer.restore();			
		// }
		var layer = null;
		for(var i = 0; i < this.layers.length;++i){
			layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer){
				if(this.level == null){
					var level = this.getLevel(this.viewer);
					this.level = level;
				}
				layer.preDraw();
				layer.loadingTiles(this.drawBaseLayerCallback);
			}
		}
		this.drawLayersAll();
		// this.renderer.restore();

		//设置地图控件
		this.mapNavControl.setZoomSlider(this.level);
	},

	drawBaseLayerCallback:function(map){
		// map.drawLayersAll();
		// map.renderer.restore();
	},

	// 暂时注销
	// //绘制hit图层
	// drawHitLayer : function(){

	// 	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
	// 	//先绘制底图
	// 	if(this.baseLayer != null){
	// 		this.renderer.drawImage(this.baseLayer.canvas,0,0,this.baseLayer.canvas.width,this.baseLayer.canvas.height);
	// 	}
	// 	for(var i = 0; i < this.layers.length; ++i){
	// 		var layer = this.layers[i];

	// 		var canvas = layer.canvas;
	// 		this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
	// 		var hitCanvas = layer.hitCanvas;
	// 		if(hitCanvas != null){
	// 			this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
	// 		}
	// 	}
	// },

	//绘制所有图层，较为通用，包括hitCanvas和bufferCanvas
	drawLayersAll : function(){
		// this.mapDiv.find(".chart-legend:not(.chart-legend-range)").remove();
		
		this.maplex.cleanup();
		if(this.groupLayer.getLayers().length != 0){
			if(this.totalFlag){
				this.groupLayer.loadTotal();
			}else{
				this.groupLayer.load();
			}
		}
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			if(layer.visible && !(layer instanceof GeoBeans.Layer.TileLayer) ){
				layer.load();
			}
		}
		this.overlayLayer.load();

		this.queryLayer.load();

		this.panoramaLayer.load();

		this.imageLayer.load();

		if(this.groupLayer.getLayers().length != 0){
			if(this.groupLayer.flag == GeoBeans.Layer.Flag.READY){
				return;
			}
		}
		
		for(var i = 0; i < this.layers.length; ++i){
			var layer = this.layers[i];
			if(layer.visible && !(layer instanceof GeoBeans.Layer.TileLayer) ){
				if(layer.flag != GeoBeans.Layer.Flag.LOADED){
					return;
				}				
			}
			
		}

		var overlayLayerFlag = this.overlayLayer.getLoadFlag();
		if(overlayLayerFlag != GeoBeans.Layer.Flag.LOADED){
			return;
		}

		if(this.queryLayer.flag != GeoBeans.Layer.Flag.LOADED){
			return;
		}

		var panoramaLayerFlag = this.panoramaLayer.getLoadFlag();
		if(panoramaLayerFlag != GeoBeans.Layer.Flag.LOADED){
			return;
		}

		var imageLayerFlag = this.imageLayer.getLoadFlag();
		if(imageLayerFlag != GeoBeans.Layer.Flag.LOADED){
			return;
		}

		// this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		// if(this.backgroundColor != null){
		// 	var color = this.backgroundColor.getRgba();
		// 	this.renderer.context.fillStyle = color;
		// 	this.renderer.context.fillRect()
		// }
		// this.drawBackground();
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);

		if(this.groupLayer.getLayers().length != 0
			&& this.groupLayer.visible && this.groupLayer.flag == GeoBeans.Layer.Flag.LOADED){
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
			if(layer instanceof GeoBeans.Layer.RippleLayer){
				continue;
			}
			if(!layer.visible || (layer instanceof GeoBeans.Layer.TileLayer)){
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

			var clickCanvas = layer.clickCanvas;
			if(clickCanvas != null){
				this.renderer.drawImage(clickCanvas,0,0,clickCanvas.width,clickCanvas.height);
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

		var overlayClickCanvas = this.overlayLayer.clickCanvas;
		if(overlayClickCanvas != null){
			this.renderer.drawImage(overlayClickCanvas,0,0,overlayClickCanvas.width,overlayClickCanvas.height);
		}

		//queryLayer
		var queryLayerCanvas = this.queryLayer.canvas;
		if(queryLayerCanvas != null){
			this.renderer.drawImage(queryLayerCanvas,0,0,queryLayerCanvas.width,queryLayerCanvas.height);
		}


		// 全景图
		var panoramaLayerCanvas = this.panoramaLayer.canvas;
		if(panoramaLayerCanvas != null){
			this.renderer.drawImage(panoramaLayerCanvas,0,0,panoramaLayerCanvas.width,panoramaLayerCanvas.height);
		}

		// 图片图层
		var imageLayerCanvas = this.imageLayer.canvas;
		if(imageLayerCanvas != null){
			this.renderer.drawImage(imageLayerCanvas,0,0,imageLayerCanvas.width,imageLayerCanvas.height);	
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

		// 绘制图片

		this.maplex.draw();
		var maplexCanvas = this.maplex.canvas;
		if(maplexCanvas != null){
			this.renderer.drawImage(maplexCanvas,0,0,maplexCanvas.width,maplexCanvas.height);
		}

		// console.log(new Date() - this.time);
		// var height = this.height;
		// var width = this.width;
		
		// this.renderer.context.translate(-width/2,-height/2);
		// this.renderer.context.restore();
	},
	
	drawCache : function(){
		this.drawBackground();
		if(this.baseLayer!=null){
			this.baseLayer.drawCache();
		}
	},
	
	drawBackground : function(){
		// this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		// if(this.baseLayer != null){
		// 	this.baseLayer.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);	
		// }
		// if(this.backgroundColor != null){
		// 	var color = this.backgroundColor.getRgba();
		// 	this.renderer.context.fillStyle = color;
		// 	this.renderer.context.fillRect(0,0,this.width,this.height)
		// }


		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.baseLayerRenderer.clearRect(0,0,this.baseLayerCanvas.width,this.baseLayerCanvas.height);

		this.renderer.restore();
		this.baseLayerRenderer.restore();
	},

	
	enableDrag : function(dragable){
		var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		if(i>=0){
			this.controls.get(i).enable(dragable);
		}
	},

	enableScroll : function(flag){
		var i = this.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
		if(i>=0){
			this.controls.get(i).enable(flag);
		}
	},
	
	addEventListener : function(event, handler){
		var map = this;
		var eventHandler = function(evt){
			evt.preventDefault();
			var x = evt.layerX;
			var y = evt.layerY;
			if(map.transformation == null){
				return;
			}
			var mp = map.transformation.toMapPoint(x, y);
			var args = new GeoBeans.Event.MouseArgs();
			args.buttn = null;
			args.X = x;
			args.Y = y;
			args.mapX = mp.x;
			args.mapY = mp.y;
			args.level = map.level;
			handler(args);
		};
		this.mapDiv[0].addEventListener(event,eventHandler);

		this.events.push({
			event :event,
			handler : handler,
			eventHandler : eventHandler
		});


	},

	removeEventListener : function(event,handler){
		var eventHandler = this._getEventHandler(event,handler);
		this.mapDiv[0].removeEventListener(event, eventHandler);
		this._removeEventHandler();
	},

	_getEventHandler : function(event,handler){
		for(var i = 0 ; i < this.events.length; ++i){
			var eventObj = this.events[i];
			if(eventObj.event == event && eventObj.handler == handler){
				return eventObj.eventHandler;
			}
		}
		return null;
	},

	_removeEventHandler : function(event,handler){
		for(var i = 0 ; i < this.events.length; ++i){
			var eventObj = this.events[i];
			if(eventObj.event == event && eventObj.handler == handler){
				this.events.splice(i,1);
			}
		}
	},

	addWheelEventListener : function(handler){
		if(handler != null){
			var i = this.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
			var scrollControl = this.controls.get(i);
			if(scrollControl != null){
				scrollControl.userHandler = handler;
			}
		}
	},

	removeWheelEventListener : function(handler){
		var i = this.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
		var scrollControl = this.controls.get(i);
		if(scrollControl != null){
			scrollControl.userHandler = null;
		}
	},

	// 拖拽前
	addBeginDragEventListener : function(handler){
		if(handler != null){
			var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
			var dragControl = this.controls.get(i);
			if(dragControl != null){
				dragControl.beginDragHandler = handler;
			}
		}
	},

	// 拖拽
	addDraggingEventListener : function(handler){
		if(handler != null){
			var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
			var dragControl = this.controls.get(i);
			if(dragControl != null){
				dragControl.dragingHandler = handler;
			}
		}
	},

	// 结束拖拽
	addEndDragEventListener : function(handler){
		if(handler != null){
			var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
			var dragControl = this.controls.get(i);
			if(dragControl != null){
				dragControl.endDragHandler = handler;
			}
		}
	},


	removeBeginDragEventListener : function(){
		var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		var dragControl = this.controls.get(i);
		if(dragControl != null){
			dragControl.beginDragHandler = null;
		}
	},

	removeDraggingEventListener : function(handler){
		var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		var dragControl = this.controls.get(i);
		if(dragControl != null){
			dragControl.dragingHandler = null;
		}
	},

	removeEndDragEventListener : function(handler){
		var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		var dragControl = this.controls.get(i);
		if(dragControl != null){
			dragControl.endDragHandler = null;
		}
	},

	
	scaleView : function(extent){
		if(extent == null){
			return  null;
		}
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
		var w_scale = this.width / this.height;

		var w_2 = extent.getWidth() / 2;
		var h_2 = w_2 / w_scale;
		var viewer = new GeoBeans.Envelope(	extent.xmin,											
										this.center.y - h_2,
										extent.xmax,
										this.center.y + h_2);
		return viewer;
	},

	screenCopy : function(){
		var imgData = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		return imgData;
	},
	
	
	saveSnap : function(){
		// this.snap = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		// if(this.baseLayerCanvas != null){
		// 	this.baseLayerSnap = this.baseLayer.renderer.context.getImageData(0, 0, 
		// 		this.baseLayerCanvas.width, this.baseLayerCanvas.height);	
		// }
		
		this.snap = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		// var canvas = document.createElement("canvas");
		// canvas.height = this.height;
		// canvas.width = this.width;
		// canvas.getContext('2d').drawImage(this.baseLayerCanvas,0,0,this.baseLayerCanvas.width,this.baseLayerCanvas.height);
		// this.baseLayerSnap = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
		this.baseLayerSnap = this.baseLayerRenderer.context.getImageData(0, 0, 
				this.baseLayerCanvas.width, this.baseLayerCanvas.height);	
		for(var i = 0; i < this.layers.length;++i){
			var layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer){
				layer.snap = layer.renderer.context.getImageData(0,0,layer.canvas.width,layer.canvas.height);
			}
		}
	},
	
	restoreSnap : function(){
		if(this.snap!=null){
			this.renderer.context.putImageData(this.snap, 0, 0);
		}
		if(this.baseLayerSnap != null && this.baseLayer != null){
			this.baseLayer.renderer.context.putImageData(this.baseLayerSnap, 0, 0);	
		}
	},
	
	putSnap : function(x, y){
		if(x=='undefined')	x =0;
		if(y=='undefined')	y =0;
		if(this.snap!=null){
			this.renderer.context.putImageData(this.snap, x, y);
		}

		if(this.baseLayerSnap != null){
			this.baseLayerRenderer.context.putImageData(this.baseLayerSnap, x, y);
		}
	},
	
	cleanupSnap : function(){
		this.snap = null;
		this.baseLayerSnap = null;
		for(var i = 0; i < this.layers.length;++i){
			var layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer){
				layer.snap = null;	
			}
		}
	},

	drawBaseLayerSnap:function(level){
		var centerx = this.center.x;
		var centery = this.center.y;

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

		x = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.width);
		y = 0 - 1/2* ((Math.pow(2,zoom) - 1) * this.height);



		if(this.baseLayerSnap != null){
			var baseLayerCanvasNew = $("<canvas>")
			    .attr("width", this.baseLayerSnap.width)
			    .attr("height", this.baseLayerSnap.height)[0];
			baseLayerCanvasNew.getContext("2d").putImageData(this.baseLayerSnap, 0, 0);
			
			

			this.baseLayerRenderer.context.drawImage(baseLayerCanvasNew,x,y,width,height);
		}

		if(this.snap != null){
			var newCanvas = $("<canvas>")
			    .attr("width", this.snap.width)
			    .attr("height", this.snap.height)[0];
			newCanvas.getContext("2d").putImageData(this.snap, 0, 0);
			this.renderer.context.drawImage(newCanvas,x,y,width,height);
		}

		for(var i = 0; i < this.layers.length;++i){
			var layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer && level < layer.getMaxLevel()
				&& level > layer.getMinLevel()){
				var canvas = $("<canvas>")
				    .attr("width", layer.snap.width)
				    .attr("height", layer.snap.height)[0];
				canvas.getContext("2d").putImageData(layer.snap, 0, 0);
				layer.renderer.clearRect(0,0,layer.canvas.width,layer.canvas.height);
				layer.renderer.context.drawImage(canvas,x,y,width,height);
			}else{
				// layer.renderer.clearRect(0,0,layer.canvas.width,layer.canvas.height);
			}
		}

		
	},

	drawLayersSnap : function(zoom){
		var centerx = this.center.x;
		var centery = this.center.y;
		var x = null;
		var y = null;
		var width = null;
		var height = null;

		width = this.width / zoom;
		height = this.height / zoom;

		x = this.width/2  - 1/2* width;
		y = this.height/2 - 1/2* height;


		if(this.snap != null){
			var newCanvas = $("<canvas>")
			    .attr("width", this.snap.width)
			    .attr("height", this.snap.height)[0];
			newCanvas.getContext("2d").putImageData(this.snap, 0, 0);
			this.renderer.context.drawImage(newCanvas,x,y,width,height);
		}

		if(this.baseLayerSnap != null){
			var baseLayerCanvasNew = $("<canvas>")
			    .attr("width", this.baseLayerSnap.width)
			    .attr("height", this.baseLayerSnap.height)[0];
			baseLayerCanvasNew.getContext("2d").putImageData(this.baseLayerSnap, 0, 0);
			this.baseLayerRenderer.context.drawImage(baseLayerCanvasNew,x,y,width,height);
		}

		for(var i = 0; i < this.layers.length;++i){
			var layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer){
				var canvas = $("<canvas>")
				    .attr("width", layer.snap.width)
				    .attr("height", layer.snap.height)[0];
				canvas.getContext("2d").putImageData(layer.snap, 0, 0);
				layer.renderer.clearRect(0,0,layer.canvas.width,layer.canvas.height);
				layer.renderer.context.drawImage(canvas,x,y,width,height);
			}
		}
	},

	// 更新瓦片
	_updateTile : function(layer,x,y,img_size,img_size){
		if(layer == null){
			return;
		}
		this.baseLayerRenderer.save();
		var width = this.width;
		var height = this.height;
		if(this.rotateAngle != null){
			this.baseLayerRenderer.context.translate(width/2,height/2);
			this.baseLayerRenderer.context.rotate(this.rotateAngle* Math.PI/180);
			this.baseLayerRenderer.context.translate(-width/2,-height/2);
			this.baseLayerRenderer.context.clearRect(x,y,img_size,img_size);
		}
		for(var i = 0; i < this.layers.length;++i){
			var l = this.layers[i];
			if(l instanceof GeoBeans.Layer.TileLayer){
				if(this.rotateAngle != null){
					var rotateCanvas = l.getRotateCanvas();
					if(rotateCanvas != null){
						var x_2 = rotateCanvas.width/4 + x;
						var y_2 = rotateCanvas.height/4 + y;
						x_2 = Math.floor(x_2 + 0.5);
						y_2 = Math.floor(y_2 + 0.5);
						this.baseLayerRenderer.drawImageParms(rotateCanvas,x_2,y_2,img_size,img_size,x,y,img_size,img_size);
					}
				}else{
					this.baseLayerRenderer.drawImageParms(l.canvas,x,y,img_size,img_size,x,y,img_size,img_size);
				}
			}
		}
		this.baseLayerRenderer.restore();
	},

	//设置导航
	setNavControl:function(flag){
		if(this.mapNavControl== null){
			this.mapNavControl = new GeoBeans.Control.MapNavControl(this);
		}
		this.mapNavControl.setEnable(flag);
	},


	// 设置导航位置
	setNavControlPosition : function(left,top){
		this.mapNavControl.setPosition(left,top);
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

	removeOverlayObj : function(overlay){
		this.overlayLayer.removeOverlayObj(overlay);
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
		// return this.overlayLayer.overlays[id];
		return this.overlayLayer.getOverlay(id);
	},

	setFitView:function(overlay){
		if(overlay == null){
			return;
		}
		var extent = overlay.getExtent();
		this.viewer = this.scaleView(extent);
		this.transformation.update();
		var level = this.getLevel(this.viewer);
		this.setLevel(level);
		this.draw();
	},

	setOverlayVisible : function(overlay,visible){
		if(overlay != null){
			overlay.visible = visible;
		}
	},


	// 获取overlay绘制
	_getTrackOverlayControl : function(){
		var i = this.controls.find(GeoBeans.Control.Type.TRACKOVERLAY);
		if(i < 0){
			var control = new GeoBeans.Control.TrackOverlayControl();
			this.controls.add(control);
			return control;
		}
		return this.controls.get(i);
	},

	// 绘制marker标注
	drawMarker : function(symbolizer,callback){
		if(symbolizer == null){
			return;
		}
		var trackOverlayControl = this._getTrackOverlayControl();
		if(trackOverlayControl == null){
			return;
		}
		trackOverlayControl.trackMarker(symbolizer,callback);
	},

	// 绘制线标注
	drawPolyline : function(symbolizer,callback){
		if(symbolizer == null){
			return;
		}
		var trackOverlayControl = this._getTrackOverlayControl();
		if(trackOverlayControl == null){
			return;
		}
		trackOverlayControl.trackLine(symbolizer,callback);
	},

	drawPolygon : function(symbolizer,callback){
		if(symbolizer == null){
			return;
		}
		var trackOverlayControl = this._getTrackOverlayControl();
		if(trackOverlayControl == null){
			return;
		}
		trackOverlayControl.trackPolygon(symbolizer,callback);	
	},

	//注册hit和edit事件
	registerOverlayEvent:function(){
		this.overlayLayer.registerHitEvent();
	},
	unregisterOverlayEvent:function(){
		this.overlayLayer.unregisterHitEvent();
	},

	// 注册overlay 弹窗
	registerInfoWindowEvent : function(){
		this.overlayLayer.registerInfoWindowEvent();
	},
	unRegisterInfoWindowEvent : function(){
		this.overlayLayer.unRegisterInfoWindowEvent();
	},

	registerOverlayClickEvent : function(callback){
		this.overlayLayer.registerOverlayClickEvent(callback);
	},

	unRegisterOverlayClickEvent : function(){
		this.overlayLayer.unRegisterOverlayClickEvent();
	},

	// drawGeometry : function(){
	// 	// this.renderer.renderer
	// },

	//拉框查询
	queryByRect : function(layerName,style,callback,maxFeatures){
		if(layerName == null){
			return;
		}
		var layer = this.getLayer(layerName);
		if(layer == null){
			callback("map has not this layer");
			return;
		}
		// if(layer.type != GeoBeans.Layer.DBLayer.Type.Feature){
		// 	return;
		// }
		this.queryLayer.clearFeatures();
		this.queryLayer.maxFeatures = maxFeatures;
		
		this.queryTrackLayer = null;
		this.queryGeometry = null;
		this.tracker.trackRect(this.trackRect_callback
			,this,layer,style,callback);

	},

	trackRect_callback : function(rect,map,layer,style,callback_u){
		if(rect == null){
			return;
		}
		map.tracker.end();
		map.queryGeometry = rect;
		map.queryTrackLayer = layer;
		map.queryLayer.setLayer(layer,style);
		var filter = new GeoBeans.BBoxFilter(layer.featureType.geomFieldName,rect);
		layer.getFeatureFilter(filter,map.queryLayer.maxFeatures,null,null,callback_u);
		// var maxFeatures = map.queryLayer.maxFeatures;
		// var features = layer.getFeatureBBoxGet(rect,maxFeatures,null);
		// map.queryLayer.setFeatures(features);
		// callback_u(features);
		// map.queryLayer.maxFeatures = null;
	},

	// 缓冲区查询之圆缓冲区查询
	queryByBufferCircle : function(layerName,style,callback,maxFeatures){
		if(layerName == null){
			return;
		}
		var layer = this.getLayer(layerName);
		if(layer == null){
			callback("map has not this layer");
			return;
		}

		this.queryLayer.clearFeatures();
		this.queryLayer.maxFeatures = maxFeatures;
		this.queryTrackLayer = null;
		this.queryGeometry = null;
		var bufferTracker = this.getBufferTracker();
		this.queryLayer.setLayer(layer,style);
		bufferTracker.trackBufferCircle(layer,callback,this.callbackQueryByBufferTrack);
	},

	// 缓冲区查询之线缓冲区查询
	queryByBufferLine : function(layerName,distance,style,callback,maxFeatures){
		if(layerName == null){
			return;
		}
		var layer = this.getLayer(layerName);
		if(layer == null){
			callback("map has not this layer");
			return;
		}

		this.queryLayer.clearFeatures();
		this.queryLayer.maxFeatures = maxFeatures;
		this.queryTrackLayer = null;
		this.queryGeometry = null;
		var bufferTracker = this.getBufferTracker();
		this.queryLayer.setLayer(layer,style);
		bufferTracker.trackBufferLine(layer,distance,callback,this.callbackQueryByBufferTrack);
	},

	queryByBufferPolygon : function(layerName,distance,style,callback,maxFeatures){
		if(layerName == null){
			return;
		}
		var layer = this.getLayer(layerName);
		if(layer == null){
			callback("map has not this layer");
			return;
		}
		this.queryLayer.clearFeatures();
		this.queryLayer.maxFeatures = maxFeatures;
		this.queryTrackLayer = null;
		this.queryGeometry = null;
		var bufferTracker = this.getBufferTracker();
		this.queryLayer.setLayer(layer,style);
		bufferTracker.trackBufferPolygon(layer,distance,callback,this.callbackQueryByBufferTrack);
	},

	// 获取缓冲区
	getBufferTracker : function(){
		var index = this.controls.find(GeoBeans.Control.Type.TRACKBUFFER);
		if(index == -1){
			var bufferTracker = new GeoBeans.Control.TrackBufferControl();
			this.controls.add(bufferTracker);
			return bufferTracker;
		}else{
			return this.controls.get(index);
		}
	},

	_getBufferTracker : function(){
		var index = this.controls.find(GeoBeans.Control.Type.TRACKBUFFER);
		if(index == -1){
			return null;
		}else{
			return this.controls.get(index);
		}
	},

	callbackQueryByBufferTrack : function(layer,distance,geometry,callback){
		if(geometry == null || distance < 0){
			return;
		}
		var map = layer.map;
		var filter = new GeoBeans.DistanceBufferFilter(layer.featureType.geomFieldName,geometry,distance);
		var maxFeatures = map.queryLayer.maxFeatures;
		layer.getFeatureFilter(filter,maxFeatures,null,null,callback);

		map.queryLayer.maxFeatures = null;
	},



	// //拉框之分页查询
	// queryByRectPage : function(maxFeatures,offset){
	// 	if(this.queryTrackLayer != null && this.queryGeometry != null){
	// 		var features = this.queryTrackLayer.getFeatureBBoxGet(this.queryGeometry,
	// 			maxFeatures,offset);
	// 		this.queryLayer.setFeatures(features);
	// 		this.drawLayersAll();
	// 		return features;
	// 	}
	// 	return null;
	// },
	// queryByRectOutput : function(maxFeatures,offset){
	// 	if(this.queryTrackLayer != null && this.queryGeometry != null){
	// 		var url = this.queryTrackLayer.getFeautureBBoxGetOutput(this.queryGeometry,
	// 			maxFeatures,offset);
	// 		return url;
	// 	}
	// 	return null;
	// },

	//闪烁
	setFeatureBlink : function(feature,count){
		if(feature == null || count == null){
			return;
		}
		this.queryLayer.setFeatureBlink(feature,count);
	},

	// 暂时注销
	// //热力图
	// addHeatMap : function(layerName,field,uniqueValue,config){
	// 	var layer = this.getLayer(layerName);
	// 	if(layer == null){
	// 		return;
	// 	}
	// 	if(layer instanceof GeoBeans.Layer.DBLayer){
	// 		layer.addHeatMap(field,uniqueValue,config);
	// 	}
	// },

	// removeHeatMap : function(layerName){
	// 	var layer = this.getLayer(layerName);
	// 	if(layer == null){
	// 		return;
	// 	}
	// 	layer.removeHeatMap();
	// },

	// setHeatMapVisible : function(layerName,visible){
	// 	var layer = this.getLayer(layerName);
	// 	if(layer == null){
	// 		return;
	// 	}
	// 	layer.setHeatMapVisible(visible);
	// },

	//点击查询
	queryByClick : function(layerName,callback){
		this.endQuery();
		if(layerName == null){
			return;
		}
		var layer = this.getLayer(layerName);
		if(layer == null){
			return;
		}
		if(layer.type != GeoBeans.Layer.DBLayer.Type.Feature){
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

		// 按照图上距离来计算
		// var point_1 = new GeoBeans.Geometry.Point(point.x - map.tolerance/2,
		// 	point.y - map.tolerance/2);
		// var point_2 = new GeoBeans.Geometry.Point(point.x + map.tolerance/2,
		// 	point.y + map.tolerance/2);
	
		// 按照像素
		var tolerance = 5;
		var point_1 = new GeoBeans.Geometry.Point(point.x - tolerance/2,
			point.y - tolerance/2);
		var point_2 = new GeoBeans.Geometry.Point(point.x + tolerance/2,
			point.y + tolerance/2);
		var point_m_1 = map.transformation.toMapPoint(point_1.x,point_1.y);
		var point_m_2 = map.transformation.toMapPoint(point_2.x,point_2.y);
		var bbox = new GeoBeans.Envelope(point_m_1.x,point_m_2.y,
			point_m_2.x,point_m_1.y);
	
		var featureType = layer.getFeatureType();
		if(featureType == null){
			return;
		}

		//区分点线面
		var features = null;
		var obj = {map : map,layer:layer,callback : callback_u,point:point_m};
		if(layer.geomType == GeoBeans.Geometry.Type.POLYGON
			|| layer.geomType == GeoBeans.Geometry.Type.MULTIPOLYGON){
			// features = layer.getFeaturesWithin(point_m);
			
			featureType.getFeaturesWithinAsync(map.name,null,point_m,map.getClickFeatures_callback,
				null,obj);
		}else{
			// features = layer.getFeatureBBoxGet(bbox,null,null);
			var boxFilter = new GeoBeans.BBoxFilter();
			boxFilter.extent = bbox;
			var geomFieldName = featureType.geomFieldName;
			boxFilter.propName = geomFieldName;
			featureType.getFeaturesFilterAsync2(map.name,null,boxFilter,null,null,null,null,obj,
				map.getClickFeatures_callback);
		}
		// if(features == null ||features.length == 0){
		// 	map.infoWindow.popover("hide");
		// 	map.queryLayer.clearFeatures();
		// 	return;
		// }
		
		// var feature = features[0];
		// if(callback_u != null){
		// 	callback_u(layer,feature,point_m);
		// }
		// map.queryLayer.setLayer(layer);
		// map.queryLayer.setFeatures([feature]);
		// map.drawLayersAll();
	},

	getClickFeatures_callback : function(obj,features){
		if(features == null || obj == null){
			return;
		}
		var map = obj.map;
		var callback = obj.callback;
		var layer = obj.layer;
		var point = obj.point;
		if(map == null || callback == null || obj == null|| point == null){
			return;
		}
		if(features == null ||features.length == 0){
			map.infoWindow.popover("hide");
			map.queryLayer.clearFeatures();
			return;
		}
		var feature = features[0];
		if(callback != null){
			callback(layer,feature,point);
		}
		map.queryLayer.setLayer(layer);
		map.queryLayer.setFeatures([feature]);
		map.drawLayersAll();
		
	},


	//多边形查询
	queryByPolygon : function(layername,callback){
		if(layername == null){
			return;
		}
		var layer = this.getLayer(layername);
		if(layer == null){
			return;
		}
		if(layer.type != GeoBeans.Layer.DBLayer.Type.Feature){
			return;
		}
		this.queryLayer.clearFeatures();
		
		this.queryTrackLayer = null;
		this.queryGeometry = null;
		this.tracker.trackPolygon(this.trackPolygon_callback
			,this,layer,callback);
		
	},

	trackPolygon_callback : function(polygon,map,layer,callback_u){
		if(polygon == null || map == null || layer == null){
			return
		}
		map.tracker.end();
		map.queryGeometry = polygon;
		map.queryTrackLayer = layer;
		map.queryLayer.setLayer(layer);
		var filter = new GeoBeans.SpatialFilter();
		filter.geometry = polygon;
		filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
		var featureType = layer.getFeatureType();
		var geomName = featureType.geomFieldName;
		filter.propName = geomName;
		layer.getFeatureFilterCountAsync(filter,callback_u);
	},
	// // 多边形分页查询
	// queryByPolygonPage : function(maxFeatures,offset){
	// 	if(this.queryTrackLayer != null && this.queryGeometry != null){
	// 		var filter = new GeoBeans.SpatialFilter();
	// 		filter.geometry = this.queryGeometry;
	// 		filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
	// 		var featureType = this.queryTrackLayer.getFeatureType();
	// 		var geomName = featureType.geomFieldName;
	// 		filter.propName = geomName;
	// 		var features = this.queryTrackLayer.getFeatureFilter(filter,
	// 			maxFeatures,offset,null);
	// 		this.queryLayer.setFeatures(features);
	// 		this.drawLayersAll();
	// 		return features;
	// 	}
	// 	return null;
	// },

	// // 导出
	// queryByPolygonOutput : function(maxFeatures,offset){
	// 	if(this.queryTrackLayer != null && this.queryGeometry != null){
	// 		var filter = new GeoBeans.SpatialFilter();
	// 		filter.geometry = this.queryGeometry;
	// 		filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
	// 		var featureType = this.queryTrackLayer.getFeatureType();
	// 		var geomName = featureType.geomFieldName;
	// 		filter.propName = geomName;
	// 		var url = this.queryByFilterOutput(this.queryTrackLayer.name,filter,maxFeatures,offset);
	// 		return url;
	// 	}
	// 	return null;
	// },


	// // 线查询
	// queryByLine : function(layername,callback){
	// 	if(layername == null){
	// 		return;
	// 	}
	// 	var layer = this.getLayer(layername);
	// 	if(layer == null){
	// 		return;
	// 	}
	// 	if(layer.type != GeoBeans.Layer.DBLayer.Type.Feature){
	// 		return;
	// 	}
	// 	this.queryLayer.clearFeatures();
		
	// 	this.queryTrackLayer = null;
	// 	this.queryGeometry = null;
	// 	this.tracker.trackLine(this.trackLine_callback
	// 		,this,layer,callback);
	// },

	// trackLine_callback : function(line,map,layer,callback_u){
	// 	if(line == null || map == null || layer == null){
	// 		return
	// 	}
	// 	map.tracker.end();
	// 	map.queryGeometry = line;
	// 	map.queryTrackLayer = layer;
	// 	map.queryLayer.setLayer(layer);
	// 	var filter = new GeoBeans.SpatialFilter();
	// 	filter.geometry = line;
	// 	filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
	// 	var featureType = layer.getFeatureType();
	// 	var geomName = featureType.geomFieldName;
	// 	filter.propName = geomName;
	// 	layer.getFeatureFilterCountAsync(filter,callback_u);
	// },

	// // 线分页查询
	// queryByLinePage : function(maxFeatures,offset){
	// 	if(this.queryTrackLayer != null && this.queryGeometry != null){
	// 		var filter = new GeoBeans.SpatialFilter();
	// 		filter.geometry = this.queryGeometry;
	// 		filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
			
	// 		var featureType = this.queryTrackLayer.getFeatureType();
	// 		var geomName = featureType.geomFieldName;
	// 		filter.propName = geomName;
	// 		var features = this.queryTrackLayer.getFeatureFilter(filter,
	// 			maxFeatures,offset,null);
	// 		this.queryLayer.setFeatures(features);
	// 		this.drawLayersAll();
	// 		return features;
	// 	}
	// 	return null;
	// },

	// // 导出
	// queryByLineOutput : function(maxFeatures,offset){
	// 	if(this.queryTrackLayer != null && this.queryGeometry != null){
	// 		var filter = new GeoBeans.SpatialFilter();
	// 		filter.geometry = this.queryGeometry;
	// 		filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
	// 		var featureType = this.queryTrackLayer.getFeatureType();
	// 		var geomName = featureType.geomFieldName;
	// 		filter.propName = geomName;
	// 		var url = this.queryByFilterOutput(this.queryTrackLayer.name,filter,maxFeatures,offset);
	// 		return url;
	// 	}
	// 	return null;
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
		if(layer instanceof GeoBeans.Layer.DBLayer){
			layer.update();
		}
		
		var extent = layer.getExtent();
		if(extent == null){
			return;
		}
		if(this.baseLayer != null){
			var level = this.getLevel(extent);
			if(level == null){
				return;
			}
			var center = extent.getCenter();
			this.setLevel(level);
			this.setCenter(center);
		}else{
			this.setViewer(extent);
		}
		this.draw();
	},

	zoomToBaseLayer : function(){
		// var extent = this.extent;
		if(this.baseLayer == null){
			return;
		}
		var extent = this.baseLayer.extent;
		if(extent == null){
			if(this.baseLayer instanceof GeoBeans.Layer.QSLayer){
				extent = new GeoBeans.Envelope(-180,-90,180,90);
			}
			if(extent == null){
				return;
			}
		}
		var level = this.getLevel(extent);
		if(level == null){
			return;
		}
		this.setLevel(level);
		var center = extent.getCenter();
		if(center == null){
			return;
		}
		this.setCenter(center);
		this.draw();
	},

	// getFeatures : function(layerName,maxFeatures,offset){
	// 	if(layerName == null){
	// 		return null;
	// 	}

	// 	var layer = this.getLayer(layerName);
	// 	if(layer != null && layer instanceof GeoBeans.Layer.DBLayer){
	// 		var features = layer.getFeatureBBoxGet(null,maxFeatures,offset);
	// 		return features;
	// 	}
	// 	return null;
	// },


	getFeatureFilter : function(layerName,filter,maxFeatures,fields,style,callback){
		var layer = this.getLayer(layerName);
		if(layer == null){
			if(callback != null){
				callback("this is not layer named " + layername);
			}
			return;
		}
		// if(filter == null){
		// 	if(callback != null){
		// 		callback(" filter is null");
		// 	}
		// 	return;
		// }

		this.queryLayer.setLayer(layer,style);
		layer.getFeatureFilter(filter,maxFeatures,null,fields,callback);
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
	},


	// describe layer
	// 暂时注销
	// describeLayer : function(layerName,callback){
	// 	if(layerName == null){
	// 		if(callback != null){
	// 			callback("layername is null");
	// 		}
	// 		return;
	// 	}
	// 	this.mapWorkspace.describeLayer(layerName,
	// 				this.describeLayer_callback,callback);
	// },

	// describeLayer_callback : function(layerInfo,callback){
	// 	if(callback != null){
	// 		callback(layerInfo);
	// 	}
	// },


	refresh : function(){
		
	},

	// 增加全景图
	addPanorama : function(point,name,htmlPath,icon){
		this.panoramaLayer.addMarker(point,name,htmlPath,icon);
	},

	removePanorama : function(name){
		this.panoramaLayer.removeMarker(name);
	},

	clearPanoramas : function(){
		this.panoramaLayer.clearMarkers();
	},

	// 绘制图片
	drawImage : function(url,extent){
		this.imageLayer.addImage(url,extent);
	},


	//图例列表
	_addLegend : function(layer){
		if(layer == null){
			return;
		}

		var index = this._getLegendIndex();
		var obj = {
			index : index,
			layer : layer
		};
		this.legendList.push(obj);
		layer.legendIndex = index;
	},

	_removeLegend : function(legendIndex){
		var obj = null,l = null,index = null;
		for(var i = 0; i < this.legendList.length;++i){
			obj = this.legendList[i];
			l = obj.layer;
			index = obj.index;
			// if(legendIndex > index){
			// 	obj.index = index - 1;
			// 	l.legendIndex = index - 1;
			// }else if(legendIndex == index){
			// 	this.legendList.splice(i,1);
			// }
			if(legendIndex == index){
				this.legendList.splice(i,1);
			}
		}

		for(var i = 0;i < this.legendList.length;++i){
			obj = this.legendList[i];
			l = obj.layer;
			index = obj.index;
			if(index > legendIndex){
				obj.index = index - 1;
				l.legendIndex = index - 1;
			}
		}

	},

	_getLegendIndex : function(){
		// for(var i = 0; i < this.legendList.length; ++i){

		// }
		return this.legendList.length;
	},


	// 设置背景色
	setBackground : function(color){
		if(color == null){
			return;
		}
		this.backgroundColor = color;
	},

	// 开始动画
	beginAnimate : function(){
		if(this.animateCanvas == null){
			var canvas = this.mapDiv.find(".map5-animate-canvas");
			if(canvas.length == 0){
				var canvasID = this.id + "_canvas";
				var animateCanvasID = this.id + "_animatecanvas";
				var mapCanvasHtml = "<canvas  id='" + animateCanvasID + "' class='map5-animate-canvas' height='" 
								+ this.canvas.height + "' width='" 
								+ this.canvas.width + "'></canvas>";
				// map.mapDiv.find("canvas").after(mapCanvasHtml);
				this.mapDiv.find("#" + canvasID).after(mapCanvasHtml);
				this.animateCanvas = document.getElementById(animateCanvasID);
				var renderer = new GeoBeans.Renderer(this.animateCanvas);
				this.animateRenderer = renderer;
				window.map = this;
				window.requestNextAnimationFrame(this.rippleLayerAnimate);
			}			
		}
	},

	// 波纹点动画
	rippleLayerAnimate : function(time){

		var map = this.map;
		// var canvas = map.mapDiv.find(".map5-animate-canvas");
		// if(canvas.length == 0){
		// 	var canvasID = map.id + "_canvas";
		// 	var animateCanvasID = map.id + "_animatecanvas";
		// 	var mapCanvasHtml = "<canvas  id='" + animateCanvasID + "' class='map5-animate-canvas' height='" 
		// 					+ map.canvas.height + "' width='" 
		// 					+ map.canvas.width + "'></canvas>";
		// 	// map.mapDiv.find("canvas").after(mapCanvasHtml);
		// 	map.mapDiv.find("#" + canvasID).after(mapCanvasHtml);
		// 	map.animateCanvas = document.getElementById(animateCanvasID);
		// }
		// // var animateCanvas = document.getElementById("mapCanvas_animate");
		// var animateCanvas = map.animateCanvas;
		// var context = animateCanvas.getContext("2d");
		// context.clearRect(0,0,animateCanvas.width,animateCanvas.height);

		map.animateRenderer.clearRect();
		var rippleLayers = map._getRippleLayer();
		if(rippleLayers == null){
			return;
		}
		var layer = null;
		for(var i = 0;i < rippleLayers.length;++i){
			layer = rippleLayers[i];
			if(layer != null && layer.visible){
				// layer.animate(time);
				layer.draw(time);
				// var layerCanvas = layer.canvas;
				// context.drawImage(layerCanvas,0,0,map.canvas.width,map.canvas.height);
			}
		}


		var requestID = window.requestNextAnimationFrame(map.rippleLayerAnimate);
		map.requestID = requestID;
	},
	// 停止动画
	stopAnimate : function(){
		window.cancelAnimationFrame(this.requestID);		
	},

	_getRippleLayer : function(){
		var layers = this.getLayers();
		var rippleLayers = [];
		var layer = null;
		for(var i = 0; i < layers.length;++i){
			layer = layers[i];
			if(layer == null){
				continue;
			}
			if(layer instanceof GeoBeans.Layer.RippleLayer){
				rippleLayers.push(layer);
			}
		}
		return rippleLayers;
	},

	// // 图层名称，
	// registerRippleHitEvent : function(name,content){
	// 	var layer = this.getLayer(name);		
	// 	if(layer == null || !(layer instanceof GeoBeans.Layer.RippleLayer)){
	// 		return;
	// 	}
	// 	layer.registerHitEvent(content);
	// },

	// unRegisterRippleHitEvent : function(name){
	// 	var layer = this.getLayer(name);		
	// 	if(layer == null || !(layer instanceof GeoBeans.Layer.RippleLayer)){
	// 		return;
	// 	}
	// 	layer.unregisterHitEvent();
	// },


	tooltip : function(point,content){
		var spt = this.transformation.toScreenPoint(point.x,point.y);
		var position = 'left:' + spt.x + "px;top:" + spt.y + "px";
		
		this.mapDiv.find(".map5-tooltip").html(content);
		var left = spt.x;
		var top = spt.y;

		var itemHeight = this.mapDiv.find(".map5-tooltip").height();
		var itemWidth = this.mapDiv.find(".map5-tooltip").width();
		var x = itemWidth + spt.x;
		var y = itemHeight + spt.y;

		if(x >= this.width){
			left = spt.x - itemWidth;
		}
		if(y >= this.height){
			top = spt.y - itemHeight;
		}

		this.mapDiv.find(".map5-tooltip").css("left",left + "px");
		this.mapDiv.find(".map5-tooltip").css("top",top + "px");
		this.mapDiv.find(".map5-tooltip").css("display","block");
	},

	closeTooltip : function(){
		this.mapDiv.find(".map5-tooltip").css("display","none");
	},


	registerRippleHitEvent : function(name,content){
		var layer = this.getLayer(name);		
		if(layer == null || !(layer instanceof GeoBeans.Layer.RippleLayer)){
			return;
		}
		layer.setHitContent(content);

		if($.inArray(layer,this.hitRippleLayers) == -1){
			this.hitRippleLayers.push(layer);
		}	

		if(this.hitRippleLayers.length == 0){
			return;
		}

		if(this.hitRippleEvent != null){
			return;
		}


		var that = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 5;
		
		this.hitRippleEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					var mp = that.transformation.toMapPoint(evt.layerX, evt.layerY);
					
					var result = null;
					var index = null;
					var layers = that.getLayers();
					for(var i = 0; i < that.hitRippleLayers.length;++i){
						var layer = that.hitRippleLayers[i];
						if(layer != null){
							var layerResult = layer.hit(mp.x,mp.y);
							var layerIndex = layers.indexOf(layer);
							if(result != null){

								if(layerIndex > index){
									result = layerResult;
									index = layerIndex; 
								}
							}else{
								result = layerResult;
								index = layerIndex;
							}
						}
					}
					if(result == null){
						that.closeTooltip();
					}else{
						var point = new GeoBeans.Geometry.Point(mp.x, mp.y);
						that.tooltip(point,result);
					}
				}
			}

		};
		this.mapDiv[0].addEventListener('mousemove', this.hitRippleEvent);		
	},

	// 注销某个波纹图层的hit事件
	unRegisterRippleHitEvent : function(name){
		var layer = this.getLayer(name);		
		if(layer == null || !(layer instanceof GeoBeans.Layer.RippleLayer)){
			return;
		}
		layer.unregisterHitEvent();
		
		var layerIndex = this.hitRippleLayers.indexOf(layer);
		if(layerIndex != -1){
			this.hitRippleLayers.splice(layerIndex,1);
		}

		if(this.hitRippleLayers.length == 0){
			this.unRegisterMapRippleHitEvent();
		}
	},

	// 注销地图的波纹hit事件
	unRegisterMapRippleHitEvent : function(){
		this.mapDiv[0].removeEventListener('mousemove',this.hitRippleEvent);
		this.hitRippleEvent = null;		
	},


	zoomIn : function(){
		var i = this.controls.find(GeoBeans.Control.Type.ZOOM);
		if(i < 0){
			return;
		}
		var zoomControl = this.controls.get(i);
		zoomControl.setMode("in");
		zoomControl.trackRect();
	},

	zoomOut : function(){
		var i = this.controls.find(GeoBeans.Control.Type.ZOOM);
		if(i < 0){
			return;
		}
		var zoomControl = this.controls.get(i);
		zoomControl.setMode("out");
		zoomControl.trackRect();
	},

	endZoom : function(){
		var i = this.controls.find(GeoBeans.Control.Type.ZOOM);
		if(i < 0){
			return;
		}
		var zoomControl = this.controls.get(i);	
		zoomControl.end();	
	},

	// 注册featureLayer图层的点击事件
	registerClickEvent : function(layerName,style,callback){
		var layer = this.getLayer(layerName);
		if(layer == null || !(layer instanceof GeoBeans.Layer.FeatureLayer)){
			if(callback != null){
				console.log("layer is not feature layer");
				callback(null);
			}
			return;
		}

		layer.registerClickEvent(style,callback);
	},

	// 注销featureLayer 图层的点击事件
	unRegisterClickEvent :function(layerName){
		var layer = this.getLayer(layerName);
		if(layer == null || !(layer instanceof GeoBeans.Layer.FeatureLayer)){
			if(callback != null){
				callback("layer is not feature layer");
			}
			return;
		}
		layer.unRegisterClickEvent();
	},

	// 创建
	createFeatureLayer : function(layerName,fields,geomType){
		if(layerName == null || (!$.isArray(fields)) || geomType == null){
			return null;
		}
		var featureType = new GeoBeans.FeatureType(null,layerName);
		var fieldsArray = [];
		for(var i = 0; i < fields.length;++i){
			var f = fields[i];
			var type = f.type;
			var name = f.name;
			var field = new GeoBeans.Field(name, type, featureType,null);
			if(type == "geometry"){
				featureType.geomFieldName = name;
				field.setGeomType(geomType);
			}
			fieldsArray.push(field); 
		}

		featureType.fields = fieldsArray;

		var featureLayer = new GeoBeans.Layer.FeatureLayer(layerName);
		featureLayer.featureType = featureType;
		featureLayer.features = [];

		return featureLayer;
	},


	createFeatureLayerByKML : function(name,url){
		var kmlReader = new GeoBeans.KMLReader();
		var layer = kmlReader.read(name,url);
		return layer;
	},

	createFeatureLayerByGeoJson : function(name,url){
		var geoJsonReader = new GeoBeans.GeoJsonReader();
		var layer = geoJsonReader.read(name,url);
		return layer;
	},

	// 动画
	addMoveObject : function(moveObject){
		var layer = this._getAnimationLayer();
		if(layer != null){
			layer.addMoveObject(moveObject);
		}
	},

	// 按照id来计算
	getMoveObject : function(id){
		var layer = this._getAnimationLayer();
		if(layer != null){
			return layer.getMoveObject(id);			
		}
		return null;
	},

	removeMoveObject : function(id){
		var layer = this._getAnimationLayer();
		if(layer != null){
			layer.removeMoveObject(id);
		}
	},

	_getAnimationLayer : function(){
		if(this.animationLayer!= null){
			return this.animationLayer;
		}

		var layer = new GeoBeans.Layer.AnimationLayer();
		// this.addLayer(layer);
		this.layers.push(layer);
		layer.setMap(this);
		this.animationLayer = layer;
		return this.animationLayer;
	},


	// 旋转
	setRotate : function(angle){
		if(angle == null){
			return null;
		}
		this.rotateAngle = angle;
		this.rotateViewer();
	},

	rotateViewer : function(){
		
		var leftTop = this.transformation.toMapPoint(0,0);
		var leftBottom = this.transformation.toMapPoint(0,this.height);
		var rightTop = this.transformation.toMapPoint(this.width,0);
		var rightBottom = this.transformation.toMapPoint(this.width,this.height);

		var min_x = leftTop.x;
		var min_y = leftTop.y;
		var max_x = leftTop.x;
		var max_y = leftTop.y;

		min_x = (leftBottom.x  < min_x) ? leftBottom.x 	: min_x;
		min_x = (rightTop.x    < min_x) ? rightTop.x   	: min_x;
		min_x = (rightBottom.x < min_x) ? rightBottom.x : min_x;

		min_y = (leftBottom.y  < min_y) ? leftBottom.y 	: min_y;
		min_y = (rightTop.y    < min_y) ? rightTop.y   	: min_y;
		min_y = (rightBottom.y < min_y) ? rightBottom.y : min_y;

		max_x = (leftBottom.x  > max_x) ? leftBottom.x 	: max_x;
		max_x = (rightTop.x    > max_x) ? rightTop.x   	: max_x;
		max_x = (rightBottom.x > max_x) ? rightBottom.x : max_x;

		max_y = (leftBottom.y  > max_y) ? leftBottom.y 	: max_y;
		max_y = (rightTop.y    > max_y) ? rightTop.y   	: max_y;
		max_y = (rightBottom.y > max_y) ? rightBottom.y : max_y;

		var viewer = new GeoBeans.Envelope(min_x,min_y,max_x,max_y);
		this.viewer = viewer;
	},

	
});