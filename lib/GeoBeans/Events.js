GeoBeans.Event = {	
	/* mouse event */
	CLICK 		: "click",
	DCLICK 		: "dblclick",
	MOUSE_DOWN	: "mousedown",
	MOUSE_UP 	: "mouseup",
	MOUSE_MOVE 	: "mousemove",
	MOUSE_OVER 	: "mouseover",
	MOUSE_OUT 	: "mouseout",
	RESIZE		: "resize"
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
};

GeoBeans.Events = GeoBeans.TileCache = GeoBeans.Class({
	
	events : null,
	
	initialize : function(){
		this.events = [];
	},
	
	destory : function(){
		this.events = null;
	},
	
	addEvent : function(evt, evt_handler){
		this.events.push({event : evt, handler : evt_handler});
	},
	
	getEvnet : function(event){
		var len = this.events;
		for(var i=0; i<len; i++){
			var evt = this.events[i];
			if(evt.event == event){
				return evt;
			}
		}
		return null;
	}
});