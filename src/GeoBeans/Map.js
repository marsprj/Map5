/**
 * @classdesc
 * Map5的地图控件，实现地图的展示、渲染、查询、专题图以及人机交互功能。
 * Map５地图控件由GeoBeans.Map类实现。由{@link GeoBeans.Layer}、{@link GeoBeans.Source}、{@link GeoBeans.Viewer}、{@link GeoBeans.Widget}等４个主要类构成。此外包含{@link GeoBeans.Control}和{@link GeoBeans.Interaction}实现Map控件的控制和用户交互。
 * 下面是Map5的一个简单示例，实现基本的地图显示。
 * 1) 编写显示Map的HTML页面。Map5需要一个div作为地图的容器，设置div的id为mapDiv。此id将作为Map的target参数，用于Map设置Map对象的容器。
 * 2) 将Map5的引用添加到HTMl页面上。
 * 
 * 	<html>
 * 		<head>
 * 			<title>Map5地图</title>
 * 			
 * 			<link rel="stylesheet" type="text/css" href="/lib/css/Map5.min.css">
 * 			
 * 			<script type="text/javascript" src="lib/jquery-1.11.1.js"></script>
 * 			<script type="text/javascript" src="lib/bootstrap.min.js"></script>
 * 			<script type="text/javascript" src="lib/css/Map5.min.js"></script>
 * 			
 *    		<style type="text/css">
 *    			body{
 *    				margin: 0px;
 *    			}
 *    			#mapDiv{
 *    				height:100%;
 *    				width:
 *    				position:absolute;
 *    			}
 *    		</style>
 * 		</head>
 * 		<body>
 * 			<p>Map5地图</p>
 * 			<div id="MapDiv"></div>
 * 		</body>
 * 	</html>
 *
 * 3) 然后编写Javascript代码，初始化Map对象并显示地图。
 *
 * 	<script type="text/javascript">
 *		var map = new GeoBeans.Map({
 *			target : "mapDiv",
 *			name : "map",
 *			srs  : GeoBeans.Proj.WGS84,
 *			baseLayer : "world"
 *			layers : [
 *				new GeoBeans.Layer.TileLayer({
 *					name : "world",
 *					source : new GeoBeans.Source.Tile.QuadServer({
 *						url : "http://127.0.0.1/QuadServer/maprequest",
 *						imageSet : "world_image"
 *					}),
 *					opacity : 1.0,
 *					visible : true
 *				}),
 *				new GeoBeans.Layer.FeatureLayer({
 *					name : "country",
 *					geometryType : GeoBeans.Geometry.Type.POINT,
 *					source : new GeoBeans.Source.Feature.GeoJSON({
 * 						url : "http://127.0.0.1/Map5/example/all/data/geojson/countries.geojson",
 * 						geometryName : "geometry",
 *					}),
 *					style : createSimplePolygonStyle()
 *				})		
 *			],
 *			viewer : {
 *				center : new GeoBeans.GeometryPoint(0,0),
 *				zoom : 2
 *			}
 *		});
 *	</script>
 *
 *	
 * @class
 * @param 	{object} options options
 * @api stable
 *
 */
