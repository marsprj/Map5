GeoBeans.Event = {	
	/* mouse event */
	CLICK 		: "click",
	DCLICK 		: "dblclick",
	MOUSE_DOWN	: "mousedown",
	MOUSE_UP 	: "mouseup",
	MOUSE_MOVE 	: "mousemove",
	MOUSE_OVER 	: "mouseover",
	MOUSE_OUT 	: "mouseout",
	RESIZE		: "resize",
	MOUSE_WHEEL : "mousewheel"
};

/*
 * 鼠标按键
 */
GeoBeans.Event.MouseButton = {
	LEFT	: "left",
	RIGHT	: "right",
	MID		: "mid"
};

/*
 * 鼠标事件
 */
GeoBeans.Event.MouseArgs = function(){
	buttn : null;
	X : null;
	Y : null;
	mapX : null;
	mapY : null;
	level : null;
};

GeoBeans.Events = GeoBeans.Class({
	
	events : null,
	
	initialize : function(){
		this.events = [];
	},
	
	destory : function(){
		this.events = null;
	},
	
	// addEvent : function(evt, evt_handler){
	// 	this.events.push({event : evt, handler : evt_handler});
	// },
	
	// getEvnet : function(event){
	// 	var len = this.events;
	// 	for(var i=0; i<len; i++){
	// 		var evt = this.events[i];
	// 		if(evt.event == event){
	// 			return evt;
	// 		}
	// 	}
	// 	return null;
	// }
	// 
	addEvent : function(event,handler,eventHandler){
		this.events.push({
			event : event,
			handler : handler,
			eventHandler : eventHandler
		});
	},


	getEventHandler : function(event,handler){
		for(var i = 0; i < this.events.length;++i){
			var eventObj = this.events[i];
			if(eventObj.event == event && eventObj.handler == handler){
				return eventObj.eventHandler;
			}
		}
	},

	removeEventHandler : function(event,handler){
		for(var i = 0; i < this.events.length;++i){
			var eventObj = this.events[i];
			if(eventObj.event == event && eventObj.handler == handler){
				this.events.splice(i,1);
			}
		}
	},

	/**
	 * 
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	GeoBeans.Events.prototype.get = function(evt){		
		return this._events[evt];
	}
});