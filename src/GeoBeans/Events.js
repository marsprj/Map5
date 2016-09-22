/**
 * @classdesc
 * Map5的事件类。
 * @class
 */
GeoBeans.Event = {	
	/** 地图事件 */
	/** @type {string} */
	CLICK 		: "click",			
	DBCLICK		: "dbclick",
	RESIZE		: "resize",

	CHANGE		: "change",
	DRAG_BEGIN	: "dragbegin",
	DRAGING		: "dragging",
	DRAG_END	: "dragend",

	/* mouse Event */
	MOUSE_DOWN	: "mousedown",
	MOUSE_UP 	: "mouseup",
	MOUSE_MOVE 	: "mousemove",
	MOUSE_OVER 	: "mouseover",
	MOUSE_OUT 	: "mouseout",
	// RESIZE		: "resize",
	MOUSE_WHEEL : "mousewheel",
	/* touch Event */
	TOUCH_START	: 'touchstart',
	TOUCH_MOVE 	: 'touchmove',
	TOUCH_END 	: 'touchend',
	TOUCH_WHEEL	: 'touchwheel'
};


GeoBeans.Event.MouseButton = {
	LEFT	: "left",
	RIGHT	: "right",
	MID		: "mid"
};

/*
 * 
 */
GeoBeans.Event.MouseArgs = function(){
	buttn : null;
	X : null;
	Y : null;
	mapX : null;
	mapY : null;
	zoom : null;
};

/**
 * @classdesc
 * Map5的事件类集合。
 * @class
 * @private
 */
GeoBeans.Events = GeoBeans.Class({
	
	events : null,
	
	initialize : function(){
		this.events = [];
	},
	
	destory : function(){
		this.events = null;
	},

	addEvent : null,

	getEvent : null,

	removeEvent : null,
	
});

/**
 * 添加事件
 * @param {GeoBeans.Event} event    事件类型
 * @param {function} handler  用户回调函数
 * @param {function} listener 注册监听事件
 */
GeoBeans.Events.prototype.addEvent = function(event,handler,listener){
	this.events.push({
		event : event,
		handler : handler,
		listener : listener
	});
};

/**
 * 注销事件
 * @param  {GeoBeans.Event} event 事件类型
 * @return {[type]}       [description]
 */
GeoBeans.Events.prototype.removeEvent = function(event){
	for(var i = 0; i < this.events.length;++i){
		var e = this.events[i];
		if(e.event == event){
			this.events.splice(i,1);
		}
	}
};

/**
 * 按照事件类型返回事件
 * @param  {GeoBeans.Event} event 事件类型
 * @return {Object}       事件
 */
GeoBeans.Events.prototype.getEvent = function(event){
	for(var i = 0; i < this.events.length;++i){
		var e = this.events[i];
		if(e.event == event){
			return e;
		}
	}
};