GeoBeans.Map = GeoBeans.Class({
	
	
	_id : null,
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
	
	// width : null,	
	// height : null,

	/**
	 * 选择集
	 * @private
	 **/
	_selection : null,
	
	/**
	 * level有默认值null
	 **/
	level  : null,	
	resolution : null,
	
	layers : [],	
	baseLayer : null,
	overlayLayer : null,
	hitRippleLayers : null,		// rippleLayer hit layers
	
	
	renderer : null,
	
	bgColor : 'rgba(255,255,255,1)',
	
	
	snap : null,
	baseLayerSnap : null,

	widgets : null,

	

	// 授权时间
	authTime : null,

	// resize的标识符
	_resizeId : null,


	VERSION : "1.0.105",

	CLASS_NAME : "GeoBeans.Map",
	
	initialize: function (options) {	
				

		/**************************************************************************************/
		/* 1) Map Name
		/**************************************************************************************/
		if(isValid(options.name)){
			this.name = name;
		}

		/**************************************************************************************/
		/* 2) create mapContainer
		/**************************************************************************************/
		this.createMapContainer(options.target);

		/**************************************************************************************/
		/* 3) init Projection
		/**************************************************************************************/
		this.initProjection(options.srs);

		/**************************************************************************************/
		/* 4) init Layers
		/**************************************************************************************/
		this.initLayers(options.layers);

		/**************************************************************************************/
		/* 5) set base layer
		/**************************************************************************************/
		this.initBaseLayer(options.baseLayer);

		/**************************************************************************************/
		/* 3) Events Begin
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
		/* 初始选择集
		/**************************************************************************************/	
		this.initSelection();

		/**************************************************************************************/
		/* 启用Window的Resize事件
		/**************************************************************************************/	
		// this.enableWindowResize();

		/**************************************************************************************/
		/* 初始化Viewer
		/**************************************************************************************/	
		this.initViewer(options.viewer);
	
		// this.maplex = new GeoBeans.Maplex(this);

		// 授权时间
		this.authTime = new Date("2016-07-26 00:00:00");
	},
	
	destroy : function(){

		$(this._container).find("canvas").remove();
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.enableNavControl(false);
		this.controls.cleanup();
		this.unRegisterMapRippleHitEvent();
		this.controls.cleanup();
		this.viewer.cleanup();

		this.canvas = null;
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

	/**
	 * 删除底图，如果还有其他tileLayer则设置为底图
	 * @deprecated 这个函数没有意义
	 */
	 resetBaseLayer : function(){
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
	},
	


	
	/**
	 * 根据map的width和height的比例，重新计算extent的范围
	 * 1. extent的center保持不变
	 * 2. extent的长宽比和map一致
	 **/
	formulateExtent : function(extent){
		
	},
	


	// 增加全景图
/*	addPanorama : function(point,name,htmlPath,icon){
		this.panoramaLayer.addMarker(point,name,htmlPath,icon);
	},

	removePanorama : function(name){
		this.panoramaLayer.removeMarker(name);
	},

	clearPanoramas : function(){
		this.panoramaLayer.clearMarkers();
	},*/


	// // 设置背景色
	// setBackground : function(color){
	// 	if(color == null){
	// 		return;
	// 	}
	// 	this.backgroundColor = color;
	// },

	// 开始动画
	beginAnimate : function(){
		if(!isValid(this.requestID)){
			window.map = this;
			window.requestNextAnimationFrame(this.animate);
		}else{

		}
	},

	animate : function(time){
		var map = window.map;
		for(var i = 0;  i < map.layers.length; ++i){
			var layer = map.layers[i];
			if(isDefined(layer.isAnimation) && layer.isAnimation()){
				layer.draw(time);
			}
		}
		var requestID = window.requestNextAnimationFrame(map.animate);
		map.requestID = requestID;
	},

	// 停止动画
	stopAnimate : function(){
		window.cancelAnimationFrame(this.requestID);
		this.requestID = null;		
	},


	// tooltip : function(point,content){
	// 	var spt = this.transformation.toScreenPoint(point.x,point.y);
	// 	var position = 'left:' + spt.x + "px;top:" + spt.y + "px";
		
	// 	this._container.find(".map5-tooltip").html(content);
	// 	var left = spt.x;
	// 	var top = spt.y;

	// 	var itemHeight = this._container.find(".map5-tooltip").height();
	// 	var itemWidth = this._container.find(".map5-tooltip").width();
	// 	var x = itemWidth + spt.x;
	// 	var y = itemHeight + spt.y;

	// 	if(x >= this.width){
	// 		left = spt.x - itemWidth;
	// 	}
	// 	if(y >= this.height){
	// 		top = spt.y - itemHeight;
	// 	}

	// 	$(this._container).find(".map5-tooltip").css("left",left + "px");
	// 	$(this._container).find(".map5-tooltip").css("top",top + "px");
	// 	$(this._container).find(".map5-tooltip").css("display","block");
	// },

	// closeTooltip : function(){
	// 	$(this._container).find(".map5-tooltip").css("display","none");
	// },


	// registerRippleHitEvent : function(name,content){
	// 	var layer = this.getLayer(name);		
	// 	if(layer == null || !(layer instanceof GeoBeans.Layer.RippleLayer)){
	// 		return;
	// 	}
	// 	layer.setHitContent(content);

	// 	if($.inArray(layer,this.hitRippleLayers) == -1){
	// 		this.hitRippleLayers.push(layer);
	// 	}	

	// 	if(this.hitRippleLayers.length == 0){
	// 		return;
	// 	}

	// 	if(this.hitRippleEvent != null){
	// 		return;
	// 	}


	// 	var that = this;
	// 	var x_o = null;
	// 	var y_o = null;
	// 	var tolerance = 5;
		
	// 	this.hitRippleEvent = function(evt){
	// 		if(x_o==null){
	// 			x_o = evt.layerX;
	// 			y_o = evt.layerY;
	// 		}
	// 		else{
	// 			var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
	// 			if(dis > tolerance){
					
	// 				x_o = evt.layerX;
	// 				y_o = evt.layerY;
				
	// 				var mp = that.transformation.toMapPoint(evt.layerX, evt.layerY);
					
	// 				var result = null;
	// 				var index = null;
	// 				var layers = that.getLayers();
	// 				for(var i = 0; i < that.hitRippleLayers.length;++i){
	// 					var layer = that.hitRippleLayers[i];
	// 					if(layer != null){
	// 						var layerResult = layer.hit(mp.x,mp.y);
	// 						var layerIndex = layers.indexOf(layer);
	// 						if(result != null){

	// 							if(layerIndex > index){
	// 								result = layerResult;
	// 								index = layerIndex; 
	// 							}
	// 						}else{
	// 							result = layerResult;
	// 							index = layerIndex;
	// 						}
	// 					}
	// 				}
	// 				if(result == null){
	// 					that.closeTooltip();
	// 				}else{
	// 					var point = new GeoBeans.Geometry.Point(mp.x, mp.y);
	// 					that.tooltip(point,result);
	// 				}
	// 			}
	// 		}

	// 	};
	// 	this._container[0].addEventListener('mousemove', this.hitRippleEvent);		
	// },

	// // 注销某个波纹图层的hit事件
	// unRegisterRippleHitEvent : function(name){
	// 	var layer = this.getLayer(name);		
	// 	if(layer == null || !(layer instanceof GeoBeans.Layer.RippleLayer)){
	// 		return;
	// 	}
	// 	layer.unregisterHitEvent();
		
	// 	var layerIndex = this.hitRippleLayers.indexOf(layer);
	// 	if(layerIndex != -1){
	// 		this.hitRippleLayers.splice(layerIndex,1);
	// 	}

	// 	if(this.hitRippleLayers.length == 0){
	// 		this.unRegisterMapRippleHitEvent();
	// 	}
	// },

	// // 注销地图的波纹hit事件
	// unRegisterMapRippleHitEvent : function(){
	// 	this._container[0].removeEventListener('mousemove',this.hitRippleEvent);
	// 	this.hitRippleEvent = null;		
	// },

});

/**
 * 根据图层名称获取图层对象
 * @public
 * @param  {string} name 图层名
 * @return {GeoBeans.Layer}      图层对象。如果name非法或图层不存在，返回null。
 */
GeoBeans.Map.prototype.getLayer = function(name){
	if(!isValid(name)){
		return null;
	}
	var layer = null;
	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		if(layer.name == name){
			return layer;
		}
	}
	return null;
}

