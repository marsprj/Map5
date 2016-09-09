GeoBeans.MovePoint = GeoBeans.Class(GeoBeans.MoveObject,{
	point : null,

	line : null,

	option : {
		duration : 2000,
		showLine : true,
		once 	: true  //只循环一次
	},

	onceAnimate : false,


	initialize : function(id,point,line,option){
		this.id = id;
		this.point = point;
		this.line = line;
		// this.option = option;

		if(option != null){
			if(option.duration != null){
				this.option.duration = option.duration;
			}
			if(option.showLine != null){
				this.option.showLine = option.showLine;
			}
			if(option.pointSymbolizer != null){
				this.option.pointSymbolizer = option.pointSymbolizer;
			}

			if(option.lineSymbolizer != null){
				this.option.lineSymbolizer = option.lineSymbolizer;
			}
			if(option.once != null){
				this.option.once = option.once;
			}
		}
		this.type = GeoBeans.MoveType.POINT;

		this.calculate();
	},

	start : function(){
		GeoBeans.MoveObject.prototype.start.apply(this, arguments);
		// this.beginTime = null;
		this.onceAnimate = false;
	},

	stop : function(){
		GeoBeans.MoveObject.prototype.stop.apply(this, arguments);
		this.beginTime = null;
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
		// var point = points[0];

		var distanceArray = [];
		for(var i = 1; i < points.length;++i){
			var point0 = points[i - 1];
			var point1 = points[i];
			var distance = GeoBeans.Utility.getDistance(point0.x,point0.y,point1.x,point1.y);
			distanceArray.push(distance);
			allDistance += distance;
		}

		var duration = this.option.duration;
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
		if(time < 0 || time > this.option.duration){
			return null;
		}

		// if(time <)/
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