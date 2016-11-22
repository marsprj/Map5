GeoBeans.Layer.GeoLineLayer = GeoBeans.Class(GeoBeans.Layer,{
	data : null,

	// 动态点的半径
	minRadius : 1,
	maxRadius : 15,
	radiusSpeed : 0.15,
	
	// 外圈的
	alpha : 0.5,

	// 贝塞尔曲率
	curveness : null,

	// 按照秒走的图上距离
	mapDelta : null,

	// 线样式
	lineSymbolizer : null,

	// 动态迁徙点的样式
	pointSymbolizer : null,

	// 拖尾比例
	trailLength : null,


	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		if(isValid(options)){
			if(isValid(options.name)){
				this.name = options.name;
			}

			if(isValid(options.data)){
				this.data = options.data;
			}

			if(isValid(options.curveness)){
				this.curveness = options.curveness;
			}

			if(isValid(options.mapDelta)){
				this.mapDelta = options.mapDelta;
			}

			if(isValid(options.lineSymbolizer)){
				this.lineSymbolizer = options.lineSymbolizer;
			}

			if(isValid(options.pointSymbolizer)){
				this.pointSymbolizer = options.pointSymbolizer;
			}

			if(isValid(options.trailLength)){
				this.trailLength = options.trailLength;
			}

			if(isValid(options.visible)){
				this.setVisible(options.visible);
			}
		}
		this.calculateLine();
	},


	setMap : function(){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		this.map.beginAnimate();
	},

	// 绘制线
	drawLine : function(){
		this.renderer.setSymbolizer(this.lineSymbolizer);
		for(var i = 0; i < this.data.length;++i){
			var line = this.data[i];
			this.renderer.drawBezierLine(line.from,line.to,line.control,this.map.getViewer());
		}
	},

	// 计算贝塞尔曲线
	calculateLine : function(){
		if(this.data == null){
			return;
		}
		for(var i = 0; i < this.data.length;++i){
			var line = this.data[i];
			var point = this.getBezierControlPoint(line.from,line.to,this.curveness);
			line.control = point;
			var distance = GeoBeans.Utility.getDistance(line.from.x,line.from.y,line.to.x,line.to.y);
			var alltime = distance/this.mapDelta*1000;
			// 每条线的运行时间
			line.alltime = alltime;
			line.points = [];
			// 拖尾长度
			var trailLength = distance*this.trailLength;
			line.trailLength = trailLength;
		}

	},

	// 获取贝塞尔曲线的控制点
	getBezierControlPoint : function(from,to,curveness){
		if(from == null || to == null){
			return null;
		}
		var center = new GeoBeans.Geometry.Point(from.x/2+to.x/2,from.y/2+to.y/2);
		var distance = GeoBeans.Utility.getDistance(from.x,from.y,to.x,to.y);
		var k = (from.x-to.x)/(from.y-to.y);
		var angle = Math.atan(k);
		angle = Math.PI/2 - angle;
		var distance_cur = distance * curveness;
		var x_cur = Math.sin(angle) * distance_cur;
		var y_cur = Math.cos(angle) * distance_cur;
		var x = center.x + x_cur;
		var y = center.y - y_cur;
		var point = new GeoBeans.Geometry.Point(x,y);
		return point;
	},


	// 绘制移动的点
	drawMovingDot : function(time){
		this.renderer.setSymbolizer(this.pointSymbolizer);
		var p0 = null, p1 = null, p2 = null;
		var alltime = null;
		for(var i = 0; i< this.data.length;++i){
			var line = this.data[i];
			p0 = line.from;
			p1 = line.control;
			p2 = line.to;
			alltime = line.alltime;
			var elapsedTime = 0;
			if(line.beginTime == null){
				line.beginTime = time;
			}else{
				elapsedTime = time - line.beginTime;
				if(elapsedTime > alltime){
					line.points = [];
					elapsedTime = 0;
					line.beginTime = time;
				}
			}
			var t = elapsedTime / alltime;
			var x = (1-t) * (1-t)*p0.x + 2*t*(1-t)*p1.x + t*t*p2.x;
			var y = (1-t) * (1-t)*p0.y + 2*t*(1-t)*p1.y + t*t*p2.y;
			var point = new GeoBeans.Geometry.Point(x,y);
			this.renderer.drawGeometry(point,this.pointSymbolizer,this.map.getViewer());
			line.points.push(point);
			this.drawTrail(line,point);
		}
	},

	// 绘制拖尾，当前点
	drawTrail : function(line,point){
		var trailLength = line.trailLength;
		var points = line.points;
		var drawPoints = [];
		for(var i = points.length - 1; i >=0;--i){
			var prePoint = points[i];
			var distance = GeoBeans.Utility.getDistance(point.x,point.y,prePoint.x,prePoint.y);
			if(distance < trailLength){
				drawPoints.push(prePoint);
			}
		}
		if(drawPoints.length == 0){
			return;
		}
		
       
        var radius = this.pointSymbolizer.size;
        this.renderer.context.lineWidth=radius*2;
        var spt = this.map.getViewer().toScreenPoint(point.x,point.y);
        this.renderer.context.beginPath();
        this.renderer.context.moveTo(spt.x,spt.y);
		for(var i = 0; i < drawPoints.length;++i){
			var pt = this.map.getViewer().toScreenPoint(drawPoints[i].x,drawPoints[i].y);
			this.renderer.context.lineTo(pt.x,pt.y);
		}
		var endPoint = drawPoints[drawPoints.length - 1];
		var sendPoint = this.map.getViewer().toScreenPoint(endPoint.x,endPoint.y);
		var gradient = this.renderer.context.createLinearGradient(spt.x,spt.y,sendPoint.x,sendPoint.y);
		gradient.addColorStop(0.00,this.pointSymbolizer.fill.color.getRgba());
        gradient.addColorStop(1.00,"rgba(255,255,255,0)");
        this.renderer.context.strokeStyle = gradient;
		this.renderer.context.stroke();
	},


	// 绘制终点
	drawToPoint : function(time){
		this.calculateRadius();

		// 和线一个颜色
		var color = this.lineSymbolizer.stroke.color;
		var rgb = color.getRgb();
		var innerLineSymbolizer = this.lineSymbolizer.clone();

		var outerLineSymbolizer = this.lineSymbolizer.clone();
		outerLineSymbolizer.stroke.color.setOpacity(this.alpha);

		for(var i = 0; i < this.data.length;++i){
			var line = this.data[i];
			var to = line.to;

			var toPoint = this.map.getViewer().toScreenPoint(to.x,to.y);
			var p_inner = new GeoBeans.Geometry.Point(toPoint.x + this.innerRadius, toPoint.y + this.innerRadius);
			var p_inner_m = this.map.getViewer().toMapPoint(p_inner.x,p_inner.y);
			var innerRadius = GeoBeans.Utility.getDistance(to.x,to.y,p_inner_m.x,p_inner_m.y);
			var circleInner = new GeoBeans.Geometry.Circle(to,innerRadius);
			this.renderer.setSymbolizer(innerLineSymbolizer);
			this.renderer.drawGeometry(circleInner,innerLineSymbolizer,this.map.getViewer());

			var p_outer = new GeoBeans.Geometry.Point(toPoint.x + this.outerRadius, toPoint.y + this.outerRadius);
			var p_outer_m = this.map.getViewer().toMapPoint(p_outer.x,p_outer.y);
			var outerRadius = GeoBeans.Utility.getDistance(to.x,to.y,p_outer_m.x,p_outer_m.y);
			var circleOuter = new GeoBeans.Geometry.Circle(to,outerRadius);
			this.renderer.setSymbolizer(outerLineSymbolizer);
			this.renderer.drawGeometry(circleOuter,outerLineSymbolizer,this.map.getViewer());	

		}
	},

	// 计算半径
	calculateRadius : function(){
		// 外圈比内圈大的半径值
		var delta = 6;
		if(this.innerRadius == null){
			this.innerRadius = this.minRadius;
			this.outerRadius = this.minRadius + delta;
			this.alpha = 0.5; 
		}else{
			if(this.innerRadius >= this.maxRadius){
				this.innerRadius = this.minRadius;
				this.outerRadius = this.minRadius + delta;
				this.alpha = 0.5;
			}else{
				this.innerRadius += this.radiusSpeed;
				this.outerRadius += this.radiusSpeed;
				this.alpha = 0.5 - (this.outerRadius - this.minRadius - delta) / (this.maxRadius -
					this.minRadius - delta) * 0.5 ;
				if(this.alpha < 0){
					this.alpha = 0;
				}
			}
		}
	},

});

/**
 * 是否是动画图层
 * @private
 * @return {Boolean} 
 */
GeoBeans.Layer.GeoLineLayer.prototype.isAnimation = function(){
	return true;
};

/**
 * 绘制
 * @private
 * @param  {int} time 时间
 */
GeoBeans.Layer.GeoLineLayer.prototype.draw = function(time){
	if(!isValid(time)){
		return;
	}

	if(!this.isVisible()){
		this.clear();
		return;
	}
		
	this.clear();
	this.drawLine();
	this.drawMovingDot(time);
	this.drawToPoint(time);
}