/**
 * 向map上添加图层
 * @public
 * @param {GeoBeans.Layer} layer 图层对象
 */
GeoBeans.Map.prototype.addLayer = function(layer){
	if(!isValid(layer)){
		return false;
	}

	var l = this.getLayer(layer.name);
	if(l != null){
        return false;
	}
	
	this.layers.push(layer);
	if(layer instanceof GeoBeans.Layer.TileLayer){
		if(this.baseLayer == null){
			this.baseLayer = layer;
		}
	}
	layer.setMap(this);
	return true;
}

/**
 * 向map上添加多个图层
 * @public
 * @param {Array<GeoBeans.Layer>} layers 图层集合
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
 * 删除图层
 * @param  {string} name 图层名
 * @return {string}      返回值，成功返回success，失败则返回错误信息
 */
GeoBeans.Map.prototype.removeLayer = function(name){
	if(name == null){
		return "layer name is null";
	}


	var layers = this.layers;
	for(var i = 0; i < layers.length;++i){
		if(name == layers[i].name){
			if(isValid(this.baseLayer) && this.baseLayer.name == name){
				this.resetBaseLayer();
			}
			var layer = layers[i];
			this.layers.splice(i,1);
			layer.destroy();
			layer = null;
			this.refresh();
			return "success";
		}
	}

	return "no layer on the map ";
}

/**
 * 初始化地图容器
 * @private
 */
GeoBeans.Map.prototype.createMapContainer = function(target){

	if(!isValid(target)){
		return false;
	}

	this.id = target;
	this._container = $("#" + this.id)[0];


	// this.width = $("#" + this.id).width();
	// this.height = $("#" + this.id).height();
	// canvas
	var canvasID = this.id + "_canvas";
	var mapCanvasHtml = "<canvas id='" + canvasID + "' class='mapCanvas' height='" 
						+ this.getHeight() + "' width='" 
						+ this.getWidth() + "'></canvas>";

	this._container.innerHTML = mapCanvasHtml;

	this.canvas = document.getElementById(canvasID);
	this.renderer = new GeoBeans.Renderer(this.canvas);

	return true;
}

/**
 * 初始化Projection
 * @private 
 */
GeoBeans.Map.prototype.initProjection = function(srs){
	this._srs = isValid(srs) ? srs : GeoBeans.Proj.WGS84;
}

/**
 * 初始化地图控件
 * @private
 */
