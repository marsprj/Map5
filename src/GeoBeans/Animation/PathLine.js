/**
 * @classdesc
 * 轨迹线
 * @class
 */
GeoBeans.PathLine = GeoBeans.Class({
	
	_id : null,

	_points : null,

	_symbolizer : null,

	initialize : function(options){
		if(isValid(options)){
			if(isValid(options.id)){
				this._id = options.id;
			}

			if(isValid(options.point)){
				this._points = [];
				this.addPathPoint(options.point);
			}

			if(isValid(options.symbolizer)){
				this._symbolizer = options.symbolizer;
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