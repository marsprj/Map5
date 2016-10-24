GeoBeans.Event.Mouse.Type = {	
	/* mouse Event */
	MOUSE_DOWN	: "mousedown",
	MOUSE_UP 	: "mouseup",
	MOUSE_MOVE 	: "mousemove",
	MOUSE_OVER 	: "mouseover",
	MOUSE_OUT 	: "mouseout",
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

/**
 * @classdesc
 * 鼠标事件类
 * @class
 * @extends {GeoBeans.Event}
 */
GeoBeans.Event.MouseEvent = {
	map  : null,
	type : "",
	buttn : null,
	X : null,
	Y : null,
	mapX : null,
	mapY : null
};