GeoBeans.Map.prototype.initControls = function(){
	this.controls = new GeoBeans.Control.Controls(this);
}

/**
 * 初始化地图Widgets
 * @private
 */
GeoBeans.Map.prototype.initWidgets = function(){
	this.widgets = new GeoBeans.Widget.Widgets(this);
};

/**
 * 初始化地图事件
 * @private
 */
GeoBeans.Map.prototype.initEvents = function(){
	this.events = new GeoBeans.Events();
}

/**
 * 初始化地图交互工具
 * @private
 */
GeoBeans.Map.prototype.initInteractions = function(){
	this._interactions = new GeoBeans.Interaction.Interactions(this);
}

/**
 * 初始化地图图层要素
 * @private
 */
GeoBeans.Map.prototype.initLayers = function(layers){
	this.layers = [];
	this.addLayers(layers);

	// this.overlayLayer = new GeoBeans.Layer.OverlayLayer("overlay");
	// this.overlayLayer.setMap(this);
}

/**
 * 根据名称初始化BaseLayer
 * @param  {string} lname 图层名称
 * @private
 */
GeoBeans.Map.prototype.initBaseLayer = function(lname){
	if(!isValid(lname)){
		return;
	}

	var layer = this.getLayer(lname);
	this.setBaseLayer(layer);
}

/**
 * 初始化地图视图，并设置地图视图。
 * @param  {GeoBeans.Viewer} viewer 地图视图
 */
GeoBeans.Map.prototype.initViewer = function(viewer){

	//1) 读取当前投影的空间范围
	var full_extent = this._srs.EXTENT;
	if(!isValid(full_extent)){
		return false;
	}

	//2) 利用当前投影的空间范围创建viewer对象。
	this.viewer = new GeoBeans.Viewer({
		map : this,
		extent: full_extent
	});
	//3) 注册viewer的onchange事件，在viewer发生变化时候，触发改时间重绘map
	this.registerViewerEvent();

	//4) 利用options传入的viewer参数更新this.viewer，并触发onchange事件。
	//   if  ：用户设置了options.viewer参数，利用options.viewer参数更新this.viewer
	//   else: this.viewer使用默认参数，直接refresh地图。
	if(isValid(viewer)){
		
		// <1> 如果设置了baseLayer，利用zoom和center参数更新viewer
		if(isValid(this.baseLayer)){
			var zoom = viewer.zoom;
			var center = viewer.center;

			if((isValid(zoom))&&(isValid(center))){
				this.zoomTo(zoom, center);	
			}
			else if(isValid(zoom)){
				this.zoomTo(zoom);
			}
			else if(isValid(center)){
				this.moveTo(center);
			}
			else if(isValid(viewer.extent)){
				this.zoomToExtent(viewer.extent);
			}
			else if(isValid(viewer.resolution)){
				this.zoomToResolution(viewer.resolution);
			}
		}
		else{
			// <2> 否则
			// 检查是否设置了options.extent参数，如果设置了。则利用options.extent参数更新viewer。
			var extent = viewer.extent;
			if(isValid(extent)){
				this.zoomToExtent(extent);
				return;
			}
			// 检查是否设置了options.resolution参数，如果设置了。则利用options.resolution参数更新viewer。
			var resolution = viewer.resolution;
			if(isValid(resolution)){
				this.zoomToResolution(resolution);
			}
		}
	}
	else{
		this.refresh();
	}
}

/**
 * 初始化选择集
 * @private
 */
GeoBeans.Map.prototype.initSelection = function(){
	this._selection = new GeoBeans.Selection(this);
}

/**
 * 获得选择集对象
 * @public 
 * @return {GeoBeans.Selection} 选择集对象
 */
GeoBeans.Map.prototype.getSelection = function(){
	return this._selection;
}

/**
 * 注册Viewer的change事件。当Viewer变化时候，出发Map的重绘制。
 * @private
 */
GeoBeans.Map.prototype.registerViewerEvent = function(){
	if(isValid(this.viewer)){
		var that = this;
		//注册Viewer变化事件，Viewer发生变化时候，需要刷新地图。
		this.viewer.on(GeoBeans.Event.CHANGE, function(){
			// that.width = that.getWidth();
			// that.height = that.getHeight();

			that._updateCanvasSize();
			that.refresh();
		});
	}
}
/**
 * 调整canvas大小
 * @private
 */
GeoBeans.Map.prototype._updateCanvasSize = function(){
	this.canvas.width = this.getWidth();
	this.canvas.height = this.getHeight();
};	

/**
 * 初始化地图大小改变
 * @private
 */
