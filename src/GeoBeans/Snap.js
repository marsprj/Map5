/**
 * @classdesc
 * @private
 * 缩略图类
 */
GeoBeans.Snap = GeoBeans.Class({
	
	_map : null,
	_layer : null,

	_snap : null,

	_extent : null,
	initialize : function(layer){
		this._layer = layer;
	},

	attach : function(map){
		this._map = map;
	},

	destroy : function(){
		this._snap = null;
	}
});


/**
 * 保存缩略图
 * @private
 */
GeoBeans.Snap.prototype.saveSnap = function(){
	var renderer = this._layer.getRenderer();
	var canvas = this._layer.getCanvas();
	this._snap = renderer.getImageData(0,0,canvas.width,canvas.height);

	var viewer = this._map.getViewer();
	this._extent = viewer.getExtent().clone();
};



/**
 * 绘制缩略图
 * @private
 */
GeoBeans.Snap.prototype.drawSnap = function(){

	if(!isValid(this._snap)){
		return;
	}
	var viewer = this._map.getViewer();
	var leftTop = viewer.toScreenPoint(this._extent.xmin,this._extent.ymax);

	var rightBottom = viewer.toScreenPoint(this._extent.xmax,this._extent.ymin);

	var width  = rightBottom.x - leftTop.x;
	var height = rightBottom.y - leftTop.y;

	var canvas = $("<canvas>")
	    .attr("width", this._snap.width)
	    .attr("height", this._snap.height)[0];
	canvas.getContext("2d").putImageData(this._snap, 0, 0);

	this._layer.clear();
	var renderer = this._layer.getRenderer();
	renderer.drawImage(canvas,leftTop.x,leftTop.y,width,height);
};

/**
 * 指定位置放置缩略图
 * @private
 * @param  {integer} x x 坐标
 * @param  {integer} y y 坐标
 */
GeoBeans.Snap.prototype.putSnap = function(x,y){
	if(!isValid(this._snap)){
		return;
	}

	this._layer.clear();
	var renderer = this._layer.getRenderer();
	renderer.putImageData(this._snap, x, y);
};


/**
 * 清理缩略图
 * @private
 */
GeoBeans.Snap.prototype.cleanupSnap = function(){
	this._snap = null;
}


/**
 * 绘制缩略图
 * @private
 */
GeoBeans.Snap.prototype.restoreSnap = function(){
	if(!isValid(this._snap)){
		return;
	}	
	var renderer = this._layer.getRenderer();
	renderer.putImageData(this._snap,0,0);
}