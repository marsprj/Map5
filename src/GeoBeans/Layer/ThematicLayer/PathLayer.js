/**
 * @classdesc
 * 轨迹线
 * @class
 * @extends {GeoBeans.Layer}
 */
GeoBeans.Layer.PathLayer = GeoBeans.Class(GeoBeans.Layer,{
	_pathLines : null,

	initialize :  function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this._pathLines = [];
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		this.map.beginAnimate();
	},

	destory : function(){
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
	}
});

/**
 * 是否是动画图层
 * @private
 * @return {Boolean} 
 */
GeoBeans.Layer.PathLayer.prototype.isAnimation = function(){
	return true;
};

/**
 * 添加轨迹线
 * @public
 * @param {GeoBeans.PathLine} pathLine 轨迹线
 */
GeoBeans.Layer.PathLayer.prototype.addPathLine = function(pathLine){
	if(isValid(pathLine)){
		this._pathLines.push(pathLine);
	}
}

/**
 * 根据id查询轨迹线
 * @public
 * @param  {string} id  查询id
 * @return {GeoBeans.PathLine}   查询的轨迹线
 */
GeoBeans.Layer.PathLayer.prototype.getPathLine = function(id){
	for(var i = 0; i < this._pathLines.length;++i){
		if(this._pathLines[i].getID() == id){
			return this._pathLines[i];
		}
	}
	return null;
}

/**
 * 绘制
 * @private
 */
GeoBeans.Layer.PathLayer.prototype.draw = function(time){
	if(!isValid(time)){
		return;
	}
	this.clear();
	for(var i = 0; i < this._pathLines.length;++i){
		var pathLine = this._pathLines[i];
		this._drawPathLine(pathLine,time);
	}
}

/**
 * 绘制轨迹线
 * @private
 */
GeoBeans.Layer.PathLayer.prototype._drawPathLine = function(pathLine,time){
	if(!isValid(pathLine,time)){
		return;
	}

	var pathPoints =  pathLine.getPathPoints();
	if(!isValid(pathPoints)){
		return;
	}

	var viewer = this.map.getViewer();

	var lineSymbolizer = pathLine.getSymbolizer();
	var pathPoint = null,bPathPoint = null;
	var beginPoint = pathPoints[0];
	if(isValid(beginPoint) && pathPoints.length == 1){
		var symbolizer = beginPoint.getSymbolizer();
		var point = beginPoint.getPoint();
		this.renderer.drawGeometry(point,symbolizer,viewer);
	}
	for(var i = 1; i < pathPoints.length;++i){
		pathPoint = pathPoints[i];
		bPathPoint = pathPoints[i - 1];
		// 已经经过该点
		if(pathPoint.getStatus()){
			var point = pathPoint.getPoint();
			var symbolizer = pathPoint.getSymbolizer();
			if(i == pathPoints.length -1){
				var rotation = this._getRotation(bPathPoint.getPoint(),pathPoint.getPoint());
				
				symbolizer.symbol.rotation = rotation;
				this.renderer.drawGeometry(point,symbolizer,viewer);
			}
			this._drawLine(bPathPoint.getPoint(),pathPoint.getPoint(),lineSymbolizer);
		}else{
			// 还未经过该点
			this._drawAnimationLine(bPathPoint,pathPoint,lineSymbolizer,time);
			break;
		}
	}
}

/**
 * 绘制线段，按照样式
 * @private
 */
GeoBeans.Layer.PathLayer.prototype._drawLine = function(point1,point2,lineSymbolizer){
	if(!isValid(point1) || !isValid(point2) || !isValid(lineSymbolizer)){
		return;
	}

	var points = [point1,point2];
	var line = new GeoBeans.Geometry.LineString(points);

	var viewer = this.map.getViewer();
	this.renderer.setSymbolizer(lineSymbolizer);
	this.renderer.drawGeometry(line,lineSymbolizer,viewer);
};


/**
 * 按照两个轨迹点绘制动态线
 * @private
 */
GeoBeans.Layer.PathLayer.prototype._drawAnimationLine = function(bPathPoint,pathPoint,lineSymbolizer,time){
	if(!isValid(bPathPoint) || !isValid(pathPoint) || !isValid(time)){
		return;
	}
	var bPoint = bPathPoint.getPoint();
	var point = pathPoint.getPoint();

	if(!isValid(bPoint) || !isValid(point)){
		return;
	}

	var viewer = this.map.getViewer();

	var distance = GeoBeans.Utility.getDistance(bPoint.x,bPoint.y,point.x,point.y);
	var lineTime = pathPoint.getTime();
	// 每秒走的距离
	var mapDelta = distance/lineTime;

	var elapsedTime = 0;
	// 还没有走过
	if(!isValid(pathPoint.beginTime)){
		pathPoint.beginTime = time;
		elapsedTime = 0;
	}else{
		elapsedTime = time - pathPoint.beginTime;
		if(elapsedTime >= lineTime){
			pathPoint.setStatus(true);
			elapsedTime = lineTime;
		}
		var x = bPoint.x + (point.x - bPoint.x) * elapsedTime/lineTime;
		var y = bPoint.y + (point.y - bPoint.y) * elapsedTime/lineTime;
		var pointByTime = new GeoBeans.Geometry.Point(x,y);
		var symbolizer = pathPoint.getSymbolizer();
		var rotation = this._getRotation(bPathPoint.getPoint(),pointByTime);
		symbolizer.symbol.rotation = rotation;
		this.renderer.setSymbolizer(symbolizer);
		this.renderer.drawGeometry(pointByTime,symbolizer,viewer);
		this._drawLine(bPoint,pointByTime,lineSymbolizer);
	}
}

/**
 * 计算点的方位角
 * @private
 */
GeoBeans.Layer.PathLayer.prototype._getRotation = function(point1,point2){
	if(!isValid(point1) && !isValid(point2)){
		return 0;
	}
	return GeoBeans.Utility.getAngle(point1.x,point1.y,point2.x,point2.y);
}