// JavaScript Document
GeoBeans.Map = GeoBeans.Class({
	
	// TOLERANCE : 10,
	TOLERANCE : 20,
	
	mapDiv : null,

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
	 * 地图当前视口
	 **/
	viewer : null,
	
	/**
	 * center有默认值(0,0)
	 **/
	center : null,

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
	
	transformation : null,
	
	snap : null,
	baseLayerSnap : null,

	tracker : null,
	//拉框查询
	queryTrackLayer : null,
	// 鼠标track的查询空间数据
	queryGeometry : null,


	infoWindow : null,


	//图例列表
	legendList : null,
	
	baseLayerRenderer : null,
	animateCanvas : null,
	baseLayerCanvas : null,

	// 授权时间
	authTime : null,
	// 旋转角度
	rotateAngle : null,	//这个应该放到View里面

	initialize: function (id,name,extent,srid,viewer) {	
		var mapDiv = document.getElementById(id);
		if(mapDiv == null){
			return null;
		}
		mapDiv.innerHTML = '';
		
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
		this.id = id;
		this.name = name;
		
		
		this.layers = [];
		this.legendList = [];
		
		this.mapDiv = $("#" + id);

		var canvasID = this.id + "_canvas";
		var mapCanvasHtml = "<canvas id='" + canvasID + "' class='mapCanvas' height='" 
							+ $("#" + id).height() + "' width='" 
							+ $("#" + id).width() + "'></canvas>";

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

		this.panoramaLayer = new GeoBeans.Layer.PanoramaLayer("panorama");
		this.panoramaLayer.setMap(this);

		this.imageLayer = new GeoBeans.Layer.ImageLayer("imageLayer");
		this.imageLayer.setMap(this);

		this.hitRippleLayers = [];
	
		// 设置范围
		if(this.viewer != null){
			this.setViewer(this.viewer);
		}

		this.maplex = new GeoBeans.Maplex(this);

		this.events = [];

		this.queryLayer = new GeoBeans.Layer.FeatureLayer.QueryLayer("query");
		this.queryLayer.setMap(this);

		var infoWindowHtml = "<div class='infoWindow' data-toggle='popover' "
			+ 	"title='Info' data-content=''></div>";
		$("#" + id).append(infoWindowHtml);
		this.infoWindow = this.mapDiv.find(".infoWindow");
		if(this.infoWindow!=undefined){
			if(this.infoWindow.popover!=undefined){
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

				that.baseLayerCanvas.height = height;
				that.baseLayerCanvas.width = width;
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
							
							var clickCanvas = layer.clickCanvas;
							if(clickCanvas != null){
								clickCanvas.height = height;
								clickCanvas.width = width;
							}

							var hitCanvas = layer.hitCanvas;
							if(hitCanvas != null){
								hitCanvas.height = height;
								hitCanvas.width = width;
							}
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
				}
			},250);

		};
		var handler = window.onresize;
		handler.apply(window,[]);

		
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
			var center = extent.getCenter();
			this.setCenter(center);
		}else{
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
		}else{
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


	draw : function(){
		var time = new Date();
		// var delta = time.getTime() - this.authTime.getTime();
		// if(delta > 30*24*3600*1000){
		// 	alert("请联系管理员进行授权");
		// 	return;
		// }

		// this.renderer.save();
		this.time = new Date();

		var layer = null;
		var tileLayerCount = 0;
		for(var i = 0; i < this.layers.length;++i){
			layer = this.layers[i];
			if(layer instanceof GeoBeans.Layer.TileLayer){
				if(this.level == null){
					var level = this.getLevel(this.viewer);
					this.level = level;
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
		this.drawLayersAll();
		// this.renderer.restore();

		//设置地图控件
		this.mapNavControl.setZoomSlider(this.level);
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
			var hitCanvas = layer.hitCanvas;
			if(hitCanvas != null){
				this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
			}

			var clickCanvas = layer.clickCanvas;
			if(clickCanvas != null){
				this.renderer.drawImage(clickCanvas,0,0,clickCanvas.width,clickCanvas.height);
			}
			// var bufferCanvas = layer.bufferCanvas;
			// if(bufferCanvas != null){
			// 	this.renderer.drawImage(bufferCanvas,0,0,bufferCanvas.width,bufferCanvas.height);
			// }
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
	

	// 注册事件
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

	// 注册滚轮事件
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
			if(layer instanceof GeoBeans.Layer.TileLayer && this.level < layer.getMaxLevel()){
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
		}else{
			this.baseLayerRenderer.context.clearRect(x,y,img_size,img_size);
		}
		if(this.layers == null){
			return;
		}
		for(var i = 0; i < this.layers.length;++i){
			var l = this.layers[i];
			if(l instanceof GeoBeans.Layer.TileLayer && l.visible){
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

	// 停止查询
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
		// if(filter == null){
		// 	if(callback != null){
		// 		callback(" filter is null");
		// 	}
		// 	return;
		// }

		this.queryLayer.setLayer(layer,style);
		layer.getFeatureFilter(filter,maxFeatures,null,fields,callback);
	},


	// refresh : function(){
		
	// },

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
			console.log("layer is not feature layer");
			return;
		}
		layer.unRegisterClickEvent();
	},

	// 创建一个featureLayer
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
	createFeatureLayerByKML : function(name,url){
		var kmlReader = new GeoBeans.KMLReader();
		var layer = kmlReader.read(name,url);
		return layer;
	},


	// GeoJson文件创建featureLayer
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