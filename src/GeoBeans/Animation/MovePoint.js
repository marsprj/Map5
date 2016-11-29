GeoBeans.MovePoint = GeoBeans.Class(GeoBeans.MoveObject,{

	line : null,

	onceAnimate : false,

	// 运动点的样式
	pointSymbolizer : null,

	// 轨迹线的样式
	lineSymbolizer : null,

	// 运动时间
	duration : null,

	// 是否显示运动轨迹线
	showLine : null,

	// 是否只运动一次
	once : null,


	initialize : function(option){
		if(isValid(option)){
			if(isValid(option.id)){
				this.id = option.id;
			}

			if(isValid(option.line)){
				this.line = option.line;
			}

			if(isValid(option.pointSymbolizer)){
				this.pointSymbolizer = option.pointSymbolizer;
			}			

			if(isValid(option.lineSymbolizer)){
				this.lineSymbolizer = option.lineSymbolizer;
			}

			if(isValid(option.duration)){
				this.duration = option.duration;
			}else{
				this.duration = 2000;
			}

			if(isValid(option.showLine)){
				this.showLine = option.showLine;
			}else{
				this.showLine = true;
			}

			if(isValid(option.once)){
				this.once = option.once;
			}else{
				this.once = true;
			}
		}

		this.type = GeoBeans.MoveType.POINT;

		this.calculate();
	},

	calculate : function(){
		if(this.line == null){
			return;
		}

		var points = this.line.points;
		if(points.length <= 1){
			return;
		}
		var allDistance = 0;
		var distanceArray = [];
		for(var i = 1; i < points.length;++i){
			var point0 = points[i - 1];
			var point1 = points[i];
			var distance = GeoBeans.Utility.getDistance(point0.x,point0.y,point1.x,point1.y);
			distanceArray.push(distance);
			allDistance += distance;
		}

		var duration = this.duration;
		// 每毫秒走的距离
		var mapDelta = allDistance/duration;
		this.mapDelta = mapDelta;
		var times = [];
		times.push(0);
		var timePass = 0;
		for(var i = 0; i < distanceArray.length;++i){
			var distance = distanceArray[i];
			var time = distance / mapDelta;
			timePass += time;
			times.push(timePass);
		}

		this.times = times;
	},


	getPoint : function(time){
		if(time < 0 || time > this.duration){
			return null;
		}

		var point0 = null,point1 = null,time0 = null,time1 = null;
		var points = this.line.points;
		var time_0 = null;
		for(var i = 1; i < this.times.length;++i){
			var t = this.times[i];
			if(time <= t){
				point0 = points[i - 1];
				point1 = points[i];
				time0 = this.times[i-1];
				time1 = this.times[i];
				break;
			}
		}
		if(point0 == null || point1 == null){
			return null;
		}

		var x = point0.x + (point1.x - point0.x)*(time- time0)/(time1-time0);
		var y = point0.y + (point1.y - point0.y)*(time- time0)/(time1-time0);
		return new GeoBeans.Geometry.Point(x,y);
	},

});

/**
 * 开始运动
 * @public
 */
GeoBeans.MovePoint.prototype.start = function(){
	GeoBeans.MoveObject.prototype.start.apply(this, arguments);
	this.onceAnimate = false;
};

/**
 * 停止运动
 * @public
 */
GeoBeans.MovePoint.prototype.stop = function(){
	GeoBeans.MoveObject.prototype.stop.apply(this, arguments);
	this.beginTime = null;
};