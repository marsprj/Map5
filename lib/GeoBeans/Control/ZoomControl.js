GeoBeans.Control.ZoomControl = GeoBeans.Class(GeoBeans.Control, {

	// 放大还是缩小
	mode : null,
	
	initialize : function(){
		this.type = GeoBeans.Control.Type.ZOOM;//"TrackControl";
	},

	destory : function(){
		this.end();
	},

	end : function(){
		this.cleanup();
		this.map.enableDrag(true);
	},

	setMode : function(mode){
		this.mode = mode;
	},

	cleanup : function(){
		this.map.mapDiv[0].removeEventListener("mousedown", this.onMouseDown);
		this.map.mapDiv[0].removeEventListener("mousemove", this.onMouseMove);
		this.map.mapDiv[0].removeEventListener("mouseup",  this.onMouseUp);

		this.onMouseDown = null;
		this.onMouseMove = null;
		this.onMouseUp = null;

		// this.map.restoreSnap();
	},

	trackRect : function(){
		var that = this;

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

				
				that.map.mapDiv[0].removeEventListener("mousemove", onmousemove);
				that.map.mapDiv[0].removeEventListener("mouseup", onmouseup);
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

			that.map.mapDiv[0].addEventListener("mousemove", onmousemove);
			that.map.mapDiv[0].addEventListener("mouseup", onmouseup);

			that.onMouseMove = onmousemove;
			that.onMouseUp = onmouseup;
		};

		this.map.mapDiv[0].addEventListener("mousedown", onmousedown);
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
		point_b = this.map.transformation.toMapPoint(point_b.x,point_b.y);
		point_e = this.map.transformation.toMapPoint(point_e.x,point_e.y);
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


	zoomInMap : function (rect) {
		var viewer = this.map.viewer;
		var scale_x = rect.getWidth() / viewer.getWidth();
		var scale_y = rect.getHeight() / viewer.getHeight();
		var s = scale_x < scale_y ? scale_x : scale_y;
		viewer.scale(s); 
		if(this.map.baseLayer != null){
			var level = this.map.getLevel(viewer);
			this.map.drawBackground();
			this.map.drawBaseLayerSnap(level);
			this.map.setLevel(level);
			console.log(level);
		}else{
			this.map.drawBackground();
			this.map.drawLayersSnap(s);
			this.map.setViewer(viewer);
		}
		this.map.draw();
	},

	zoomOutMap : function(rect){
		var viewer = this.map.viewer;
		var scale_x = viewer.getWidth() / rect.getWidth();
		var scale_y = viewer.getHeight() / rect.getHeight();
		// 选比例大的
		var s = scale_x > scale_y ? scale_x : scale_y;
		viewer.scale(s); 
		if(this.map.baseLayer != null){
			var level = this.map.getLevel(viewer);
			this.map.drawBackground();
			this.map.drawBaseLayerSnap(level);
			this.map.setLevel(level);
			console.log(level);
		}else{
			this.map.drawBackground();
			this.map.drawLayersSnap(s);
			this.map.setViewer(viewer);
		}
		
		this.map.draw();

	},
});
	