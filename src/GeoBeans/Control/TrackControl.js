/**
 * @classdesc
 * 绘制几何要素控制
 * @class
 * @extends {GeoBeans.Control}
 */
GeoBeans.Control.TrackControl = GeoBeans.Class(GeoBeans.Control, {
	
	map : null,
	onMouseDown : null,
	onMouseMove : null,
	onMouseDClick : null,

	// 是否在绘制
	drawing : false,
	
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

		var mapContainer = this.map.getContainer();
		var onmousedown = function(evt){
			that.drawPoint(evt.layerX,evt.layerY);
			
			if( (callback!=null) && (callback!=undefined)){
				var viewer = that.map.getViewer();
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				callback(pt,userCallback,layer);
			}
		};
		
		var onmousemove = function(evt){
			that.map.restoreSnap();
			that.drawPoint(evt.layerX,evt.layerY);
		};
		
		this.onMouseDown = onmousedown;
		this.onMouseMove = onmousemove;
		
		mapContainer.addEventListener("mousemove", onmousemove);
		mapContainer.addEventListener("mousedown", onmousedown);
	},
	
	trackLine : function(callback,map,layer,callback_u){
		var that = this;
		var points = [];
		var db_points = [];
		var addEvent_flag = false;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var mapContainer = this.map.getContainer();

		var viewer = this.map.getViewer();

		var onmousedown = function(evt){
			if(points.length == 0){
				that.map.saveSnap();	
			}
			
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
			that.drawing = true;

			var onmousemove = function(evt){
				that.map.restoreSnap();
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				that.drawLine(points,pt.x,pt.y);
				that.drawPoints(points,pt.x,pt.y);
				that.drawingEvent = function(){
					var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
					that.drawLine(points,pt.x,pt.y);
					that.drawPoints(points,pt.x,pt.y);
				};
				// that.drawLine(points, evt.layerX,evt.layerY);
				// that.drawPoints(points, evt.layerX,evt.layerY);
			};

			var onmousedbclick = function(evt){
				mapContainer.removeEventListener("mousemove", onmousemove);
				mapContainer.removeEventListener("dblclick",  onmousedbclick);

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
				that.drawing = false;
			}

			if(db_flag == false){
				// points.push({x:evt.layerX,y:evt.layerY});
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				points.push({x:evt.layerX,y:evt.layerY,mapX:pt.x,mapY:pt.y});			}

			if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
				console.log('add-mousemove');
				mapContainer.addEventListener("mousemove", onmousemove);
				mapContainer.addEventListener("dblclick", onmousedbclick);
				addEvent_flag = true;
			}
			that.onMouseDClick = onmousedbclick;
			that.onMouseMove = onmousemove;
			
		};
		
		mapContainer.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},

	trackPolygon : function(callback,map,layer,callback_u){
		var that = this;
		var points = [];
		var db_points = [];
		var addEvent_flag = false;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var mapContainer = this.map.getContainer();
		var viewer = this.map.getViewer();

		var onmousedown = function(evt){
			evt.preventDefault();
			that.map.enableDrag(false);
			if(points.length == 0){
				that.map.saveSnap();
			}
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
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				points.push({x:evt.layerX,y:evt.layerY,mapX:pt.x,mapY:pt.y});
			}

			that.drawing = true;

			var onmousemove = function(evt){
				that.map.restoreSnap();
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				if(points.length>1){
					that.drawPolygon(points,pt.x,pt.y);
					that.drawPoints(points,pt.x,pt.y);
				}
				else{
					that.drawLine(points, pt.x,pt.y);
					that.drawPoints(points,pt.x,pt.y);
				}
				that.drawingEvent = function(){
					var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
					if(points.length>1){
						that.drawPolygon(points, pt.x,pt.y);
						that.drawPoints(points, pt.x,pt.y);
					}
					else{
						that.drawLine(points, pt.x,pt.y);
						that.drawPoints(points,pt.x,pt.y);
					}
				}
			};

			var onmousedbclick = function(evt){
				mapContainer.removeEventListener("mousemove", onmousemove);
				mapContainer.removeEventListener("dblclick",  onmousedbclick);
				// that.map.enableDrag(true);

				if(db_points.length == points.length){
					return;
				}			
				if(db_points.length == 0){
					points.forEach(function(element, index){
						db_points.push(element);
					});
				}

				if( (callback!=null) && (callback!='undefined')){
					if(points.length>=3){
						callback(that.buildPolygon(points),map,layer,callback_u);
					}
				}
				db_points = [];
				points = [];
				that.drawing = false;
				addEvent_flag = false;
				
			}
			if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
				mapContainer.addEventListener("mousemove", onmousemove);
				mapContainer.addEventListener("dblclick", onmousedbclick);
				addEvent_flag = true;
			}
			that.onMouseDClick = onmousedbclick;
			that.onMouseMove = onmousemove;
		};
			
		
		mapContainer.addEventListener("mousedown", onmousedown);
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

		var viewer = this.map.getViewer();
		var mapContainer = this.map.getContainer();

		var onmousedown = function(evt){
			that.map.saveSnap();

			evt.preventDefault();
			that.map.enableDrag(false);
			point_r = viewer.toMapPoint(evt.layerX,evt.layerY);
			that.drawPoints([],point_r.x,point_r.y);
			that.drawing = true;

			var onmousemove = function(evt){
				if(point_r == null){
					return;
				}
				evt.preventDefault();
				point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
				that.map.restoreSnap();
				that.drawPoints([],point_e.x,point_e.y);
				that.drawCircle(point_r,point_e);
				that.drawingEvent = function(){
					console.log(point_r);
					console.log(point_e);
					that.drawCircle(point_r,point_e);
				};
			};

			var onmouseup = function(evt){
				evt.preventDefault();
				if(point_e == null){
					return;
				}
				mapContainer.removeEventListener("mousemove", onmousemove);
				mapContainer.removeEventListener("mouseup", onmouseup);
				that.map.restoreSnap();
				// that.map.enableDrag(true);

				radius = GeoBeans.Utility.getDistance(point_e.x,point_e.y,point_r.x,point_r.y);
				if( (callback!=null) && (callback!='undefined')){
					var circle = new GeoBeans.Geometry.Circle(point_r,radius);
					callback(circle);
				}
				that.drawing = false;
				point_r = null;
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

	trackRect : function(callback,map,layer,style,callback_u){
		var that = this;

		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var point_b = null;
		var point_e = null;
		var rect = null;
		var mapContainer = this.map.getContainer();
		var viewer = this.map.getViewer();


		var onmousedown = function(evt){
			that.map.saveSnap();
			evt.preventDefault();
			point_b = {x:evt.layerX,y:evt.layerY};
			that.drawPoints([],point_b.x,point_b.y);

			that.drawing = true;

			var onmousemove = function(evt){
				evt.preventDefault();
				if(point_b == null){
					return;
				}
				point_b_m = viewer.toMapPoint(point_b.x,point_b.y);
				point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
				that.map.restoreSnap();
				var points = [];
				points.push({
								x:point_b.x,
								y:point_b.y,
								mapX:point_b_m.x,
								mapY:point_b_m.y
							});
				points.push({x:evt.layerX,y:point_b.y,mapX:point_e.x,mapY:point_b_m.y});
				points.push({x:evt.layerX,y:evt.layerY,mapX:point_e.x,mapY:point_e.y});
				points.push({x:point_b.x,y:evt.layerY,mapX:point_b_m.x,mapY:point_e.y});
				that.drawPolygon(points,point_b_m.x,point_b_m.y);

				that.drawingEvent = function(){
					point_b_m = viewer.toMapPoint(point_b.x,point_b.y);
					point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
					var points = [];
					points.push({x:point_b.x,y:point_b.y,mapX:point_b_m.x,mapY:point_b_m.y});
					points.push({x:evt.layerX,y:point_b.y,mapX:point_e.x,mapY:point_b_m.y});
					points.push({x:evt.layerX,y:evt.layerY,mapX:point_e.x,mapY:point_e.y});
					points.push({x:point_b.x,y:evt.layerY,mapX:point_b_m.x,mapY:point_e.y});
					that.drawPolygon(points,point_b_m.x,point_b_m.y);
				};
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

				if(callback != null && callback != 'undefined'){
					callback(rect,map,layer,style,callback_u);
				}
				point_b = null;
				point_e = null;

				that.drawing = false;
			};

			mapContainer.addEventListener("mousemove", onmousemove);
			mapContainer.addEventListener("mouseup", onmouseup);

			that.onMouseMove = onmousemove;
			that.onMouseUp = onmouseup;
		};

		mapContainer.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},
	
	trackInfo : function(callback,layer,map,callback_u){
		var that = this;
		// this.map.enableDrag(false);
		var point_b = null;
		var point_e = null;
		var mapContainer = this.map.getContainer();
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
					mapContainer.removeEventListener("mouseup", onmouseup);
					return;
				}
				var point = new GeoBeans.Geometry.Point(point_b.x,point_b.y);
				if(callback != null && callback != undefined){
					console.log(point_b.x,point_b.y);
					callback(point,layer,map,callback_u);
				}
				mapContainer.removeEventListener("mouseup", onmouseup);
			}
			mapContainer.addEventListener("mouseup", onmouseup);
			
			that.onMouseUp = onmouseup;
		};
		mapContainer.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
		
	},

	cleanup : function(){
		var mapContainer = this.map.getContainer();
		mapContainer.removeEventListener("mousedown", this.onMouseDown);
		mapContainer.removeEventListener("mousemove", this.onMouseMove);
		mapContainer.removeEventListener("dblclick",  this.onMouseDClick);
		mapContainer.removeEventListener("mouseup",  this.onMouseUp);

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

		var mapContainer = this.map.getContainer();
		mapContainer.saveSnap();
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
		var viewer = this.map.getViewer();
		context.save();
		
		var r = 5;
		context.fillStyle = 'rgba(255,0,0,0.25)';
		context.strokeStyle = 'rgba(255,0,0,0.25)';
		context.lineWidth = 0.5;
		
		context.beginPath();
		var spt = viewer.toScreenPoint(x,y);
		context.arc(spt.x, spt.y, r, 0, 2 * Math.PI, false);  
		context.closePath();				
		context.fill();
		context.stroke();
		
		var len = points.length;
		for(var i=0;i<len;i++){
			context.beginPath();
			var spt = viewer.toScreenPoint(points[i].mapX,points[i].mapY);
			context.arc(spt.x, spt.y, r, 0, 2 * Math.PI, false);  
			context.closePath();				
			context.fill();
			context.stroke();
		}
		
		context.restore();
	},

	drawLine : function(points, x, y){
		var context = this.map.renderer.context;
		var viewer = this.map.getViewer();
		context.save();
		
		context.strokeStyle = 'rgba(255,0,0,0.25)';
		context.lineWidth = 3.0;
		
		context.beginPath();
		var spt = viewer.toScreenPoint(x,y);
		context.moveTo(spt.x, spt.y);
		var len = points.length;
		for(var i=len-1; i>=0; i--){
			var spt = viewer.toScreenPoint(points[i].mapX,points[i].mapY);
			context.lineTo(spt.x, spt.y);
		}
		context.stroke();
		context.restore();
	},


	drawPolygon : function(points, x, y){
		var context = this.map.renderer.context;	
		var viewer = this.map.getViewer();

		context.save();
		
		context.fillStyle = 'rgba(255,255,255,0.25)';
		context.strokeStyle = 'rgba(0,0,0,1)';
		context.lineWidth = 0.5;
		
		var len = points.length;
		context.beginPath();
		var spt = viewer.toScreenPoint(x,y);
		context.moveTo(spt.x, spt.y);
		for(i=0; i<len; i++){
			var spt = viewer.toScreenPoint(points[i].mapX,points[i].mapY);
			context.lineTo(spt.x, spt.y);
		}
		context.closePath();
		context.fill();
		context.stroke();
		context.restore();
	},

	// drawCircle : function(point_r,radius){
	// 	var context = this.map.renderer.context;
	// 	context.save();

	// 	context.strokeStyle = 'rgba(255,0,0,0.25)';
	// 	context.lineWidth = 1.0;
		
	// 	context.beginPath();
	// 	context.arc(point_r.x,point_r.y,radius,0,Math.PI*2,true);
	// 	context.strokeStyle = "#08c";
	// 	context.stroke();
	// 	context.closePath();
	// },	


	drawCircle : function(point_r,point_e){
		var viewer = this.map.getViewer();
		var point_r_s = viewer.toScreenPoint(point_r.x,point_r.y);
		var point_e_s = viewer.toScreenPoint(point_e.x,point_e.y);

		var radius = GeoBeans.Utility.getDistance(point_r_s.x,point_r_s.y,point_e_s.x,point_e_s.y);

		var context = this.map.renderer.context;
		context.save();

		context.strokeStyle = "#08c";
		context.lineWidth = 1.0;

		context.beginPath();
		context.arc(point_r_s.x,point_r_s.y,radius,0,Math.PI*2,true);
		context.stroke();
		context.closePath();

	},

	buildLineString : function(dots){
		var pt = null;
		var points = [];
		var num = dots.length;
		var viewer = this.map.getViewer();
		for(var i=0; i<num; i++){
			pt = new GeoBeans.Geometry.Point(dots[i].mapX,dots[i].mapY);
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
		var viewer = this.map.getViewer();
		for(var i=0; i<num; i++){
			pt = new GeoBeans.Geometry.Point(dots[i].mapX, dots[i].mapY);
			points.push(pt);
		}
		points.push(points[0]);
		var r = new GeoBeans.Geometry.LinearRing(points);
		return (new GeoBeans.Geometry.Polygon([r]));
	},

	// buildRect : function(point_b,point_e){
	// 	var viewer = this.map.getViewer();
	// 	point_b = viewer.toMapPoint(point_b.x,point_b.y);
	// 	point_e = viewer.toMapPoint(point_e.x,point_e.y);
	// 	var xmin = (point_b.x > point_e.x) ? point_e.x : point_b.x;
	// 	var xmax = (point_b.x > point_e.x) ? point_b.x : point_e.x;
	// 	var ymin = (point_b.y > point_e.y) ? point_e.y : point_b.y;
	// 	var ymax = (point_b.y > point_e.y) ? point_b.y : point_e.y;
	// 	var envelope = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
	// 	return envelope;
	// }

	buildRect : function(point_b,point_e){
		var xmin = (point_b.x > point_e.x) ? point_e.x : point_b.x;
		var xmax = (point_b.x > point_e.x) ? point_b.x : point_e.x;
		var ymin = (point_b.y > point_e.y) ? point_e.y : point_b.y;
		var ymax = (point_b.y > point_e.y) ? point_b.y : point_e.y;
		var envelope = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		return envelope;		
	}
});
