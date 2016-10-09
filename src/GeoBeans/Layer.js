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

	CLASS_NAME : "GeoBeans.Layer"
});

/**
 * 获得图层名称
 * @return {string} 图层名称
 */
GeoBeans.Layer.prototype.getName = function(){
	return this.name;
}

/**
 * 设置图层名称
 * @param {string} name 名称
 */
GeoBeans.Layer.prototype.setName = function(name){
	this.name = name;
}

/**
 * 设置图层是否可见
 * @param {boolean} visible 是否可见
 */
GeoBeans.Layer.prototype.setVisible = function(visible){
	this.visible = visible;
}

/**
 * 获取图层是否可见
 * @return {boolean} 是否可见
 */
GeoBeans.Layer.prototype.isVisible = function(){
	return this.visible;
}

/**
 * 获取图层Spatial Reference
 * @return {integer} srid
 */
GeoBeans.Layer.prototype.getSrid = function(){
	return this.srid;
}

/**
 * 获取图层范围
 * @return {GeoBeans.Envelope} 图层范围
 */
GeoBeans.Layer.prototype.getExtent = function(){
	return this.extent;
}

/**
 * 获取图层所在地图
 * @return {GeoBeans.Map} 图层所在地图
 */
GeoBeans.Layer.prototype.getMap = function(){
	return this.map;
}

/**
 * 单个图层重绘
 * @public
 */
GeoBeans.Layer.prototype.refresh = function() {
	this.draw();
};

/**
 * 注册Layer事件
 * @public
 * @param  {GeoBeans.Event} event   事件
 * @param  {function} handler	    事件响应函数
 */
GeoBeans.Layer.prototype.on = function(event, handler){
	
	var target = this.events.getEvent(event);
	if(target!=null){
		//如果event已经注册，则先注销event。一个event只能注册一次。
		this.un(event);
	}

	//注册新的event
	var that = this;
	var listener = function(evt){
		evt.preventDefault();
		var x = evt.layerX;
		var y = evt.layerY;
		
		var viewer = that.map.getViewer();
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

	var mapContainer = this.map.getContainer();
	mapContainer.addEventListener(event,listener);
	this.events.addEvent(event,handler,listener);
}

/**
 * 注销Layer事件
 * @public
 * @param  {GeoBeans.Event} event   事件
 */
GeoBeans.Layer.prototype.un = function(event){
	var e = this.events.getEvent(event);
	if(e == null){
		return;
	}
	var listener = e.listener;
	var mapContainer = this.getContainer();
	mapContainer.removeEventListener(event,listener);
	this.events.removeEvent(event);
}

GeoBeans.Layer.Flag = {
	READY : "ready",
	LOADED : "loaded",
	ERROR : "error"
};