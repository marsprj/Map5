GeoBeans.Control.TrackControl = GeoBeans.Class(GeoBeans.Control, {
	
	map : null,
	onMouseDown : null,
	onMouseMove : null,
	onMouseDClick : null,
	
	initialize : function(){
		this.type = GeoBeans.Control.Type.TRACK;//"TrackControl";
	},

	destory : function(){
		this.end();
	},
	
	trackPoint : function(callback,userCallback,layer){
		var that = this;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmousedown = function(evt){
			that.drawPoint(evt.layerX,evt.layerY);
			//that.map.saveSnap();
			
			if( (callback!=null) && (callback!=undefined)){
				var pt = that.map.transformation.toMapPoint(evt.layerX,evt.layerY);
				callback(pt,userCallback,layer);
			}
		};
		
		var onmousemove = function(evt){
			that.map.restoreSnap();
			that.drawPoint(evt.layerX,evt.layerY);
		};
		
		this.onMouseDown = onmousedown;
		this.onMouseMove = onmousemove;
		
		this.map.canvas.addEventListener("mousemove", onmousemove);
		this.map.canvas.addEventListener("mousedown", onmousedown);
	},
	
	trackLine : function(callback){
		var that = this;
		var points = [];
		var db_points = [];
		var addEvent_flag = false;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmousedown = function(evt){
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

			var onmousemove = function(evt){
				that.map.restoreSnap();
				that.drawLine(points, evt.layerX,evt.layerY);
				that.drawPoints(points, evt.layerX,evt.layerY);
			};

			var onmousedbclick = function(evt){
				// that.map.canvas.removeEventListener("mousemove", that.onMouseMove);
				// that.map.canvas.removeEventListener("dblclick",  that.onMouseDClick);
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("dblclick",  onmousedbclick);

				if(db_points.length == points.length){
					return;
				}			
				if(db_points.length == 0){
					points.forEach(function(element, index){
						db_points.push(element);
					});
				}

				evt.preventDefault();

				that.map.restoreSnap();
				if( (callback!=null) && (callback!='undefined')){

					callback(that.buildLineString(points));
				}
				if(callback == null){
					return that.buildLineString(points);
				}
				db_points = [];
				points = [];
				addEvent_flag = false;
			}

			if(db_flag == false){
				points.push({x:evt.layerX,y:evt.layerY});
			}

			if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
				console.log('add-mousemove');
				that.map.canvas.addEventListener("mousemove", onmousemove);
				that.map.canvas.addEventListener("dblclick", onmousedbclick);
				addEvent_flag = true;
			}
			that.onMouseDClick = onmousedbclick;
			that.onMouseMove = onmousemove;
			
		};
		
		this.map.canvas.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},

	trackPolygon : function(callback){
		var that = this;
		var points = [];
		var addEvent_flag = false;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmousedown = function(evt){
			points.push({x:evt.layerX,y:evt.layerY});

			var onmousemove = function(evt){
				that.map.restoreSnap();
				if(points.length>1){
					that.drawPolygon(points, evt.layerX,evt.layerY);
					that.drawPoints( points, evt.layerX,evt.layerY);
				}
				else{
					that.drawLine(  points, evt.layerX,evt.layerY);
					that.drawPoints(points, evt.layerX,evt.layerY);
				}
			};

			var onmousedbclick = function(evt){
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("dblclick",  onmousedbclick);

				points.push({x:evt.layerX,y:evt.layerY});
				that.map.restoreSnap();
				if( (callback!=null) && (callback!='undefined')){
					if(points.length>=3){
						callback(that.buildPolygon(points));
					}
				}
				points = [];
				addEvent_flag = false;
				
			}
			if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
				console.log('add-mousemove');
				that.map.canvas.addEventListener("mousemove", onmousemove);
				that.map.canvas.addEventListener("dblclick", onmousedbclick);
				addEvent_flag = true;
			}

			that.onMouseDClick = onmousedbclick;
			that.onMouseMove = onmousemove;
		};
			
		
		this.map.canvas.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},

	trackCircle : function(callback){
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
				that.map.restoreSnap();
				that.map.enableDrag(true);


				var point_map_r = that.map.transformation.toMapPoint(point_r.x,point_r.y);
				var point_map_e = that.map.transformation.toMapPoint(point_e.x,point_e.y);
				var radius_map = Math.sqrt((point_map_e.x - point_map_r.x)*(point_map_e.x - point_map_r.x)
							+ (point_map_e.y - point_map_r.y)*(point_map_e.y - point_map_r.y));
				if( (callback!=null) && (callback!='undefined')){
					// trackBufferCircleCallback(layer,radius_map,point_map_r,callback);
					var circle = new GeoBeans.Geometry.Circle(point_map_r,radius_map);

					callback(circle);
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
	
	cleanup : function(){
		this.map.canvas.removeEventListener("mousedown", this.onMouseDown);
		this.map.canvas.removeEventListener("mousemove", this.onMouseMove);
		this.map.canvas.removeEventListener("dblclick",  this.onMouseDClick);

		this.onMouseDown = null;
		this.onMouseMove = null;
		this.onMouseDClick = null;

		this.map.restoreSnap();
	},

	end : function(){
		this.cleanup();
		this.map.enableDrag(true);
	},
	
	onMouseDownPoint : function(evt){
		
		var x = evt.layerX;
		var y = evt.layerY;
		this.drawPoint(x, y);
		
		this.map.canvas.saveSnap();
	},
	
	onMouseMovePoint : function(evt){
		
		this.map.restoreSnap();
	
		var x = evt.layerX;
		var y = evt.layerY;
		this.drawPoint(x, y);
	},
	
	drawPoint : function(x, y){
		var context = this.map.renderer.context;
	
		var r = 5;
		context.save();
		context.fillStyle = 'rgba(255,0,0,0.25)';
		context.strokeStyle = 'rgba(0,0,0,0.75)';
		context.lineWidth = 1.0;

		context.beginPath();
		context.arc(x, y, r, 0, 2 * Math.PI, false);  
		context.closePath();
		
		context.fill();
		context.stroke();
		context.restore();
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

	drawLine : function(points, x, y){
		var context = this.map.renderer.context;
		context.save();
		
		context.strokeStyle = 'rgba(255,0,0,0.25)';
		context.lineWidth = 1.0;
		
		context.beginPath();
		context.moveTo(x, y);
		var len = points.length;
		for(var i=len-1; i>=0; i--){
			context.lineTo(points[i].x, points[i].y);
		}
		context.stroke();
		context.restore();
	},


	drawPolygon : function(points, x, y){
		var context = this.map.renderer.context;	
		context.save();
		
		context.fillStyle = 'rgba(255,0,0,0.25)';
		context.strokeStyle = 'rgba(0,0,0,0.25)';
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

	drawCircle : function(point_r,radius){
		var context = this.map.renderer.context;
		context.save();

		context.strokeStyle = 'rgba(255,0,0,0.25)';
		context.lineWidth = 1.0;
		
		context.beginPath();
		context.arc(point_r.x,point_r.y,radius,0,Math.PI*2,true);
		context.strokeStyle = "#08c";
		context.stroke();
		context.closePath();

	},	

	buildLineString : function(dots){
		var pt = null;
		var points = [];
		var num = dots.length;
		for(var i=0; i<num; i++){
			pt = this.map.transformation.toMapPoint(dots[i].x, dots[i].y);
			points.push(pt);
		}
		return (new GeoBeans.Geometry.LineString(points));
	},

	buildMultiLineString : function(lines){
		
	},

	buildPolygon : function(dots){
		var pt = null;
		var points = [];
		var num = dots.length;
		for(var i=0; i<num; i++){
			pt = this.map.transformation.toMapPoint(dots[i].x, dots[i].y);
			points.push(pt);
		}
		points.push(points[0]);
		var r = new GeoBeans.Geometry.LinearRing(points);
		return (new GeoBeans.Geometry.Polygon([r]));
	}
});