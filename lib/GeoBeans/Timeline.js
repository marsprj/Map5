GeoBeans.Timeline = GeoBeans.Class({
	
	interval : null,
	
	labels : null,

	map  : null,

	canvas : null,

	// 线段端点
	point_b : null,

	point_e : null,

	radius :4,

	initialize : function(interval,labels){
		this.interval = interval;
		this.labels = labels;
	},

	setMap : function(map){
		this.map = map;

		var mapCanvas = this.map.canvas;
		if(mapCanvas == null){
			return;
		}
		var mapCanvasHeight = mapCanvas.height;
		var mapCanvasWidth = mapCanvas.width;

		this.canvas = document.createElement("canvas");
		this.canvas.height = mapCanvasHeight;
		this.canvas.width = mapCanvasWidth;

		this.renderer = new GeoBeans.Renderer(this.canvas);

	},
	draw : function(){
		this.drawLine();
		this.drawPoints();
	},

	drawLine : function(){
		var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		var color = new GeoBeans.Color();
		color.setByHex("#008ACD",1.0);
		symbolizer.stroke.color = color;
		symbolizer.stroke.width = 4;

		var lineBottom = this.canvas.height*0.3;
		var lineWidth = this.canvas.width*0.6;
		var lineBegin_x = this.canvas.width*0.2;
		var lineBegin_y = this.canvas.height * 0.83;

		this.point_b = new GeoBeans.Geometry.Point(lineBegin_x,lineBegin_y);
		this.point_e = new GeoBeans.Geometry.Point(lineBegin_x+lineWidth,lineBegin_y);

		var point_b_m = this.map.transformation.toMapPoint(this.point_b.x,this.point_b.y);
		var point_e_m = this.map.transformation.toMapPoint(this.point_e.x,this.point_e.y);
		var line = new GeoBeans.Geometry.LineString([point_b_m,point_e_m]);
		this.renderer.setSymbolizer(symbolizer);
		this.renderer.drawLineString(line,symbolizer,this.map.transformation);

	},

	drawPoints : function(){
		var point = null;
		var count = this.labels.length;
		var point_x = null;
		var point_y = null;
		var circles = [];


		var intervalWidth = (this.point_e.x - this.point_b.x)/(count-1);
		for(var i = 0; i < this.labels.length; ++i){
			point_x = this.point_b.x + i*intervalWidth;
			point_y = this.point_b.y;
			point =  this.map.transformation.toMapPoint(point_x,point_y);
			var radius = this.getRadius(point);
			var circle = new GeoBeans.Geometry.Circle(point,radius);

			circles.push(circle);
		}

		var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		symbolizer.fill = null;
		var color = new GeoBeans.Color();
		color.setByHex("#008ACD",1.0);
		symbolizer.stroke.color = color;
		this.renderer.setSymbolizer(symbolizer);

		var circle = null;
		for(var i = 0; i < circles.length; ++i){
			circle = circles[i];
			this.renderer.drawCircle(circle,symbolizer,this.map.transformation);
		}
	},

	getRadius : function(point){

		var point_b = this.map.transformation.toMapPoint(point.x - this.radius,point.y);
		var point_e = this.map.transformation.toMapPoint(point.x + this.radius,point.y);

		var radius = Math.abs(point_e.x - point_b.x);
		return radius;
	}


});