GeoBeans.Layer.GeoLineLayer = GeoBeans.Class(GeoBeans.Layer,{
	data : null,

	option : null,

	// 动态点的半径
	minRadius : 1,
	maxRadius : 15,
	radiusSpeed : 0.15,
	
	// 外圈的
	alpha : 0.5,


	initialize : function(name,data,option){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.data = data;
		this.option = option;

		this.calculateLine();
	},


	setMap : function(){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		window.layer = this;
		window.requestNextAnimationFrame(this.animate);
	},

	load : function(){
		this.drawLine();
		layer.drawToPoint();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},


	animate : function(time){
		var layer = this.layer;
		layer.renderer.clearRect();
		layer.drawLine();
		layer.drawMovingDot(time);
		layer.drawToPoint(time);
		window.requestNextAnimationFrame(layer.animate); 
	},

	// draw : function(){
	// 	var width = this.map.width;
	// 	var height = this.map.height;

	// 	var x = Math.random()*100;
	// 	var y = Math.random()*90;
	// 	var center = new GeoBeans.Geometry.Point(x,y);
	// 	var circle = new GeoBeans.Geometry.Circle(center,5);
	// 	var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
	// 	this.renderer.setSymbolizer(symbolizer);
	// 	this.renderer.drawGeometry(circle,symbolizer,this.map.transformation);
	// 	this.map.drawLayersAll();
	// },

	drawLine : function(){
		this.renderer.setSymbolizer(this.option.symbolizer);
		for(var i = 0; i < this.data.length;++i){
			var line = this.data[i];
			this.renderer.drawBezierLine(line.from,line.to,line.control,this.map.getMapViewer());
		}
	},
	// 计算贝塞尔曲线
	calculateLine : function(){
		if(this.data == null){
			return;
		}
		for(var i = 0; i < this.data.length;++i){
			var line = this.data[i];
			var point = this.getBezierControlPoint(line.from,line.to,this.option.curveness);
			line.control = point;
			var distance = this.getDistance(line.from,line.to);
			var alltime = distance/this.option.mapDelta*1000;
			// 每条线的运行时间
			line.alltime = alltime;
			line.points = [];
			// 拖尾长度
			var trailLength = distance*this.option.trailLength;
			line.trailLength = trailLength;
		}

	},


	getBezierControlPoint : function(from,to,curveness){
		if(from == null || to == null){
			return null;
		}
		var center = new GeoBeans.Geometry.Point(from.x/2+to.x/2,from.y/2+to.y/2);
		var distance = this.getDistance(from,to);
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


	getDistance : function(p1,p2){
		return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
	},

	// 绘制移动的点
	drawMovingDot : function(time){
		this.renderer.setSymbolizer(this.option.pointSymbolizer);
		// this.renderer.context.shadowBlur=20;
		// this.renderer.context.shadowColor = this.option.pointSymbolizer.fill.color.getRgba();
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
			this.renderer.drawGeometry(point,this.option.pointSymbolizer,this.map.getMapViewer());
			line.points.push(point);
			this.drawTrail(line,point);
		}
		this.map.drawLayersAll();
	},

	// 绘制拖尾，当前点
	drawTrail : function(line,point){
		var trailLength = line.trailLength;
		var points = line.points;
		var drawPoints = [];
		for(var i = points.length - 1; i >=0;--i){
			var prePoint = points[i];
			var distance = this.getDistance(point,prePoint);
			if(distance < trailLength){
				drawPoints.push(prePoint);
			}
		}
		if(drawPoints.length == 0){
			return;
		}
		
		// gradient.addColorStop(0.00,"red");
  //       gradient.addColorStop(1.00,"red");        
        var radius = this.option.pointSymbolizer.size;
        this.renderer.context.lineWidth=radius*2;
        var spt = this.map.getMapViewer().toScreenPoint(point.x,point.y);
        this.renderer.context.beginPath();
        this.renderer.context.moveTo(spt.x,spt.y);
		for(var i = 0; i < drawPoints.length;++i){
			var pt = this.map.getMapViewer().toScreenPoint(drawPoints[i].x,drawPoints[i].y);
			this.renderer.context.lineTo(pt.x,pt.y);
		}
		var endPoint = drawPoints[drawPoints.length - 1];
		var sendPoint = this.map.getMapViewer().toScreenPoint(endPoint.x,endPoint.y);
		var gradient = this.renderer.context.createLinearGradient(spt.x,spt.y,sendPoint.x,sendPoint.y);
		gradient.addColorStop(0.00,this.option.pointSymbolizer.fill.color.getRgba());
        gradient.addColorStop(1.00,"rgba(255,255,255,0)");
        this.renderer.context.strokeStyle = gradient;
		this.renderer.context.stroke();
	},

	// 绘制终点
	drawToPoint : function(time){
		this.calculateRadius();

		// 和线一个颜色
		var color = this.option.symbolizer.stroke.color;
		var rgb = color.getRgb();


		var outerColor = rgb.replace("rgb", "rgba").replace(")", "") + ",";
		outerColor += this.alpha + ")";
		
		var context = this.renderer.context;

		for(var i = 0; i < this.data.length;++i){
			var line = this.data[i];
			var to = line.to;

			context.strokeStyle = rgb;
			var toPoint = this.map.getMapViewer().toScreenPoint(to.x,to.y);
			context.beginPath();
			context.arc(toPoint.x,toPoint.y,this.innerRadius,0, 2 * Math.PI);
			context.stroke();
			context.closePath();	

			context.strokeStyle = outerColor;
			var toPoint = this.map.getMapViewer().toScreenPoint(to.x,to.y);
			context.beginPath();
			context.arc(toPoint.x,toPoint.y,this.outerRadius,0, 2 * Math.PI);
			context.stroke();	
			context.closePath();			

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