// GeoBeans.Map.prototype.enableWindowResize = function(){
// 	var that = this;
// 	var onresize = function(){
// 		clearTimeout(that._resizeId);
// 		that._resizeId = setTimeout(function(){
// 			var height = $(that._container).height();
// 			var width = $(that._container).width();
// 			if(height == 0 || width == 0){
// 				return;
// 			}
// 			if(height == that.height &&　width == that.width){
// 				return;
// 			}

// 			that.canvas.height = height;
// 			that.canvas.width = width;


// 			that.height = height;
// 			that.width = width;

// 			for(var i = 0; i < that.layers.length;++i){
// 				var layer = that.layers[i];
// 				layer.resize(width,height);
// 			}

// 			// that.overlayLayer.resize(width,height);

// 			var viewer = that.getViewer();
// 			var extent = viewer.getExtent();

// 			if(extent == null){
// 				return;
// 			}

// 			if(extent != null){
// 				var xmin = extent.xmin;
// 				var xmax = extent.xmax;
// 				var ymin = extent.ymin;
// 				var ymax = extent.ymax;
// 				if(!$.isNumeric(xmin) || !$.isNumeric(xmax) || !$.isNumeric(ymin) || !$.isNumeric(ymax)){
// 					return;
// 				}
// 			}

// 			if(that.baseLayer != null){
// 				var zoom = viewer.getZoom();
// 				that.setZoom(zoom);
// 			}else{
// 				that.setViewExtent(extent);
// 			}	

// 			that.draw();
// 		},250);


// 		// 处理onresize注册事件
// 		var event = that.events.getEvent(GeoBeans.Event.RESIZE);
// 		if(event != null){
// 			var viewer = that.getViewer();
// 			var args = new GeoBeans.Event.MouseArgs();
// 			args.buttn = null;
// 			args.X = null;
// 			args.Y = null;
// 			args.mapX = null;
// 			args.mapY = null;
// 			args.zoom = viewer.getZoom();

// 			var handler = event.handler;
// 			handler(args);
// 		}
// 	};

// 	$(this._container).resize(function(){
// 		onresize();
// 	});
// };


/**
 * Map事件绑定
 * @public
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 		事件响应函数
 * @listens CLICK
 * @listens DBCLICK
 * @listens CHANGE
 * @listens DRAG_BEGIN
 * @listens DRAGING
 * @listens MOUSE_DOWN
 * @listens MOUSE_UP
 * @listens MOUSE_MOVE
 * @listens MOUSE_OVER
 * @listens MOUSE_OUT
 * @listens MOUSE_WHEEL
 */
GeoBeans.Map.prototype.on = function(event, handler){

	var ret = true;
	switch(event){
		case GeoBeans.Event.CLICK:
		case GeoBeans.Event.DBCLICK:
			this.onMapEvent(event, handler);
			break;
		case GeoBeans.Event.MOUSE_DOWN:
		case GeoBeans.Event.MOUSE_UP:
		case GeoBeans.Event.MOUSE_MOVE:
		//case GeoBeans.Event.MOUSE_OVER:
		//case GeoBeans.Event.MOUSE_OUT:
			this.onMouseEvent(event, handler);
			break;
		case GeoBeans.Event.MOUSE_WHEEL:
			this.onWheelEvent(event, handler);
			break;
		case GeoBeans.Event.DRAG_BEGIN:
		case GeoBeans.Event.DRAGING:
		case GeoBeans.Event.DRAG_END:
			this.onMapDragEvent(event, handler);
			break;
		default:
			ret = false;
	}
	return ret;
}

/**
 * Map解除事件绑定
 * @param  {GeoBeans.Event} event 事件
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
 * 注册Map事件
 * @private
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 		事件响应函数
 */
GeoBeans.Map.prototype.onMapEvent = function(event, handler){
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
}

/**
 * 注册Mouse事件
 * @private
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 		事件响应函数
 */
GeoBeans.Map.prototype.onMouseEvent = function(event, handler){
	var map = this;
	var eventHandler = function(evt){
		evt.preventDefault();
		var x = evt.layerX;
		var y = evt.layerY;

		var button;
		switch(evt.button){
			case 0:
				button = GeoBeans.Event.MouseButton.LEFT;
				break;
			case 1:
				button = GeoBeans.Event.MouseButton.MID;
				break;
			case 2:
				button = GeoBeans.Event.MouseButton.RIGHT;
				break;
		}
		
		var viewer = map.getViewer();
		var mp = viewer.toMapPoint(x, y);
		
		var args = {
			button : button,
			X : x,
			Y : y,
			mapX : mp.x,
			mapY : mp.y,
			zoom : viewer.getZoom()
		};
		
		handler(args);
	};
	var mapContainer = this.getContainer();
	mapContainer.addEventListener(event,eventHandler);
	this.events.addEvent(event,handler,eventHandler);
}

