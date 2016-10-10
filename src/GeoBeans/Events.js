/**
 * @classdesc
 * Map5的事件类。
 * @class
 */
GeoBeans.Event = {	
	/** 地图事件 */
	/** @type {String} 单击地图*/
	CLICK 		: "click",			
	/** @type {string} 双击地图*/
	DBCLICK		: "dblclick",
	/** @type {string} 地图大小变化*/
	RESIZE		: "resize",

	/** @type {string} 状态发生变化*/
	CHANGE		: "change",
	/** @type {string} 开始拖动*/
	DRAG_BEGIN	: "dragbegin",
	/** @type {string} 拖动地图*/
	DRAGING		: "dragging",
	/** @type {string} 拖动结束*/
	DRAG_END	: "dragend",

	/* mouse Event */
	/** @type {string} 鼠标按下*/
	MOUSE_DOWN	: "mousedown",
	/** @type {string} 鼠标抬起*/
	MOUSE_UP 	: "mouseup",
	/** @type {string} 鼠标移动*/
	MOUSE_MOVE 	: "mousemove",
	/** @type {string} 鼠标位于元素之上*/
	MOUSE_OVER 	: "mouseover",
	/** @type {string} 鼠标离开元素*/
	MOUSE_OUT 	: "mouseout",
	// RESIZE		: "resize",
	MOUSE_WHEEL : "mousewheel",
	
	/* touch Event */
	/** @type {string} 手势按下*/
	TOUCH_START	: 'touchstart',
	/** @type {string} 手势移动*/
	TOUCH_MOVE 	: 'touchmove',
	/** @type {string} 手势终止*/
	TOUCH_END 	: 'touchend',
	/** @type {string} 手势旋转*/
	TOUCH_WHEEL	: 'touchwheel',

	/** @type {string} Feature选中事件*/
	FEATURE_HIT	: 'hit'
};

/**
 * @classdesc
 * 鼠标按键。
 * @class
 */
GeoBeans.Event.MouseButton = {
	/** @type {string} 鼠标左键*/
	LEFT	: "left",
	/** @type {string} 鼠标右键*/
	RIGHT	: "right",
	/** @type {string} 鼠标中键*/
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
	return null;
};