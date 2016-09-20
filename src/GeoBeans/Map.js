// JavaScript Document
GeoBeans.Map = GeoBeans.Class({
	
	// TOLERANCE : 10,
	TOLERANCE : 20,
	
	_container : null,

	canvas : null,
	
	/**
	 * Map的事件集合
	 */
	events : null,
	
	/**
	 * Map的控件集合
	 */
	controls : null,

	/**
	 * Map交互控件集合
	 */
	_interactions : null,
	
	/**
	 * 地图当前视口
	 **/
	viewer : null,
	

	// srid : "EPGS : 4326",
	srid : 4326,
	
	minScale : null,	
	maxScale : null,
	
	width : null,	
	height : null,
	
	/**
	 * level有默认值null
	 **/
	level  : null,	
	resolution : null,
	
	layers : null,	
	baseLayer : null,
	overlayLayer : null,
	queryLayer : null,
	panoramaLayer : null,		// 全景图
	imageLayer : null,			// 图片图层
	hitRippleLayers : null,		// rippleLayer hit layers
	animationLayer : null,		// 动画图层
	
	
	renderer : null,
	
	bgColor : 'rgba(255,255,255,1)',
	
	/**
	 * 点击查询拾取的误差
	 * @type {Number}
	 */
	tolerance : 5,
	
	
	snap : null,
	baseLayerSnap : null,

	tracker : null,
	//拉框查询
	queryTrackLayer : null,
	// 鼠标track的查询空间数据
	queryGeometry : null,


	_infoWindowWidget : null,

	//图例列表
	legendList : null,
	
	baseLayerRenderer : null,
	animateCanvas : null,
	baseLayerCanvas : null,

	// 授权时间
	authTime : null,

	// resize的标识符
	_resizeId : null,

	// copyright
	_copyRightWidget : null,

	initialize: function (id,name,extent,srid,viewer) {	
		var mapContainer = document.getElementById(id);
		if(mapContainer == null){
			return null;
		}
		mapContainer.innerHTML = '';

		var option = {
			extent : extent,
			viewer : viewer,
		};
		this.viewer = new GeoBeans.Viewer(this,option);
		

		if(srid != null){
			this.srid = srid;
		}

		this.id = id;
		this.name = name;
		
		
		this.legendList = [];
		

		/**************************************************************************************/
		/* mapContainer Begin
		/**************************************************************************************/
		this.createMapContainer();
		
		/**************************************************************************************/
		/* mapContainer End
		/**************************************************************************************/

		/**************************************************************************************/
		/* Events Begin
		/**************************************************************************************/
		this.initEvents();
		/**************************************************************************************/
		/* Events End
		/**************************************************************************************/

		/**************************************************************************************/
		/* Controls Begin
		/**************************************************************************************/
		this.initControls();		
		/**************************************************************************************/
		/* Controls End
		/**************************************************************************************/

		/**************************************************************************************/
		/* Interactions Begin
		/**************************************************************************************/
		this.initInteractions();		
		/**************************************************************************************/
		/* Interactions End
		/**************************************************************************************/

		/**************************************************************************************/
		/* Widgets Begin
		/**************************************************************************************/
		this.initWidgets();
		
		/**************************************************************************************/
		/* Widgets End
		/**************************************************************************************/

		/**************************************************************************************/
		/* Layers Begin
		/**************************************************************************************/
		this.initLayers();
		/**************************************************************************************/
		/* Layers End
		/**************************************************************************************/
	
		this.maplex = new GeoBeans.Maplex(this);


		// 授权时间
		this.authTime = new Date("2016-07-26 00:00:00");

		/**************************************************************************************/
		/* window.onresize单独写一个函数
		/**************************************************************************************/	
		
		this.initResize();
	},
	
	destroy : function(){


		$(this._container).find(".chart-legend ").remove();
		$(this._container).find("canvas").remove();
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.setNavControl(false);
		this.controls.cleanup();
		this.unRegisterMapRippleHitEvent();
		this.controls.cleanup();
		this.viewer.cleanup();


		this.canvas = null;
		this.animateCanvas = null;
		this.baseLayerCanvas = null;
		this.renderer = null;
		this.layers = null;
		this.controls = null;
		this._infoWindowWidget = null;
		this.stopAnimate();
		this._container = null;
		
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


	getLayer : function(name){
		if(name == null || this.layers == null){
	 		return;
	 	}
	 	var layer = null;
	 	for(var i = 0; i < this.layers.length;++i){
	 		var layer = this.layers[i];
	 		if(layer.name == name){
	 			return layer;
	 		}
	 	}
	},
	
	// 统一添加图层
	addLayer : function(layer){
		if(layer == null){
			return "";
		}

		var l = this.getLayer(layer.name);
		if(l != null){
			//console.log("this map has [" + layer.name + "] layer")
			return "this map has [" + layer.name + "] layer";
		}
		if(layer instanceof GeoBeans.Layer.ChartLayer ){
			var l = this.getLayer(layer.baseLayerName);
			if(l == null){
				//console.log("this map does not has [" + layer.baseLayerName + "] layer");
				return "this map does not has [" + layer.baseLayerName + "] layer";
			}
			if(layer instanceof GeoBeans.Layer.RangeChartLayer){
				var index = l.featureType.getFieldIndex(layer.baseLayerField);
				if(index == -1){
					//console.log("layer does not has this field[" +　layer.baseLayerField + "]");
					return "layer does not has this field[" +　layer.baseLayerField + "]";	
				}
			}
			if(layer instanceof GeoBeans.Layer.HeatMapLayer){
				var geomType = l.getGeomType();
				if(geomType != GeoBeans.Geometry.Type.POINT){
					//console.log("base layer is not point layer");
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
 					//this.removeBaseLayer();
 					this.setBaseLayer(null);
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

	//  removeBaseLayer : function(){
	//  	var baseLayerName = this.baseLayer.name;

	//  	var layer = null;
	//  	for(var i = 0; i < this.layers.length;++i){
	//  		layer = this.layers[i];
	//  		if(layer instanceof GeoBeans.Layer.TileLayer && layer != this.baseLayer){
	//  			this.baseLayer = layer;
	//  		}
	//  	}
	//  	if(this.baseLayer.name == baseLayerName){
	//  		this.baseLayer = null;
	//  		this.level = null;
	//  	}
	//  	this.baseLayerRenderer.clearRect();
	// },
	
	getViewer : function(){		
		return this.viewer;
	},
	
	/**
	 * 更新center点后，需要更新map的视口
	 * 触发draw事件
	 **/
	// setCenter : function(center){
	// 	this.mapViewer.setCenter(center);
	// },

	// getCenter : function(){
	// 	return this.mapViewer.getCenter();
	// },

	// setLevel : function(level){
	// 	this.mapViewer.setLevel(level);
	// },

	
	/**
	 * 根据map的width和height的比例，重新计算extent的范围
	 * 1. extent的center保持不变
	 * 2. extent的长宽比和map一致
	 **/
	formulateExtent : function(extent){
		
	},
	
	// setResolution : function(resolution){
	// 	this.resolution = resolution;
	// },


	// getResolution : function(){
		
	// },
	
	getBaseLayer : function(){
		return this.baseLayer;
	},
	


	draw : function(){
		var time = new Date();
		// var delta = time.getTime() - this.authTime.getTime();
		// if(delta > 30*24*3600*1000){
		// 	alert("请联系管理员进行授权");
		// 	return;
		// }

		// this.renderer.save();
		this.time = new Date();

		// var layer = null;
		// var tileLayerCount = 0;
		// for(var i = 0; i < this.layers.length;++i){
		// 	layer = this.layers[i];
		// 	if(layer instanceof GeoBeans.Layer.TileLayer){
		// 		var viewer = this.getViewer();
		// 		var zoom = viewer.getZoom();
		// 		if(zoom == null){
		// 			var zoom = viewer.getZoomByExtent(viewer.getExtent());
		// 			viewer.setZoom(zoom);
		// 		}

		// 		if(layer.visible){
		// 			tileLayerCount++;
		// 			layer.preDraw();
		// 			layer.loadingTiles(this.drawBaseLayerCallback);
		// 		}
		// 	}
		// }
		// if(tileLayerCount == 0){
		// 	this.baseLayerRenderer.clearRect();
		// 	this.baseLayerSnap = null;
		// }

		this.drawBaseLayer();

		this.drawLayersAll();
		// this.renderer.restore();

		// Draw Interactions
		this.drawInteractions();

		//设置地图控件
		// this.mapNavControl.setZoomSlider(this.level);
		var index = this.controls.find(GeoBeans.Control.Type.NAV);
		var mapNavControl = this.controls.get(index);
		var zoom = this.getViewer().getZoom();
		mapNavControl.setZoomSlider(zoom);

	},



	drawBaseLayerCallback:function(map){
		
	},


	//绘制所有图层，较为通用，包括hitCanvas和bufferCanvas
	drawLayersAll : function(){
		
		this.maplex.cleanup();
		
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

		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);

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
			// var hitCanvas = layer.hitCanvas;
			// if(hitCanvas != null){
			// 	this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
			// }

			// var clickCanvas = layer.clickCanvas;
			// if(clickCanvas != null){
			// 	this.renderer.drawImage(clickCanvas,0,0,clickCanvas.width,clickCanvas.height);
			// }
			if(layer instanceof GeoBeans.Layer.ChartLayer){
				layer.showLegend();
			}
		}

		var canvas = this.overlayLayer.canvas;
		this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);

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

		var infoWindow = this.getInfoWindow();
		infoWindow.refresh();


		this.maplex.draw();
		var maplexCanvas = this.maplex.canvas;
		if(maplexCanvas != null){
			this.renderer.drawImage(maplexCanvas,0,0,maplexCanvas.width,maplexCanvas.height);
		}

	},
	

	// 有问题
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

	// 是否可以拖拽
	enableDrag : function(dragable){
		var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		if(i>=0){
			this.controls.get(i).enable(dragable);
		}
	},

	// 是否可以滚动
	enableScroll : function(flag){
		var i = this.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
		if(i>=0){
			this.controls.get(i).enable(flag);
		}
	},
	

	
	// 保存缩略图
	saveSnap : function(){
		this.snap = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this.baseLayerSnap = this.baseLayerRenderer.context.getImageData(0, 0, 
				this.baseLayerCanvas.width, this.baseLayerCanvas.height);	
		for(var i = 0; i < this.layers.length;++i){
			var layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer){
				layer.snap = layer.renderer.context.getImageData(0,0,layer.canvas.width,layer.canvas.height);
			}
		}
	},
	
	// 绘制缩略图
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

		for(var i = 0; i < this.layers.length;++i){
			var layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer && this.level < layer.getMaxZoom()){
				layer.renderer.clearRect();
				layer.renderer.context.putImageData(layer.snap, x, y);
			}
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

		var center = this.viewer.getCenter();
		if(center == null){
			return;
		}
		var centerx = center.x;
		var centery = center.y;

		var x = null;
		var y = null;
		var width = null;
		var height = null;
		var zoom = level - this.getViewer().getZoom();
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
			if(layer instanceof GeoBeans.Layer.TileLayer && level < layer.getMaxZoom()
				&& level > layer.getMinZoom()){
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
		var center = this.viewer.getCenter();
		var centerx = center.x;
		var centery = center.y;
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

		var viewer = this.getViewer();
		var rotation = viewer.getRotation();

		if(rotation != 0){
			this.baseLayerRenderer.context.translate(width/2,height/2);
			this.baseLayerRenderer.context.rotate(rotation* Math.PI/180);
			this.baseLayerRenderer.context.translate(-width/2,-height/2);
			this.baseLayerRenderer.context.clearRect(x,y,img_size,img_size);
		}else{
			this.baseLayerRenderer.context.clearRect(x,y,img_size,img_size);
		}
		if(this.layers == null){
			return;
		}
		for(var i = 0; i < this.layers.length;++i){
			var l = this.layers[i];
			if(l instanceof GeoBeans.Layer.TileLayer && l.visible){
				if(rotation != 0){
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
		var index = this.controls.find(GeoBeans.Control.Type.NAV);
		var mapNavControl = this.controls.get(index);
		mapNavControl.enable(flag);
	},

	// 设置导航位置
	setNavControlPosition : function(left,top){
		var index = this.controls.find(GeoBeans.Control.Type.NAV);
		var mapNavControl = this.controls.get(index);
		mapNavControl.setPosition(left,top);
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
		var viewer = this.viewer.scaleView(extent);
		this.viewer.extent = viewer;
		this.viewer.transformation.update();
		var level = this.viewer.getLevelByExtent(this.viewer.getExtent());
		viewer.setLevel(level);
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

	// 绘制面标注
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
		this.queryLayer.clearFeatures();
		this.queryLayer.maxFeatures = maxFeatures;
		
		this.queryTrackLayer = null;
		this.queryGeometry = null;
		this.tracker.trackRect(this.trackRect_callback,this,layer,style,callback);

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

	// 获取查询结果
	getQuerySelection : function(){
		return this.queryLayer.features;
	},

	//闪烁
	setFeatureBlink : function(feature,count){
		if(feature == null || count == null){
			return;
		}
		this.queryLayer.setFeatureBlink(feature,count);
	},

	// //点击查询
	// queryByClick : function(layerName,callback){
	// 	this.endQuery();
	// 	if(layerName == null){
	// 		return;
	// 	}
	// 	var layer = this.getLayer(layerName);
	// 	if(layer == null){
	// 		return;
	// 	}
	// 	if(layer.type != GeoBeans.Layer.DBLayer.Type.Feature){
	// 		return;
	// 	}
		

	// 	this.tracker.trackInfo(this.queryByClick_callback
	// 		,layer,this,callback);
	// },

	// queryByClick_callback : function(point,layer,map,callback_u){
	// 	// map.tracker.end();
	// 	if(point == null || layer == null){
	// 		return;
	// 	}
	// 	var point_m = map.transformation.toMapPoint(point.x,point.y);

	// 	// 按照图上距离来计算
	// 	// var point_1 = new GeoBeans.Geometry.Point(point.x - map.tolerance/2,
	// 	// 	point.y - map.tolerance/2);
	// 	// var point_2 = new GeoBeans.Geometry.Point(point.x + map.tolerance/2,
	// 	// 	point.y + map.tolerance/2);
	
	// 	// 按照像素
	// 	var tolerance = 5;
	// 	var point_1 = new GeoBeans.Geometry.Point(point.x - tolerance/2,
	// 		point.y - tolerance/2);
	// 	var point_2 = new GeoBeans.Geometry.Point(point.x + tolerance/2,
	// 		point.y + tolerance/2);
	// 	var point_m_1 = map.transformation.toMapPoint(point_1.x,point_1.y);
	// 	var point_m_2 = map.transformation.toMapPoint(point_2.x,point_2.y);
	// 	var bbox = new GeoBeans.Envelope(point_m_1.x,point_m_2.y,
	// 		point_m_2.x,point_m_1.y);
	
	// 	var featureType = layer.getFeatureType();
	// 	if(featureType == null){
	// 		return;
	// 	}

	// 	//区分点线面
	// 	var features = null;
	// 	var obj = {map : map,layer:layer,callback : callback_u,point:point_m};
	// 	if(layer.geomType == GeoBeans.Geometry.Type.POLYGON
	// 		|| layer.geomType == GeoBeans.Geometry.Type.MULTIPOLYGON){
	// 		// features = layer.getFeaturesWithin(point_m);
			
	// 		featureType.getFeaturesWithinAsync(map.name,null,point_m,map.getClickFeatures_callback,
	// 			null,obj);
	// 	}else{
	// 		// features = layer.getFeatureBBoxGet(bbox,null,null);
	// 		var boxFilter = new GeoBeans.BBoxFilter();
	// 		boxFilter.extent = bbox;
	// 		var geomFieldName = featureType.geomFieldName;
	// 		boxFilter.propName = geomFieldName;
	// 		featureType.getFeaturesFilterAsync2(map.name,null,boxFilter,null,null,null,null,obj,
	// 			map.getClickFeatures_callback);
	// 	}
	// },

	// getClickFeatures_callback : function(obj,features){
	// 	if(features == null || obj == null){
	// 		return;
	// 	}
	// 	var map = obj.map;
	// 	var callback = obj.callback;
	// 	var layer = obj.layer;
	// 	var point = obj.point;
	// 	if(map == null || callback == null || obj == null|| point == null){
	// 		return;
	// 	}
	// 	if(features == null ||features.length == 0){
	// 		map.infoWindow.popover("hide");
	// 		map.queryLayer.clearFeatures();
	// 		return;
	// 	}
	// 	var feature = features[0];
	// 	if(callback != null){
	// 		callback(layer,feature,point);
	// 	}
	// 	map.queryLayer.setLayer(layer);
	// 	map.queryLayer.setFeatures([feature]);
	// 	map.drawLayersAll();
	// },


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

	// 停止查询
	endQuery : function(){
		this.tracker.end();
		this.queryLayer.clearFeatures();
		// this.infoWindow.popover("hide");
		var infoWindow = this.getInfoWindow();
		infoWindow.show(false);
	},


	openInfoWindow : function(option,point){
		var infoWindowWidget = this.getInfoWindow();

		infoWindowWidget.setPosition(point);

		infoWindowWidget.setOption(option);

		infoWindowWidget.show(true);
	},

	closeInfoWindow : function(){
		var infoWindowWidget = this.getInfoWindow();
		infoWindowWidget.show(false);
	},


	// 修改后未调试
	// //zoomLayer
	// zoomToLayer : function(layerName){
	// 	if(layerName == null){
	// 		return;
	// 	}
	// 	var layer = this.getLayer(layerName);
	// 	if(layer == null){
	// 		return;
	// 	}
		
		
	// 	var extent = layer.                ();
	// 	if(extent == null){
	// 		return;
	// 	}
	// 	if(this.baseLayer != null){
	// 		var level = this.getLevel(extent);
	// 		if(level == null){
	// 			return;
	// 		}
	// 		var center = extent.getCenter();
	// 		this.setLevel(level);
	// 		this.setCenter(center);
	// 	}else{
	// 		this.setViewer(extent);
	// 	}
	// 	this.draw();
	// },

	// zoomToBaseLayer : function(){
	// 	// var extent = this.extent;
	// 	if(this.baseLayer == null){
	// 		return;
	// 	}
	// 	var extent = this.baseLayer.extent;
	// 	if(extent == null){
	// 		if(this.baseLayer instanceof GeoBeans.Layer.QSLayer){
	// 			extent = new GeoBeans.Envelope(-180,-90,180,90);
	// 		}
	// 		if(extent == null){
	// 			return;
	// 		}
	// 	}
	// 	var level = this.getLevel(extent);
	// 	if(level == null){
	// 		return;
	// 	}
	// 	this.setLevel(level);
	// 	var center = extent.getCenter();
	// 	if(center == null){
	// 		return;
	// 	}
	// 	this.setCenter(center);
	// 	this.draw();
	// },



	getFeatureFilter : function(layerName,filter,maxFeatures,fields,style,callback){
		var layer = this.getLayer(layerName);
		if(layer == null){
			if(callback != null){
				callback("this is not layer named " + layername);
			}
			return;
		}
		this.queryLayer.setLayer(layer,style);
		layer.getFeatureFilter(filter,maxFeatures,null,fields,callback);
	},


	refresh : function(){
		this.draw();
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
		return this.legendList.length;
	},


	// // 设置背景色
	// setBackground : function(color){
	// 	if(color == null){
	// 		return;
	// 	}
	// 	this.backgroundColor = color;
	// },

	// 开始动画
	beginAnimate : function(){
		if(this.animateCanvas == null){
			var canvas = this._container.find(".map5-animate-canvas");
			if(canvas.length == 0){
				var canvasID = this.id + "_canvas";
				var animateCanvasID = this.id + "_animatecanvas";
				var mapCanvasHtml = "<canvas  id='" + animateCanvasID + "' class='map5-animate-canvas' height='" 
								+ this.canvas.height + "' width='" 
								+ this.canvas.width + "'></canvas>";
				// map._container.find("canvas").after(mapCanvasHtml);
				this._container.find("#" + canvasID).after(mapCanvasHtml);
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
		// var canvas = map._container.find(".map5-animate-canvas");
		// if(canvas.length == 0){
		// 	var canvasID = map.id + "_canvas";
		// 	var animateCanvasID = map.id + "_animatecanvas";
		// 	var mapCanvasHtml = "<canvas  id='" + animateCanvasID + "' class='map5-animate-canvas' height='" 
		// 					+ map.canvas.height + "' width='" 
		// 					+ map.canvas.width + "'></canvas>";
		// 	// map._container.find("canvas").after(mapCanvasHtml);
		// 	map._container.find("#" + canvasID).after(mapCanvasHtml);
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
		
		this._container.find(".map5-tooltip").html(content);
		var left = spt.x;
		var top = spt.y;

		var itemHeight = this._container.find(".map5-tooltip").height();
		var itemWidth = this._container.find(".map5-tooltip").width();
		var x = itemWidth + spt.x;
		var y = itemHeight + spt.y;

		if(x >= this.width){
			left = spt.x - itemWidth;
		}
		if(y >= this.height){
			top = spt.y - itemHeight;
		}

		$(this._container).find(".map5-tooltip").css("left",left + "px");
		$(this._container).find(".map5-tooltip").css("top",top + "px");
		$(this._container).find(".map5-tooltip").css("display","block");
	},

	closeTooltip : function(){
		$(this._container).find(".map5-tooltip").css("display","none");
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
		this._container[0].addEventListener('mousemove', this.hitRippleEvent);		
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
		this._container[0].removeEventListener('mousemove',this.hitRippleEvent);
		this.hitRippleEvent = null;		
	},


	// 拉框放大
	zoomIn : function(){
		var i = this.controls.find(GeoBeans.Control.Type.ZOOM);
		if(i < 0){
			return;
		}
		var zoomControl = this.controls.get(i);
		zoomControl.setMode("in");
		zoomControl.trackRect();
	},

	// 拉框缩小
	zoomOut : function(){
		var i = this.controls.find(GeoBeans.Control.Type.ZOOM);
		if(i < 0){
			return;
		}
		var zoomControl = this.controls.get(i);
		zoomControl.setMode("out");
		zoomControl.trackRect();
	},

	// 停止拉框
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
				//console.log("layer is not feature layer");
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
			//console.log("layer is not feature layer");
			return;
		}
		layer.unRegisterClickEvent();
	},

	// 创建一个featureLayer
	// @deprecated
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

	// KML文件创建featureLayer
	// @deprecated
	createFeatureLayerByKML : function(name,url){
		var kmlReader = new GeoBeans.KMLReader();
		var layer = kmlReader.read(name,url);
		return layer;
	},


	// GeoJson文件创建featureLayer
	// @deprecated
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

});

/**
 * 初始化地图容器
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.createMapContainer = function(){
	this._container = $("#" + this.id)[0];

	this.width = $("#" + this.id).width();
	this.height = $("#" + this.id).height();


	// canvas
	var canvasID = this.id + "_canvas";
	var mapCanvasHtml = "<canvas id='" + canvasID + "' class='mapCanvas' height='" 
						+ this.height + "' width='" 
						+ this.width + "'></canvas>";
	this._container.innerHTML = mapCanvasHtml;


	// baseCanvas
	var baseCanvasID = this.id + "_basecanvas";
	var canvasHtml = "<canvas  id='" + baseCanvasID  +"' class='map5-base-canvas' height='" 
				+ this.height + "' width='" 
				+ this.width + "'></canvas>";
	this._container.innerHTML += canvasHtml;

	this.baseLayerCanvas = document.getElementById(baseCanvasID);
	this.baseLayerRenderer = new GeoBeans.Renderer(this.baseLayerCanvas);

	this.canvas = document.getElementById(canvasID);
	this.renderer = new GeoBeans.Renderer(this.canvas);

}

/**
 * 初始化地图控件
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.initControls = function(){
	this.controls = new GeoBeans.Control.Controls(this);
}

/**
 * 初始化地图Widgets
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.initWidgets = function(){

	var copyRightWidget = new GeoBeans.Widget.CopyRightWidget(this);
	this._copyRightWidget = copyRightWidget;


	// tooltip 暂时没有用到
	// var tooltipHtml = "<div class='map5-tooltip'></div>";
	// $(this._container).append(tooltipHtml);


	var infoWindowWidget = new GeoBeans.Widget.InfoWindowWidget(this);
	this._infoWindowWidget = infoWindowWidget;
};

/**
 * 初始化地图事件
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.initEvents = function(){
	this.events = new GeoBeans.Events();
}

/**
 * 初始化地图交互工具
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.initInteractions = function(){
	this._interactions = new GeoBeans.Interaction.Interactions(this);
}

/**
 * 初始化地图图层要素
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.initLayers = function(){
	this.layers = [];

	this.overlayLayer = new GeoBeans.Layer.OverlayLayer("overlay");
	this.overlayLayer.setMap(this);

	this.panoramaLayer = new GeoBeans.Layer.PanoramaLayer("panorama");
	this.panoramaLayer.setMap(this);

	this.imageLayer = new GeoBeans.Layer.ImageLayer("imageLayer");
	this.imageLayer.setMap(this);

	this.hitRippleLayers = [];

	this.queryLayer = new GeoBeans.Layer.FeatureLayer.QueryLayer("query");
	this.queryLayer.setMap(this);
}

		
/**
 * 初始化地图大小改变
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.initResize = function(){
	var that = this;
	window.onresize = function(){
		clearTimeout(that._resizeId);
		that._resizeId = setTimeout(function(){
			var height = $(that._container).height();
			var width = $(that._container).width();
			if(height == 0 || width == 0){
				return;
			}
			if(height == that.height &&　width == that.width){
				return;
			}

			that.canvas.height = height;
			that.canvas.width = width;

			that.baseLayerCanvas.height = height;
			that.baseLayerCanvas.width = width;

			that.height = height;
			that.width = width;

			var viewer = that.getViewer();
			var extent = viewer.getExtent();

			if(extent == null){
				return;
			}

			if(extent != null){
				var xmin = extent.xmin;
				var xmax = extent.xmax;
				var ymin = extent.ymin;
				var ymax = extent.ymax;
				if(!$.isNumeric(xmin) || !$.isNumeric(xmax) || !$.isNumeric(ymin) || !$.isNumeric(ymax)){
					return;
				}
			}

			console.log(extent);
			if(that.baseLayer != null){
				var baseLayerCanvas = that.baseLayer.canvas;
				baseLayerCanvas.width = width;
				baseLayerCanvas.height = height;
				var zoom = viewer.getZoom();
				viewer.setZoom(zoom);

			}else{
				viewer.setExtent(extent);
			}	

			console.log(viewer.getExtent());
			var layers = that.layers;
			for(var i = 0; i < layers.length;++i){
				var layer = layers[i];
				if(layer == null){
					continue;
				}
				var canvas = layer.canvas;
				if(canvas != null){
					canvas.height = height;
					canvas.width = width;
				}

				var clickCanvas = layer.clickCanvas;
				if(clickCanvas != null){
					clickCanvas.width = width;
					clickCanvas.height = height;
				}

				var hitCanvas = layer.hitCanvas;
				if(hitCanvas != null){
					hitCanvas.width = width;
					hitCanvas.height = height;
				}

				var rotateCanvas = layer.rotateCanvas;
				if(rotateCanvas != null){
					rotateCanvas.height = height*2;
					rotateCanvas.width = width*2;
				}
			}
			var overlayLayerCanvas = that.overlayLayer.canvas;
			if(overlayLayerCanvas != null){
				overlayLayerCanvas.height = height;
				overlayLayerCanvas.width = width;
			}

			var queryLayerCanvas = that.queryLayer.canvas;
			if(queryLayerCanvas != null){
				queryLayerCanvas.height = height;
				queryLayerCanvas.width = width;
			}

			var panoramaLayerCanvas = that.panoramaLayer.canvas;
			if(panoramaLayerCanvas != null){
				panoramaLayerCanvas.height = height;
				panoramaLayerCanvas.width = width;
			}
			
			var imageLayerCanvas = that.imageLayer.canvas;
			if(imageLayerCanvas != null){
				imageLayerCanvas.height = height;
				imageLayerCanvas.width = width;
			}

			that.draw();
		},250);


		// 处理onresize注册事件
		var event = that.events.getEvent(GeoBeans.Event.RESIZE);
		if(event != null){
			var viewer = that.getViewer();
			var args = new GeoBeans.Event.MouseArgs();
			args.buttn = null;
			args.X = null;
			args.Y = null;
			args.mapX = null;
			args.mapY = null;
			args.zoom = viewer.getZoom();

			var handler = event.handler;
			handler(args);
		}
	};
	var handler = window.onresize;
	handler.apply(window,[]);

};

/**
 * 获取infoWindow对象
 * @public
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.getInfoWindow = function(){
	return this._infoWindowWidget;
}

/**
 * Map事件绑定
 * @public
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 回调函数
 * @return {[type]}         [description]
 */
GeoBeans.Map.prototype.on = function(event, handler){

	if(event == GeoBeans.Event.CLICK || event == GeoBeans.Event.DBCLICK
		|| event == GeoBeans.Event.MOUSE_DOWN || event == GeoBeans.Event.MOUSE_UP 
		|| event == GeoBeans.Event.MOUSE_MOVE || event == GeoBeans.Event.MOUSE_OVER
		|| event == GeoBeans.Event.MOUSE_OUT){
		var map = this;
		var eventHandler = function(evt){
			evt.preventDefault();
			var x = evt.layerX;
			var y = evt.layerY;
			
			var viewer = map.getViewer();
			var mp = viewer.toMapPoint(x, y);
			var args = new GeoBeans.Event.MouseArgs();
			args.buttn = null;
			args.X = x;
			args.Y = y;
			args.mapX = mp.x;
			args.mapY = mp.y;
			args.zoom = viewer.getZoom();
			handler(args);
		};	

		var mapContainer = this.getContainer();
		mapContainer.addEventListener(event,eventHandler);
		this.events.addEvent(event,handler,eventHandler);
	}else{
		this.events.addEvent(event,handler,null);
	}
}

/**
 * Map解除事件绑定
 * @param  {GeoBeans.Event} event 事件
 * @return {[type]}       [description]
 */
GeoBeans.Map.prototype.un = function(event){
	var e = this.events.getEvent(event);
	if(e == null){
		return;
	}
	var eventHandler = e.listener;
	var mapContainer = this.getContainer();
	mapContainer.removeEventListener(event,eventHandler);
	this.events.removeEvent(event);
}

/**
 * 添加多个图层
 * @public
 * @param {[type]} layers [description]
 * @description layers为[]类型
 */
GeoBeans.Map.prototype.addLayers = function(layers){
	if(isValid(layers)){
		var that = this;
		layers.forEach(function(l){
			that.addLayer(l);
		})
	}
}

/**
 * 设置Map的底图
 * @public
 * @param {[TileLayer]} l Baselayer必须是TileLayer
 * @description Map会将添加进来的第一个TileLayer设置为baseLayer
 */
GeoBeans.Map.prototype.setBaseLayer = function(l){
	if(!isValid(l)){
		this.baseLayer = null;
		return true;
	}
	if(l instanceof GeoBeans.Layer.TileLayer){
		this.baseLayer = l;
		return true;
	}
	return false;
}


/**
 * 获得map的容器对象
 * @public
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.getContainer = function(){
	return this._container;
}

/**
 * 获取地图的屏幕宽度
 * @public
 * @return {[type]} [description]
 * @description 单位为像素(pixel)
 */
GeoBeans.Map.prototype.getWidth = function(){
	return $(this._container).width();
}

/**
 * 获取地图的屏幕高度
 * @public
 * @return {[type]} [description]
 * @description 单位为像素(pixel)
 */
GeoBeans.Map.prototype.getHeight = function(){
	return $(this._container).height();
}

/**
 * 绘制由draw接口的Interactions
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Map.prototype.drawInteractions = function(){

	var interaction = null;
	var count = this._interactions.count();

	for(var i=count-1; i>=0; i--){
		interaction = this._interactions.get(i);
		if(isValid(interaction.draw)){
			interaction.draw();
			this.renderer.drawImage(interaction._canvas,0,0,interaction._canvas.width,interaction._canvas.height);
		}
	}
}

/**
 * Map上添加Interactions
 * @param {[type]} interaction [description]
 */
GeoBeans.Map.prototype.addInteraction = function(interaction){
	this._interactions.add(interaction);
}

/**
 * 根据类型获取interaction
 * @public
 * @param  {GeoBeans.Interaction.Type} type 交互类型
 * @return {GeoBeans.Interaction}      交互
 */
GeoBeans.Map.prototype.getInteraction = function(type){
	return this._interactions.find(type);
};



GeoBeans.Map.prototype.drawBaseLayer = function(){
	var layer = null;
	var tileLayerCount = 0;
	for(var i = 0; i < this.layers.length;++i){
		layer = this.layers[i];
		if(layer instanceof GeoBeans.Layer.TileLayer){
			var viewer = this.getViewer();
			var zoom = viewer.getZoom();
			if(zoom == null){
				var zoom = viewer.getZoomByExtent(viewer.getExtent());
				viewer.setZoom(zoom);
			}

			if(layer.visible){
				tileLayerCount++;
				layer.preDraw();
				layer.loadingTiles(this.drawBaseLayerCallback);
			}
		}
	}
	if(tileLayerCount == 0){
		this.baseLayerRenderer.clearRect();
		this.baseLayerSnap = null;
	}	
}