/**
 * 注册Mouse滚轮事件
 * @private
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 		事件响应函数
 */
GeoBeans.Map.prototype.onWheelEvent = function(event, handler){
	var map = this;
	var eventHandler = function(evt){
		evt.preventDefault();
		//console.log(evt.eventPhase);
		//console.log(evt.wheelDelta);
		console.log(evt.eventPhase + "," + evt.wheelDelta + "," + evt.detail + "," + evt.which);
		// var x = evt.layerX;
		// var y = evt.layerY;

		// var button;
		// switch(evt.button){
		// 	case 0:
		// 		button = GeoBeans.Event.MouseButton.LEFT;
		// 		break;
		// 	case 1:
		// 		button = GeoBeans.Event.MouseButton.MID;
		// 		break;
		// 	case 2:
		// 		button = GeoBeans.Event.MouseButton.RIGHT;
		// 		break;
		// }
		
		// var viewer = map.getViewer();
		// var mp = viewer.toMapPoint(x, y);
		
		// var args = {
		// 	button : button,
		// 	X : x,
		// 	Y : y,
		// 	mapX : mp.x,
		// 	mapY : mp.y,
		// 	zoom : viewer.getZoom()
		// };
		
		// handler(args);
	};
	var mapContainer = this.getContainer();
	mapContainer.addEventListener(event,eventHandler);
	this.events.addEvent(event,handler,eventHandler);
}

/**
 * 注册拖拽事件
 * @private
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 		事件响应函数
 */
GeoBeans.Map.prototype.onMapDragEvent = function(event, handler){
	var map = this;
	var eventHandler = function(evt){
		evt.preventDefault();
	};
	var mapContainer = this.getContainer();
	mapContainer.addEventListener(event,eventHandler);
	this.events.addEvent(event,handler,eventHandler);
}


/**
 * 注册Mouse事件
 * @private
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler 		事件响应函数
 */
GeoBeans.Map.prototype.onTouchEvent = function(event, handler){
	var map = this;
}


/**
 * 设置Map的底图
 * @public
 * @param {GeoBeans.Layer.TileLayer} l Baselayer必须是TileLayer
 * @description 需要是地图里面的一个图层，才可以设置
 */
GeoBeans.Map.prototype.setBaseLayer = function(l){
	if(!isValid(l)){
		this.baseLayer = null;
		return false;
	}
	if(!isValid(this.getLayer(l.name))){
		this.baseLayer = null;
		return false;
	}
	if(l instanceof GeoBeans.Layer.TileLayer){
		this.baseLayer = l;
		return true;
	}
	return false;
}

/**
 * 获取BaseLayer
 * @public
 * @return {GeoBeans.Layer} Base图层对象
 */
GeoBeans.Map.prototype.getBaseLayer = function(){
	return this.baseLayer;
}

/**
 * 获得map的容器对象
 * @public
 * @return {div} div容器
 */
GeoBeans.Map.prototype.getContainer = function(){
	return this._container;
}

/**
 * 获取地图的屏幕宽度
 * @public
 * @return {int} 屏幕宽度
 * @description 单位为像素(pixel)
 */
GeoBeans.Map.prototype.getWidth = function(){
	return $(this._container).width();
}

/**
 * 获取地图的屏幕高度
 * @public
 * @return {int} 屏幕高度
 * @description 单位为像素(pixel)
 */
GeoBeans.Map.prototype.getHeight = function(){
	return $(this._container).height();
}

/**
 * 获取Map视图类
 * @public
 * @return {GeoBeans.Viewer} 地图视图
 */
GeoBeans.Map.prototype.getViewer = function(){		
	return this.viewer;
}

/**
 * 启用/禁止Map拖拽
 * @public
 * @param  {boolean} flag 是否可以拖拽
 */
GeoBeans.Map.prototype.enableDrag = function(flag){
	var i = this.controls.find(GeoBeans.Control.Type.DRAG_MAP);
	if(i>=0){
		this.controls.get(i).enable(flag);
	}
}

/**
 * 启用/禁止Map滚轮缩放
 * @public
 * @param  {boolean} flag 是否可以滚轮缩放
 */
GeoBeans.Map.prototype.enableScroll = function(flag){
	var i = this.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
	if(i>=0){
		this.controls.get(i).enable(flag);
	}
}

/**
 * 启用/禁止导航控件
 * @public
 * @param {boolean} flag  启用/禁止标志
 */
GeoBeans.Map.prototype.enableNavControl = function(flag){
	var index = this.controls.find(GeoBeans.Control.Type.NAV);
	var mapNavControl = this.controls.get(index);
	mapNavControl.enable(flag);
},


