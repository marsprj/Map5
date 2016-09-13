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
			
			if( (callback!=null) && (callback!=undefined)){
				var pt = that.map.mapViewer.toMapPoint(evt.layerX,evt.layerY);
				callback(pt,userCallback,layer);
			}
		};
		
		var onmousemove = function(evt){
			that.map.restoreSnap();
			that.drawPoint(evt.layerX,evt.layerY);
		};
		
		this.onMouseDown = onmousedown;
		this.onMouseMove = onmousemove;
		
		this.map.mapDiv[0].addEventListener("mousemove", onmousemove);
		this.map.mapDiv[0].addEventListener("mousedown", onmousedown);
	},
	
	trackLine : function(callback,map,layer,callback_u){
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
				that.map.mapDiv[0].removeEventListener("dblclick",  that.onMouseDClick);
				that.map.mapDiv[0].removeEventListener("mousemove", onmousemove);
				that.map.mapDiv[0].removeEventListener("dblclick",  onmousedbclick);

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

					callback(that.buildLineString(points),map,layer,callback_u);
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
				that.map.mapDiv[0].addEventListener("mousemove", onmousemove);
				that.map.mapDiv[0].addEventListener("dblclick", onmousedbclick);
				addEvent_flag = true;
			}
			that.onMouseDClick = onmousedbclick;
			that.onMouseMove = onmousemove;
			
		};
		
		this.map.mapDiv[0].addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},

	trackPolygon : function(callback,map,layer,callback_u){
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
				that.map.mapDiv[0].removeEventListener("mousemove", onmousemove);
				that.map.mapDiv[0].removeEventListener("dblclick",  onmousedbclick);

				points.push({x:evt.layerX,y:evt.layerY});
				that.map.restoreSnap();
				if( (callback!=null) && (callback!='undefined')){
					if(points.length>=3){
						callback(that.buildPolygon(points),map,layer,callback_u);
					}
				}
				points = [];
				addEvent_flag = false;
				
			}
			if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
				console.log('add-mousemove');
				that.map.mapDiv[0].addEventListener("mousemove", onmousemove);
				that.map.mapDiv[0].addEventListener("dblclick", onmousedbclick);
				addEvent_flag = true;
			}

			that.onMouseDClick = onmousedbclick;
			that.onMouseMove = onmousemove;
		};
			
		
		this.map.mapDiv[0].addEventListener("mousedown", onmousedown);
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
				that.map.mapDiv[0].removeEventListener("mousemove", onmousemove);
				that.map.mapDiv[0].removeEventListener("mouseup", onmouseup);
				that.map.restoreSnap();
				that.map.enableDrag(true);


				var point_map_r = that.map.mapViewer.toMapPoint(point_r.x,point_r.y);
				var point_map_e = that.map.mapViewer.toMapPoint(point_e.x,point_e.y);
				var radius_map = Math.sqrt((point_map_e.x - point_map_r.x)*(point_map_e.x - point_map_r.x)
							+ (point_map_e.y - point_map_r.y)*(point_map_e.y - point_map_r.y));
				if( (callback!=null) && (callback!='undefined')){
					// trackBufferCircleCallback(layer,radius_map,point_map_r,callback);
					var circle = new GeoBeans.Geometry.Circle(point_map_r,radius_map);

					callback(circle);
				}
			};

			that.map.mapDiv[0].addEventListener("mousemove", onmousemove);
			that.map.mapDiv[0].addEventListener("mouseup", onmouseup);

			that.onMouseMove = onmousemove;
			that.onMouseUp = onmouseup;
		};	

		this.map.mapDiv[0].addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;

	},

	trackRect : function(callback,map,layer,style,callback_u){
		var that = this;

		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var point_b = null;
		var point_e = null;
		var rect = null;
		var onmousedown = function(evt){
			evt.preventDefault();
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

				if(callback != null && callback != 'undefined'){
					callback(rect,map,layer,style,callback_u);
				}
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
	
	trackInfo : function(callback,layer,map,callback_u){
		var that = this;
		// this.map.enableDrag(false);
		var point_b = null;
		var point_e = null;
		var onmousedown = function(evt){
			if(!(evt.target.tagName.toUpperCase() == "CANVAS")){
				return;
			}
			point_b = {x:evt.layerX,y:evt.layerY};

			var onmouseup = function(evt){
				point_e = {x:evt.layerX,y:evt.layerY};

				var dis_x = point_b.x - point_e.x;
				var dis_y = point_b.y - point_e.y;
				if(Math.abs(dis_x) > 0.0001 || Math.abs(dis_y) > 0.0001){
					that.map.mapDiv[0].removeEventListener("mouseup", onmouseup);
					return;
				}
				var point = new GeoBeans.Geometry.Point(point_b.x,point_b.y);
				if(callback != null && callback != undefined){
					console.log(point_b.x,point_b.y);
					callback(point,layer,map,callback_u);
				}
				that.map.mapDiv[0].removeEventListener("mouseup", onmouseup);
			}
			that.map.mapDiv[0].addEventListener("mouseup", onmouseup);
			
			that.onMouseUp = onmouseup;
		};
		this.map.mapDiv[0].addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
		
	},

	cleanup : function(){
		this.map.mapDiv[0].removeEventListener("mousedown", this.onMouseDown);
		this.map.mapDiv[0].removeEventListener("mousemove", this.onMouseMove);
		this.map.mapDiv[0].removeEventListener("dblclick",  this.onMouseDClick);
		this.map.mapDiv[0].removeEventListener("mouseup",  this.onMouseUp);

		this.onMouseDown = null;
		this.onMouseMove = null;
		this.onMouseDClick = null;
		this.onMouseUp = null;

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
		
		this.map.mapDiv[0].saveSnap();
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
		context.lineWidth = 3.0;
		
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
			pt = this.map.mapViewer.toMapPoint(dots[i].x, dots[i].y);
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
			pt = this.map.mapViewer.toMapPoint(dots[i].x, dots[i].y);
			points.push(pt);
		}
		points.push(points[0]);
		var r = new GeoBeans.Geometry.LinearRing(points);
		return (new GeoBeans.Geometry.Polygon([r]));
	},

	buildRect : function(point_b,point_e){
		point_b = this.map.mapViewer.toMapPoint(point_b.x,point_b.y);
		point_e = this.map.mapViewer.toMapPoint(point_e.x,point_e.y);
		var xmin = (point_b.x > point_e.x) ? point_e.x : point_b.x;
		var xmax = (point_b.x > point_e.x) ? point_b.x : point_e.x;
		var ymin = (point_b.y > point_e.y) ? point_e.y : point_b.y;
		var ymax = (point_b.y > point_e.y) ? point_b.y : point_e.y;
		var envelope = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		return envelope;
	}
});