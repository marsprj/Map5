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
 * @extends {GeoBeans.Interaction}
 */
GeoBeans.Interaction.Rotate = GeoBeans.Class(GeoBeans.Interaction, {
	_map	: null,
	_onMouseMove : null,

	_rotating : false,


	initialize : function(options){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);

		if(isValid(options.map)){
			this._map = options.map;	
		}

		this._type = GeoBeans.Interaction.Type.ROTATE;

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
 * 开始交互
 * @public
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Rotate.prototype.start = function(){
	var that = this;
	this.stop();

	var mapContainer = this._map.getContainer();
	this._map.saveSnap();
	var viewer = this._map.getViewer();

	var center = viewer.getCenter();


	// 各自注册
	var keyCode = null;
	var listenEvent = function(evt){
		if(evt instanceof KeyboardEvent){
			keyCode = evt.keyCode;
			// shift键
			if(keyCode != 16){
				return;
			}
			that._rotating = true;
			var onkeyup = function(evt){
				that._rotating = false;
				keyCode = null;
				document.removeEventListener("keyup",onkeyup);
			};
			document.addEventListener("keyup",onkeyup,false);
		}

		// 鼠标点击事件
		if(evt instanceof MouseEvent){
			if(keyCode == 16){
				that._rotating = true;
				console.log("begin move");
				var rotation = viewer.getRotation();
				var point_b = viewer.toMapPoint(evt.layerX,evt.layerY);
				var angle_b = GeoBeans.Utility.getAngle(center.x,center.y,point_b.x,point_b.y);
				var width = that._map.getWidth();
				var height = that._map.getHeight();
				for(var i = 0; i < that._map.layers.length;++i){
					var layer = that._map.layers[i];
					var canvas_bk = document.createElement("canvas");
					canvas_bk.width = width;
					canvas_bk.height = height;
					var context_bk = canvas_bk.getContext('2d');
					context_bk.drawImage(layer.canvas,0,0);
					layer.canvas_bk = canvas_bk;
				}
				var canvas_bk = document.createElement("canvas");
				canvas_bk.width = width;
				canvas_bk.height = height;
				var context_bk = canvas_bk.getContext("2d");
				context_bk.drawImage(that._map.canvas,0,0);


				var onmousemove = function(evt){
					var point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
					var angle_e = GeoBeans.Utility.getAngle(center.x,center.y,point_e.x,point_e.y);

					var delta = angle_e - angle_b;
					that._map.clear();

					for(var i = 0; i < that._map.layers.length;++i){
						var layer = that._map.layers[i];
						var canvas_bk = layer.canvas_bk;
						layer.renderer.save();
						layer.renderer.translate(width/2,height/2);
						layer.renderer.rotate(delta* Math.PI/180);
						layer.renderer.translate(-width/2,-height/2);
						layer.renderer.drawImage(canvas_bk,0,0,canvas_bk.width,canvas_bk.height);
						layer.renderer.restore();
					}

					that._map.renderer.save();
					that._map.renderer.translate(width/2,height/2);
					that._map.renderer.rotate(delta* Math.PI/180);
					that._map.renderer.translate(-width/2,-height/2);
					that._map.renderer.drawImage(canvas_bk,0,0,canvas_bk.width,canvas_bk.height);
					that._map.renderer.restore();
				};
				var onmouseup = function(evt){
					that._rotating = false;
					var point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
					var angle_e = GeoBeans.Utility.getAngle(center.x,center.y,point_e.x,point_e.y);

					var delta = angle_e - angle_b;
					viewer.setRotation(delta + rotation);
					that._map.refresh();
					mapContainer.removeEventListener("mouseup",onmouseup);
					mapContainer.removeEventListener("mousemove",onmousemove);
					
				};

				mapContainer.addEventListener("mousemove",onmousemove);
				mapContainer.addEventListener("mouseup",onmouseup);
			}
		}
	};

	document.addEventListener("keydown",listenEvent,false);
	mapContainer.addEventListener("mousedown", listenEvent);

	this._listenEvent = listenEvent; 

}
/**
 * [cleanup description]
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Rotate.prototype.stop = function(){
	var mapContainer = this._map.getContainer();
	if(isValid(this._listenEvent)){
		document.removeEventListener("keydown",this._listenEvent,false);
		mapContainer.removeEventListener("mousedown", this._listenEvent);	
		this._map.cleanupSnap();
	}
	this._listenEvent = null;
}

/**
 * 返回是否已经在交互的状态
 * @private
 * @return {bool} 交互状态
 */
GeoBeans.Interaction.Rotate.prototype.getRotateStatus = function(){
	return this._rotating;
};