/**
 * 绘制有draw接口的Interactions
 * @private
 */
GeoBeans.Map.prototype.drawInteractions = function(){

	var interaction = null;
	var count = this._interactions.count();

	// for(var i=count-1; i>=0; i--){
	// 	interaction = this._interactions.get(i);
	// 	if(isDefined(interaction.draw)){
	// 		interaction.draw();
	// 		this.renderer.drawImage(interaction._canvas,0,0,interaction._canvas.width,interaction._canvas.height);
	// 	}
	// }
}

/**
 * 绘制有draw接口的Interactions
 * @private
 */
GeoBeans.Map.prototype.drawSelection = function(){

	this._selection.refresh();
	this.renderer.clearRect(0,0,this.getViewer().getWindowWidth(), this.getViewer().getWindowHeight());
	this.renderer.drawImage(this._selection._canvas,
							0,0,
							this._selection._canvas.width,
							this._selection._canvas.height);
}

/**
 * Map上添加Interactions
 * @public
 * @param {GeoBeans.Interaction} interaction 向Map上添加新的interaction
 */
GeoBeans.Map.prototype.addInteraction = function(interaction){
	this._interactions.add(interaction);
}

/**
 * Map上删除Interaction
 * @public
 * @param  {GeoBeans.Interaction} interaction 交互
 */
GeoBeans.Map.prototype.removeInteraction = function(interaction){
	this._interactions.remove(interaction);
};

/**
 * 根据类型获取interaction
 * @public
 * @param  {GeoBeans.Interaction.Type} type 交互类型
 * @return {GeoBeans.Interaction}      交互
 */
GeoBeans.Map.prototype.getInteraction = function(type){
	// return this._interactions.find(type);
	if(!isValid(type)){
		return null;
	}
	var i = this._interactions.find(type);
	if(i < 0){
		return null;
	}
	return this._interactions.get(i);
};

/**
 * 刷新地图
 * @public
 */
GeoBeans.Map.prototype.refresh = function(flag){
	if(!isValid(flag)){
		flag = true;
	}
	this.draw(flag);
}

/**
 * 绘制地图
 * @private
 */
GeoBeans.Map.prototype.draw = function(flag){
	var time = new Date();
	// var delta = time.getTime() - this.authTime.getTime();
	// if(delta > 30*24*3600*1000){
	// 	alert("请联系管理员进行授权");
	// 	return;
	// }

	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
	this.drawLayers(flag);

	// Draw Interactions
	this.drawInteractions();

	this.drawSelection();

	//设置地图控件
	this.drawNavControl();

	this.drawWidgets();
	
}

/**
 * 绘制所有图层
 * @private
 */
GeoBeans.Map.prototype.drawLayers = function(flag){
	
	// this.maplex.cleanup();

	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		layer.refresh(flag);
	}

	// this.maplex.draw();
};



/**
 * 清空所有图层
 * @private
 */
GeoBeans.Map.prototype.clear = function(){


	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);

	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		layer.clear();
	}	
}

/**
 *  清空基础的canvas
 *  @private
 */
GeoBeans.Map.prototype.clearMap = function(){
	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
}
/**
 * 保存缩略图
 * @private
 */
GeoBeans.Map.prototype.saveSnap = function(){
	this.snap = this.renderer.getImageData(0, 0, this.canvas.width, this.canvas.height);
	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		layer.saveSnap();
	}
},

/**
 * 保存最基础的canvas的缩略图
 */
GeoBeans.Map.prototype.saveMapSnap = function(){
	this.snap = this.renderer.getImageData(0, 0, this.canvas.width, this.canvas.height);
};
/**
 * 绘制缩略图
 * @private
 */
GeoBeans.Map.prototype.restoreSnap = function(){
	if(this.snap!=null){
		this.renderer.putImageData(this.snap, 0, 0);
	}
	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		layer.restoreSnap();
	}
}

/**
 * 绘制最基础的canvas的缩略图
 */
GeoBeans.Map.prototype.restoreMapSnap = function(){
	if(this.snap!=null){
		this.renderer.putImageData(this.snap, 0, 0);
	}
};

/**
 * 绘制缩略图
 * @private
 */
GeoBeans.Map.prototype.putSnap = function(x, y){
	if(!isValid(x) || !isValid(y)){
		return;
	}
	if(this.snap!=null){
		this.renderer.putImageData(this.snap, x, y);
	}

	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		layer.putSnap(x,y);
	}
}

/**
 * 清除snap
 * @private
 */
GeoBeans.Map.prototype.cleanupSnap = function(){
	this.snap = null;
	for(var i = 0; i < this.layers.length;++i){
		var layer = this.layers[i];
		layer.cleanupSnap();
	}
}



