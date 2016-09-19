GeoBeans.Interaction.RotateType = {
	CLICK 	 : "click",
	HOVER	 : "hover",
	LINE 	 : "line",
	POLYGON  : "polygon",
	CIRCLE 	 : "circle",
	BBOX	 : "bbox"
};

/**
 * Map5的查询交互类
 * @class
 * @description 实现Map5与用户的交互功能
 */
GeoBeans.Interaction.Rotate = GeoBeans.Class(GeoBeans.Interaction, {
	_map	: null,
	_onMouseMove : null,


	initialize : function(options){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);

		if(isValid(options.map)){
			this._map = options.map;	
		}

		this.start();
	},
	
	destory : function(){
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
		this.stop();
	},

	CLASS_NAME : "GeoBeans.Interaction.Rotate"
});

/**
 * [enable description]
 * @public
 * @param  {[type]} enabled [description]
 * @return {[type]}         [description]
 */
GeoBeans.Interaction.Rotate.prototype.enable = function(enabled){
	this._enabled = enabled;
	if(enabled){
		//init
		this.start();
	}else{
		//cleanup
		this.stop();
	}
}

/**
 * [start description]
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Rotate.prototype.start = function(){
	var that = this;
	this.stop();

	var mapContainer = this._map.getContainer();
	this._map.saveSnap();
	var onmousemove = function(evt){
		var viewer = that._map.getViewer();
		var cx = viewer.getWindowWidth() / 2;
		var cy = viewer.getWindowHeight()/ 2;
		var mx = evt.layerX;
		var my = evt.layerY;
		var dx = mx - cx;
		var dy = cy - my;
		var dd = Math.sqrt(Math.pow(dx,2.0) + Math.pow(dy,2,0));
		var sinx = dy / dd;
		var theta = Math.asin(sinx);
		var angle = 180.0 * theta / Math.PI;

		//console.log("[" + evt.layerX + "," + evt.layerY + "]:" + theta);
		console.log("dx:" + dx + ", dy:" + dy + ",dd:" + dd + ", theta:" + theta + ",angle:" + angle);

		var renderer = that._map.renderer;
		renderer.clearRect();
		var context = renderer.context;
		context.save();
		context.translate(-cx, -cy);
		that._map.putSnap(0,0);
		context.rotate(theta);
		context.restore();

	};
	
	this._onMouseMove = onmousemove;
	
	mapContainer.addEventListener("mousemove", onmousemove);
}

/**
 * [cleanup description]
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Rotate.prototype.stop = function(){
	var mapContainer = this._map.getContainer();
	if(isValid(this._onMouseMove)){
		mapContainer.removeEventListener("mousemove", this._onMouseMove);	
		this._map.cleanupSnap();
	}
	

	this._onMouseMove = null;
}