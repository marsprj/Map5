GeoBeans.Events = {	
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
GeoBeans.Events.MouseButton = {
	LEFT	: "left",
	RIGHT	: "right",
	MID		: "mid"
};

/*
 * 鼠标事件
 */
GeoBeans.Events.MouseArgs = function(){
	buttn : null;
	X : null;
	Y : null;
	mapX : null;
	mapY : null;
};