GeoBeans.Control.TrackBufferControl = GeoBeans.Class(GeoBeans.Control.TrackControl, {
	
	// map : null,
	// onMouseClick : null,
	// onMouseMove : null,
	// onMouseDBclick : null,
	// onMouseDown : null,
	// onMouseUp : null,

	initialize : function(){
		this.type = GeoBeans.Control.Type.TRACKBUFFER;//"TrackBufferControl";
	},

	destory : function(){
		this.end();
	},

	end : function(){
		this.cleanup();
		this.map.enableDrag(true);
	},	


	trackBufferCircle : function(layer,callback,trackBufferCircleCallback){
		var that = this;

		var point_r = null;
		var point_e = null;
		var radius = 0;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();
		var onmousedown = function(evt){
			evt.preventDefault();
			point_r = {x:evt.layerX,y:evt.layerY};
			that.drawPoints([],evt.layerX,evt.layerY);

			var onmousemove = function(evt){
				evt.preventDefault();
				point_e = {x:evt.layerX,y:evt.layerY};
				that.map.restoreSnap();
				that.drawPoints([],point_r.x,point_r.y);
				radius = Math.sqrt((point_e.x - point_r.x)*(point_e.x - point_r.x)
							+ (point_e.y - point_r.y)*(point_e.y - point_r.y));
				that.drawCircle(point_r,radius);
			};

			var onmouseup = function(evt){
				evt.preventDefault();
				if(point_e == null){
					return;
				}
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("mouseup", onmouseup);
				that.map.canvas.removeEventListener("mousedown", that.onMouseDown);
				that.map.restoreSnap();
				that.map.enableDrag(true);


				var point_map_r = that.map.transformation.toMapPoint(point_r.x,point_r.y);
				var point_map_e = that.map.transformation.toMapPoint(point_e.x,point_e.y);
				var radius_map = Math.sqrt((point_map_e.x - point_map_r.x)*(point_map_e.x - point_map_r.x)
							+ (point_map_e.y - point_map_r.y)*(point_map_e.y - point_map_r.y));
				if( (callback!=null) && (callback!='undefined')){
					trackBufferCircleCallback(layer,radius_map,point_map_r,callback);
				}
			};

			that.map.canvas.addEventListener("mousemove", onmousemove);
			that.map.canvas.addEventListener("mouseup", onmouseup);

			that.onMouseMove = onmousemove;
			that.onMouseUp = onmouseup;
		};	

		this.map.canvas.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;

	},
	trackBufferLine : function(layer,distance,callback,trackBufferLineCallback){
		var that = this;
		var points = [];
		var db_points = [];
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmouseclick = function(evt){
			evt.preventDefault();
			var db_flag = false;
			for(var i = 0; i < points.length; ++i){
				var point = points[i];
				var point_x = point.x;
				var point_y = point.y;
				if(point_x == evt.layerX && point_y == evt.layerY){
					db_flag = true;
				}

			}
			if(db_flag == false){
				points.push({x:evt.layerX,y:evt.layerY});
			}			

			var onmousemove = function(evt){
				that.map.restoreSnap();
				that.drawLine(points, evt.layerX,evt.layerY);
				that.drawPoints(points, evt.layerX,evt.layerY);
			};

			var onmousedbclick = function(evt){
				evt.preventDefault();
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("dblclick",  onmousedbclick);
				that.map.canvas.removeEventListener("click",  that.onMouseClick);
				that.map.enableDrag(true);

				if(db_points.length == points.length){
					return;
				}			
				if(db_points.length == 0){
					points.forEach(function(element, index){
						db_points.push(element);
					});
				}

				that.map.restoreSnap();
				if( (callback!=null) && (callback!='undefined')){
					trackBufferLineCallback(layer,distance,that.buildLineString(points),callback);
					// callback(that.buildLineString(points),that.buffer);
				}
				db_points = [];
				points = [];
			}

			that.map.canvas.addEventListener("mousemove", onmousemove);
			that.map.canvas.addEventListener("dblclick", onmousedbclick);


			that.onMouseMove = onmousemove;
			that.onMouseDBclick = onmousedbclick;			
		};
			
		
		this.map.canvas.addEventListener("click", onmouseclick);
		this.onMouseClick = onmouseclick;

	},


	// drawPoints : function(points, x, y){
	// 	var context = this.map.renderer.context;
	// 	context.save();
		
	// 	var r = 5;
	// 	context.fillStyle = 'rgba(255,0,0,0.25)';
	// 	context.strokeStyle = 'rgba(255,0,0,0.25)';
	// 	context.lineWidth = 0.5;
		
	// 	context.beginPath();
	// 	context.arc(x, y, r, 0, 2 * Math.PI, false);  
	// 	context.closePath();				
	// 	context.fill();
	// 	context.stroke();
		
	// 	var len = points.length;
	// 	for(var i=0;i<len;i++){
	// 		context.beginPath();
	// 		context.arc(points[i].x, points[i].y, r, 0, 2 * Math.PI, false);  
	// 		context.closePath();				
	// 		context.fill();
	// 		context.stroke();
	// 	}
		
	// 	context.restore();
	// },

	// drawLine : function(points, x, y){
	// 	var context = this.map.renderer.context;
	// 	context.save();
		
	// 	context.strokeStyle = 'rgba(255,0,0,0.25)';
	// 	context.lineWidth = 1.0;
		
	// 	context.beginPath();
	// 	context.moveTo(x, y);
	// 	var len = points.length;
	// 	for(var i=len-1; i>=0; i--){
	// 		context.lineTo(points[i].x, points[i].y);
	// 	}
	// 	context.stroke();
	// 	context.restore();
	// },



	// buildLineString : function(dots){
	// 	var pt = null;
	// 	var points = [];
	// 	var num = dots.length;
	// 	for(var i=0; i<num; i++){
	// 		pt = this.map.transformation.toMapPoint(dots[i].x, dots[i].y);
	// 		points.push(pt);
	// 	}
	// 	return (new GeoBeans.Geometry.LineString(points));
	// },

	cleanup : function(){
		this.map.canvas.removeEventListener("click", this.onMouseClick);
		this.map.canvas.removeEventListener("mousemove", this.onMouseMove);
		this.map.canvas.removeEventListener("dblclick",  this.onMouseDBclick);
		this.map.canvas.removeEventListener("mousedown",  this.onMouseDown);
		this.map.canvas.removeEventListener("mouseup",  this.onMouseUp);

		this.onMouseClick = null;
		this.onMouseMove = null;
		this.onMouseDBclick = null;
		this.onMouseDown = null;
		this.onMouseUp = null;

	}
});