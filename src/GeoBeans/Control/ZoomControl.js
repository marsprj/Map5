/**
 * @classdesc
 * 缩放地图控制
 * @class
 * @extends {GeoBeans.Control}
 */
GeoBeans.Control.ZoomControl = GeoBeans.Class(GeoBeans.Control, {

	// 放大还是缩小
	mode : null,
	
	initialize : function(){
		this.type = GeoBeans.Control.Type.ZOOM;//"TrackControl";
	},

	destory : function(){
		this.end();
	},

	// end : function(){
	// 	this.cleanup();
	// 	this.map.enableDrag(true);
	// },

	setMode : function(mode){
		this.mode = mode;
	},

	cleanup : function(){
		var mapContainer = this.map.getContainer();
		mapContainer.removeEventListener("mousedown", this.onMouseDown);
		mapContainer.removeEventListener("mousemove", this.onMouseMove);
		mapContainer.removeEventListener("mouseup",  this.onMouseUp);

		this.onMouseDown = null;
		this.onMouseMove = null;
		this.onMouseUp = null;

	},

	trackRect : function(){
		var that = this;
		var mapContainer = this.map.getContainer();

		if(this.onMouseDown != null){
			return;
		}
		
		this.map.enableDrag(false);
		// this.cleanup();

		var point_b = null;
		var point_e = null;
		var rect = null;
		var onmousedown = function(evt){
			evt.preventDefault();
			that.map.saveSnap();
			point_b = {x:evt.layerX,y:evt.layerY};
			that.drawPoints([],evt.layerX,evt.layerY);

			var onmousemove = function(evt){
				evt.preventDefault();
				if(point_b == null){
					return;
				}
				point_e = {x:evt.layerX,y:evt.layerY};
				that.map.restoreSnap();
				var points = [];
				points.push(point_b);
				points.push({x: point_e.x,y:point_b.y});
				points.push(point_e);
				points.push({x: point_b.x,y:point_e.y});
				that.drawPolygon(points,point_b.x,point_b.y);
			};

			var onmouseup = function(evt){
				evt.preventDefault();
				if(point_e == null){
					return;
				}
				var dis_x = point_b.x - point_e.x;
				var dis_y = point_b.y - point_e.y;

				
				mapContainer.removeEventListener("mousemove", onmousemove);
				mapContainer.removeEventListener("mouseup", onmouseup);
				that.map.restoreSnap();
				// that.map.enableDrag(true);
				if(Math.abs(dis_x) < 0.0001 && Math.abs(dis_y) < 0.0001){
					return;
				}
				var rect = that.buildRect(point_b,point_e);

				that.zoomMap(rect);
				point_b = null;
				point_e = null;
			};

			mapContainer.addEventListener("mousemove", onmousemove);
			mapContainer.addEventListener("mouseup", onmouseup);

			that.onMouseMove = onmousemove;
			that.onMouseUp = onmouseup;
		};

		mapContainer.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},

	drawPolygon : function(points, x, y){
		var context = this.map.renderer.context;	
		context.save();
		
		context.fillStyle = 'rgba(255,255,255,0.25)';
		context.strokeStyle = 'rgba(0,0,0,1)';
		context.lineWidth = 0.5;
		
		var len = points.length;
		context.beginPath();
		context.moveTo(x, y);
		for(i=0; i<len; i++){
			context.lineTo(points[i].x, points[i].y);
		}
		context.closePath();
		context.fill();
		context.stroke();
		context.restore();
	},

	buildRect : function(point_b,point_e){
		var viewer = this.map.getViewer();
		point_b = viewer.toMapPoint(point_b.x,point_b.y);
		point_e = viewer.toMapPoint(point_e.x,point_e.y);
		var xmin = (point_b.x > point_e.x) ? point_e.x : point_b.x;
		var xmax = (point_b.x > point_e.x) ? point_b.x : point_e.x;
		var ymin = (point_b.y > point_e.y) ? point_e.y : point_b.y;
		var ymax = (point_b.y > point_e.y) ? point_b.y : point_e.y;
		var envelope = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		return envelope;
	},

	drawPoints : function(points, x, y){
		var context = this.map.renderer.context;
		context.save();
		
		var r = 5;
		context.fillStyle = 'rgba(255,0,0,0.25)';
		context.strokeStyle = 'rgba(255,0,0,0.25)';
		context.lineWidth = 0.5;
		
		context.beginPath();
		context.arc(x, y, r, 0, 2 * Math.PI, false);  
		context.closePath();				
		context.fill();
		context.stroke();
		
		var len = points.length;
		for(var i=0;i<len;i++){
			context.beginPath();
			context.arc(points[i].x, points[i].y, r, 0, 2 * Math.PI, false);  
			context.closePath();				
			context.fill();
			context.stroke();
		}
		
		context.restore();
	},

	// 放大图层
	zoomMap : function(rect){
		// console.log(rect);
		if(this.mode == "in"){
			this.zoomInMap(rect);
		}else{
			this.zoomOutMap(rect);
		}
	},

	zoomInMap : function(rect){
		// if(this.map.baseLayer != null){
		// 	var level = this.map.getLevel(rect);
		// 	this.map._setLevel(level);
		// 	console.log(level);
		// 	var center = rect.getCenter();
		// 	this.map.setCenter(center);
		// }else{
		// 	this.map.setViewer(rect);
		// }
		// this.map.getViewer().setExtent(rect);
		//this.map.draw();		
		this.map.setViewExtent(rect);
	},

	zoomOutMap : function(rect){
		var viewer = this.map.getViewer();
		var extent = viewer.getExtent();

		//根据当前地图的视图范围(extent)和当前拉框的大小(rect)计算缩放比例
		var scale_x = extent.getWidth() / rect.getWidth();
		var scale_y = extent.getHeight()/ rect.getHeight();
		// 选比例大的
		var s = scale_x > scale_y ? scale_x : scale_y;

		var tr_c = rect.getCenter();

		//1. 将viewer的中心点移动到rect的中心点位置
		//2. 根据缩放比例修正viewer的可是范围
		var nextent = extent.clone();
		nextent.moveTo(tr_c.x, tr_c.y);
		nextent.scale(s);

		this.map.setViewExtent(nextent);
	},
});

/**
 * 拉框放大
 * @public
 */
GeoBeans.Control.ZoomControl.prototype.zoomIn = function(){
	this.setMode("in");
	this.trackRect();
};

/**
 * 拉框缩小
 * @public
 */
GeoBeans.Control.ZoomControl.prototype.zoomOut = function(){
	this.setMode("out");
	this.trackRect();
};

/**
 * 停止拉框缩放
 * @public
 */
GeoBeans.Control.ZoomControl.prototype.end = function(){
	this.cleanup();
	this.map.enableDrag(true);
};