GeoBeans.Event.EventType = {
	/* Map event */
	CLICK 		: "click",			
	DCLICK 		: "dblclick",
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
	MOUSE_WHEEL : "mousewheel"

	/* touch Event */
	TOUCHSTART	: 'touchstart',
	TOUCHMOVE 	: 'touchmove',
	TOUCHEND 	: 'touchend',
	WHEEL 		: 'wheel'
};

GeoBeans.Events = GeoBeans.Class({
	
	_events : {},
	
	initialize : function(){
	},
	
	on : null,
	un : null,
	get: null

});

/**
 * [destory description]
 * @return {[type]} [description]
 */
GeoBeans.Events.prototype.destory = function(){
		this._events = null;
}

/**
 * [on description]
 * @param  {[type]} evt         [description]
 * @param  {[type]} evt_handler [description]
 * @return {[type]}             [description]
 */
GeoBeans.Events.prototype.on = function(evt, evt_handler){
	this._events[evt] = evt_handler;
}

/**
 * [un description]
 * @param  {[type]} evt [description]
 * @return {[type]}     [description]
 */
GeoBeans.Events.prototype.un = function(evt){
	handler = this._events[evt];
	if(handler!=undefined){
		//this._events[evt] = undefined;	
		delete this._events[evt];
	}
}
	
/**
 * 
 * @param  {[type]} evt [description]
 * @return {[type]}     [description]
 */
GeoBeans.Events.prototype.get = function(evt){		
	return this._events[evt];
}