/*
 * 删除
 */
GeoBeans.Control.TrackOverlayControl = GeoBeans.Class(GeoBeans.Control.TrackControl,{
	

	drawing : false,

	initialize : function(){
		this.type = GeoBeans.Control.Type.TRACKOVERLAY;

		// this.map.overlayLayer.registerHitEvent(this.onFeatureHit);
	},

	destory : function(){

	},

	cleanup : function(){
		this.map.canvas.removeEventListener("mousedown", this.onMouseDown);
		this.map.canvas.removeEventListener("mouseup", this.onMouseUp);

		this.map.canvas.removeEventListener("mousemove", this.onMouseMove);
		this.map.canvas.removeEventListener("dblclick",  this.onMouseDBclick);
		

		this.onmousedown = null;
		this.onMouseUp = null;
		this.onMouseDBclick = null;
		this.onMouseMove = null;
	},

	trackMarker : function(symbolizer,callback){
		this.map.overlayLayer.setHitOverlayCallback(callback);
		var that = this;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var x_o = null;
		var y_o = null;
		var tolerance = 10;

		var onmousedown = function(evt){
			evt.preventDefault();
			
			that.map.canvas.style.cursor = "default";
			that.map.enableDrag(true);
			
			if( (callback!=null) && (callback!=undefined)){
				var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
				
				var id = that.map.overlayLayer._getOverlayIDByIdentity();
				var marker = new GeoBeans.Overlay.Marker(id,pt,symbolizer);
				that.map.addOverlay(marker);
				that.map.draw();

				callback(marker);
				that.drawing = true;
			}
			// that.map.canvas.removeEventListener("mousedown", that.onMouseDown);
			// that.map.canvas.style.cursor = "default";

			var mouseup = function(evt){
				evt.preventDefault();
				that.map.canvas.removeEventListener("mouseup", that.onMouseUp);
				that.map.canvas.removeEventListener("mousedown", that.onMouseDown);
				that.map.canvas.style.cursor = "default";
				that.drawing = false;
			};
			that.onMouseUp = mouseup;
			that.map.canvas.addEventListener("mouseup", that.onMouseUp);
		};


		this.onMouseDown = onmousedown;
		this.map.canvas.addEventListener("mousedown", this.onMouseDown);
	},


	trackLine : function(symbolizer,callback){
		this.map.overlayLayer.setHitOverlayCallback(callback);
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
			if(db_flag == false){
				// var pt = that.map.transformation.toMapPoint(evt.layerX,evt.layerY);
				// points.push({x:evt.layerX,y:evt.layerY,mapX:pt.x,mapY:pt.y});
			}
			that.drawing = true;

			var onmousemove = function(evt){
				that.map.restoreSnap();
				// that.map.drawLayersAll();
				var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
				that.drawLine(points, pt.x,pt.y);
				that.drawPoints(points, pt.x,pt.y);				
				// that.drawLine(points, evt.layerX,evt.layerY);
				// that.drawPoints(points, evt.layerX,evt.layerY);
				that.drawingEvent = function(){
					var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
					that.drawLine(points, pt.x,pt.y);
					that.drawPoints(points, pt.x,pt.y);			
				}
			};

			var onmousedbclick = function(evt){
				that.map.enableDrag(true);
				// that.map.canvas.removeEventListener("mousemove", that.onMouseMove);
				// that.map.canvas.removeEventListener("dblclick",  that.onMouseDClick);
				that.map.canvas.removeEventListener("mousedown",  that.onMouseDown);
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
					var lineString = that.buildLineString(points);
					
					var id = that.map.overlayLayer._getOverlayIDByIdentity();
					var polyline = new GeoBeans.Overlay.Polyline(id,lineString,symbolizer);
					that.map.addOverlay(polyline);
					that.map.draw();			
					callback(polyline);
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
				var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
				points.push({x:evt.layerX,y:evt.layerY,mapX:pt.x,mapY:pt.y});
				// points.push({x:evt.layerX,y:evt.layerY});
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

	trackPolygon : function(symbolizer,callback){
		this.map.overlayLayer.setHitOverlayCallback(callback);
		var that = this;
		var points = [];
		var db_points = [];
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
			if(db_flag == false){
				var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
				points.push({x:evt.layerX,y:evt.layerY,mapX:pt.x,mapY:pt.y});
			}

			that.drawing = true;
			var onmousemove = function(evt){
				that.map.restoreSnap();
				var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
				if(points.length>1){
					that.drawPolygon(points, pt.x,pt.y);
					that.drawPoints(points, pt.x,pt.y);
				}
				else{
					
					that.drawLine(points, pt.x,pt.y);
					that.drawPoints(points,pt.x,pt.y);
				}
				that.drawingEvent = function(){
					var pt = that.map.getViewer().toMapPoint(evt.layerX,evt.layerY);
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
				evt.preventDefault();
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("dblclick",  onmousedbclick);
				that.map.canvas.removeEventListener("mousedown",  that.onMouseDown);
				that.map.enableDrag(true);

				if(db_points.length == points.length){
					return;
				}			
				if(db_points.length == 0){
					points.forEach(function(element, index){
						db_points.push(element);
					});
				}

				// points.push({x:evt.layerX,y:evt.layerY});
				// that.map.restoreSnap();
				if( (callback!=null) && (callback!='undefined')){
					if(points.length>=3){

						// var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
						
						// symbolizer.fill.color.set(255,0,0,1);
						// symbolizer.stroke.color.set(255,0,0,0.2);
						var id = that.map.overlayLayer._getOverlayIDByIdentity();
						var geometry_poly = that.buildPolygon(points);
						var polygon = new GeoBeans.Overlay.Polygon(id,geometry_poly,symbolizer);	
						that.map.addOverlay(polygon);
						that.map.draw();			
						callback(polygon);
						// }						
					}
				}
				db_points = [];
				points = [];
				that.drawing = false;
			}
			
			that.map.canvas.addEventListener("mousemove", onmousemove);
			that.map.canvas.addEventListener("dblclick", onmousedbclick);

			that.onMouseMove = onmousemove;
			that.onMouseDBclick = onmousedbclick;
		};
			
		this.map.canvas.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},

	drawLine : function(points, x, y){
		var context = this.map.renderer.context;
		context.save();
		
		context.strokeStyle = 'rgba(255,0,0,0.25)';
		context.lineWidth = 3.0;
		
		context.beginPath();
		var spt = this.map.getViewer().toScreenPoint(x,y);
		context.moveTo(spt.x, spt.y);
		var len = points.length;
		for(var i=len-1; i>=0; i--){
			var spt = this.map.getViewer().toScreenPoint(points[i].mapX,points[i].mapY);
			context.lineTo(spt.x, spt.y);
		}
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
		var spt = this.map.getViewer().toScreenPoint(x,y);
		context.arc(spt.x, spt.y, r, 0, 2 * Math.PI, false);  
		context.closePath();				
		context.fill();
		context.stroke();
		
		var len = points.length;
		for(var i=0;i<len;i++){
			context.beginPath();
			var spt = this.map.getViewer().toScreenPoint(points[i].mapX,points[i].mapY);
			context.arc(spt.x, spt.y, r, 0, 2 * Math.PI, false);  
			context.closePath();				
			context.fill();
			context.stroke();
		}
		
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
		var spt = this.map.getViewer().toScreenPoint(x,y);
		context.moveTo(spt.x, spt.y);
		for(i=0; i<len; i++){
			var spt = this.map.getViewer().toScreenPoint(points[i].mapX,points[i].mapY);
			context.lineTo(spt.x, spt.y);
		}
		context.closePath();
		context.fill();
		context.stroke();
		context.restore();
	},

	buildLineString : function(dots){
		var pt = null;
		var points = [];
		var num = dots.length;
		for(var i=0; i<num; i++){
			pt = new GeoBeans.Geometry.Point(dots[i].mapX,dots[i].mapY);
			points.push(pt);
		}
		return (new GeoBeans.Geometry.LineString(points));
	},

	buildPolygon : function(dots){
		var pt = null;
		var points = [];
		var num = dots.length;
		for(var i=0; i<num; i++){
			pt = new GeoBeans.Geometry.Point(dots[i].mapX, dots[i].mapY);
			points.push(pt);
		}
		points.push(points[0]);
		var r = new GeoBeans.Geometry.LinearRing(points);
		return (new GeoBeans.Geometry.Polygon([r]));
	},
});