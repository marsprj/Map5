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


GeoBeans.Layer.Flag = {
	READY : "ready",
	LOADED : "loaded",
	ERROR : "error"
};