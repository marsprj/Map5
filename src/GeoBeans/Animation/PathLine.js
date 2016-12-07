/**
 * @classdesc
 * 轨迹线
 * @class
 */
GeoBeans.PathLine = GeoBeans.Class({
	
	_id : null,

	_points : null,

	_symbolizer : null,

	_maxCount : null,

	_textSymbolizer : null,

	initialize : function(options){
		if(isValid(options)){
			if(isValid(options.id)){
				this._id = options.id;
			}

			if(isValid(options.point)){
				this._points = [];
				options.point.setStatus(true);
				this.addPathPoint(options.point);
			}

			if(isValid(options.symbolizer)){
				this._symbolizer = options.symbolizer;
			}
			if(isValid(options.maxCount)){
				this._maxCount = options.maxCount;
			}

			if(isValid(options.textSymbolizer)){
				this._textSymbolizer = options.textSymbolizer;
			}
		}

	},
});

/**
 * 添加轨迹点
 * @public
 * @param {GeoBeans.PathPoint} pathPoint 轨迹点
 */
GeoBeans.PathLine.prototype.addPathPoint = function(pathPoint){
	if(isValid(pathPoint)){
		this._points.push(pathPoint);	
	}
};

/**
 * 获取所有的轨迹点
 * @public
 * @return {Array.<GeoBeans.PathPoint>} 轨迹点数组
 */
GeoBeans.PathLine.prototype.getPathPoints = function(){
	return this._points;
};


/**
 * 获取该轨迹线的ID
 * @public
 * @return {string} ID值
 */
GeoBeans.PathLine.prototype.getID = function(){
	return this._id;
}


/**
 * 获取轨迹线的样式
 * @public
 * @return {GeoBeans.Symbolizer.LineSymbolizer} 轨迹线的样式
 */
GeoBeans.PathLine.prototype.getSymbolizer = function(){
	return this._symbolizer;
}

/**
 * 获取最大的轨迹点个数
 * @public
 * @return {integer} 最大轨迹点个数
 */
GeoBeans.PathLine.prototype.getMaxCount = function(){
	return this._maxCount;
}


/**
 * 设置最大的轨迹点个数
 * @public
 * @param {integer} maxCount 最大轨迹点个数
 */
GeoBeans.PathLine.prototype.setMaxCount = function(maxCount){
	this._maxCount = maxCount;
}

/**
 * 获取文字样式
 * @public
 * @return {GeoBeans.Symbolizer.TextSymbolizer} 文字样式
 */
GeoBeans.PathLine.prototype.getTextSymbolizer = function(){
	return this._textSymbolizer;
}