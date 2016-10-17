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
	_source  : null,

	mapPoint_lt : null,
	mapPoint_rb : null,

	flag : null,
	
	initialize : function(name){
		this.name = name;
		this.events = new GeoBeans.Events();

		this.flag = GeoBeans.Layer.Flag.READY;

		this.canvas = document.createElement("canvas");
	},
	
	destroy : function(){
		var mapContainer = this.map.getContainer();
		$(mapContainer).find(".map5-canvas[id='" + this.name + "']").remove();
		
		this.name = null;
		this.events = null;
	},
	
	setName : function(newName){
		this.name = newName
	},
	
	setMap : function(map){
		this.map = map;
		
		var mapCanvasHeight = map.height;
		var mapCanvasWidth = map.width;

		
		this.canvas.height = mapCanvasHeight;
		this.canvas.width = mapCanvasWidth;

		this.canvas.id = this.name;
		this.canvas.className = "map5-canvas";

		var mapContainer = this.map.getContainer();
		$(mapContainer).append(this.canvas);
		this.renderer = new GeoBeans.Renderer(this.canvas);
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
 * 刷新图层
 * @public
 */
GeoBeans.Layer.prototype.refresh = function() {
	if(this.visible){
		this.draw();
	}
	else{
		this.clear();
	}
};

/**
 * 重绘图层
 * @public
 */
GeoBeans.Layer.prototype.draw = function() {

};

/**
 * 获得数据源对象
 * @public
 * @return {GeoBeans.Source} 图层的数据源对象
 */
GeoBeans.Layer.prototype.getSource = function(){
	return this._source;
}

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

/**
 * 设置不透明度
 * @public
 * @param  {GeoBeans.Event} event   事件
 */
GeoBeans.Layer.prototype.setOpacity = function(opacity){
	if(opacity<0){
		this.opacity = 0;
	}
	else if(opacity>1){
		this.opacity = 1;
	}
	else{
		this.opacity = opacity;
	}
},

/**
 * 保存缩略图
 * @private
 */
GeoBeans.Layer.prototype.saveSnap = function(){
	this.snap = this.renderer.getImageData(0,0,this.canvas.width,this.canvas.height);
};


/**
 * 绘制缩略图
 * @private
 */
GeoBeans.Layer.prototype.restoreSnap = function(){
	if(this.snap != null){
		this.renderer.putImageData(this.snap,0,0);
	}
};


/**
 * 放置缩略图
 * @private
 * @param  {int} x x向坐标
 * @param  {int} y y向坐标
 */
GeoBeans.Layer.prototype.putSnap = function(x,y){
	if(!isValid(x) || !isValid(y)){
		return;
	}
	if(this.snap!=null){
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.renderer.putImageData(this.snap, x, y);
	}
};

/**
 * 指定位置和大小放置缩略图
 * @private
 * @param  {int]} x     x坐标
 * @param  {int} y      y坐标
 * @param  {int} width  放置后的宽度
 * @param  {int} height 放置后的高度
 */
GeoBeans.Layer.prototype.drawLayerSnap = function(x,y,width,height){
	if(this.snap == null){
		return;
	}
	this.renderer.save();
	this.renderer.setGlobalAlpha(1);	
	var canvas = $("<canvas>")
	    .attr("width", this.snap.width)
	    .attr("height", this.snap.height)[0];
	canvas.getContext("2d").putImageData(this.snap, 0, 0);
	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
	this.renderer.drawImage(canvas,x,y,width,height);
	this.renderer.restore();
};

/**
 * 清除snap
 * @private
 */
GeoBeans.Layer.prototype.cleanupSnap = function(){
	this.snap = null;
}

/**
 * 清空
 * @protected
 */
GeoBeans.Layer.prototype.clear = function(){
	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
};


/**
 * 重新调整大小
 * @private
 * @param  {int} width  宽度
 * @param  {int} height 高度
 */
GeoBeans.Layer.prototype.resize = function(width,height){
	this.canvas.width = width;
	this.canvas.height = height;
};

GeoBeans.Layer.Flag = {
	READY : "ready",
	LOADED : "loaded",
	ERROR : "error"
};