/**
 * 绘制地图的导航条
 * @private
 */
GeoBeans.Map.prototype.drawNavControl = function(){
	var index = this.controls.find(GeoBeans.Control.Type.NAV);
	var mapNavControl = this.controls.get(index);
	var zoom = this.getViewer().getZoom();
	mapNavControl.setZoomSlider(zoom);
};

/**
 * 绘制Widgets
 * @private
 */
GeoBeans.Map.prototype.drawWidgets = function(){
	this.widgets.refresh();
};

/**
 * 按照control的类型返回control
 * @public
 * @param  {GeoBeans.Control.Type} type 
 * @return {GeoBeans.Control}      [description]
 */
GeoBeans.Map.prototype.getControl = function(type){
	if(type == null){
		return null;
	}

	var i = this.controls.find(type);
	if(i < 0){
		return null;
	}

	var control = this.controls.get(i);
	return control;
};


/**
 * 设置地图级别和中心点，中心点可不设置
 * @public
 * @param  {integer} zoom   级别
 * @param  {GeoBeans.Geometry.Point} center 中心点
 */
GeoBeans.Map.prototype.zoomTo = function(zoom,center){
	if(!isValid(this.baseLayer)){
		return;
	}

	var viewer = this.getViewer();

	var source = this.baseLayer.getSource();
	var resolution = source.getResolution(zoom);

	viewer.setZoomResolution(zoom,resolution);

	if(isValid(center)){
		var c = new GeoBeans.Geometry.Point(center.getX(),center.getY());
		viewer.setCenterResolution(c,resolution);
	}

};

/**
 * 设置中心点
 * @public
 * @param {int} zoom 设置地图级别
 */
GeoBeans.Map.prototype.moveTo = function(center){
	if(!isValid(center)){
		return;
	}

	if(!(center instanceof GeoBeans.Geometry.Point)){
		return;
	}

	var c = new GeoBeans.Geometry.Point(center.getX(),center.getY());
	var viewer = this.getViewer();
	viewer.setCenter(c);
};


/**
 * 放大到给定地图范围
 * @public
 * @param {GeoBeans.Envelope} extent 视口范围
 */
GeoBeans.Map.prototype.zoomToExtent = function(extent){
	if(!isValid(extent)){
		return;
	}

	var viewer = this.getViewer();
	viewer.setExtent(extent);

	if(isValid(this.baseLayer)){
		var resolution = viewer.getResolution();
		var source = this.baseLayer.getSource();
		var zoom = source.getFitZoom(resolution);
		viewer.setZoom(zoom);
	}
};

/**
 * 放大到给定分辨率
 * @param {float} resolution 视口分辨率
 */
GeoBeans.Map.prototype.zoomToResolution = function(resolution){
	if(!isValid(resolution)){
		return;
	}
	this.viewer.setResolution(resolution);
}

/**
 * 放大到给定要素集合的范围
 * @param {Array.<GeoBeans.Feature>} features 要素集合
 */
GeoBeans.Map.prototype.zoomToFeatures = function(features){
	if(!isValid(features)){
		return;
	}
	if(features.length==0){
		return;
	}
	var extent = new GeoBeans.Envelope();
	features.forEach(function(f){
		var g = f.getGeometry();
		if(isValid(g)){
			var e = g.getExtent();
			if(isValid(e)){
				extent.union(e);
			}
		}
	});
	if(extent.isValid()){
		this.zoomToExtent(extent);	
	}
}


/**
 * 放大到给定geometry范围
 * @param {GeoBeans.Geometry} geometry 几何对象
 * @public
 */
GeoBeans.Map.prototype.zoomToGeometry = function(geometry){
	if(!isValid(geometry)){
		return;
	}
	var extent = geometry.getExtent();
	if(!isValid(extent)){
		return;
	}
	if(extent.isValid()){
		this.zoomToExtent(extent);	
	}
}


/**
 * 添加Widget
 * @public
 * @param {GeoBeans.Widget} widget widget
 */
GeoBeans.Map.prototype.addWidget = function(widget){
	this.widgets.add(widget);
};


/**
 * 删除widget
 * @public
 * @param  {GeoBeans.Widget} widget 要删除的widget
 */
GeoBeans.Map.prototype.removeWidget = function(widget){
	this.widgets.remove(widget);
};

/**
 * 根据类型获取widget
 * @public
 * @param  {GeoBeans.Widget.Type} type  widget类型
 * @return {GeoBeans.Widget}      返回的widget
 */
GeoBeans.Map.prototype.getWidget = function(type){
	if(!isValid(type)){
		return null;
	}

	var i = this.widgets.find(type);
	if(i < 0){
		return null;
	}
	var widget = this.widgets.get(i);
	return widget;
};
