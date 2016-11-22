/**
 * @classdesc
 * 轨迹点
 * @class
 */
GeoBeans.PathPoint = GeoBeans.Class({
	
	// 点
	_point : null,

	// 事件
	_time : null,

	// 样式
	_symbolizer : null,

	// 是否经过
	_passed : null,

	initialize : function(options){
		if(isValid(options)){
			if(isValid(options.point)){
				this._point = options.point;
			}

			if(isValid(options.time)){
				this._time = options.time;
			}

			if(isValid(options.symbolizer)){
				this._symbolizer = options.symbolizer;
			}

			this._passed = false;
		}
	}
});

/**
 * 获取轨迹点的样式
 * @public
 * @return {GeoBeans.Symbolizer.PointSymbolizer} 轨迹点的样式
 */
GeoBeans.PathPoint.prototype.getSymbolizer = function(){
	return this._symbolizer;
}

/**
 * 获取轨迹点的点
 * @public
 * @return {GeoBeans.Geometry.Point} 点
 */
GeoBeans.PathPoint.prototype.getPoint = function(){
	return this._point;
}

/**
 * 设置是否经过的状态
 * @private
 */
GeoBeans.PathPoint.prototype.setStatus = function(passed){
	this._passed = passed;
}

/**
 * 获取是否经过的状态
 * @private
 */
GeoBeans.PathPoint.prototype.getStatus = function(){
	return this._passed;
}

/**
 * 获取到达该点的时间
 * @public
 * @return {integer} 时间
 */
GeoBeans.PathPoint.prototype.getTime = function(){
	return this._time;
}