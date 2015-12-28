GeoBeans.Control.TrackOverlayControl = GeoBeans.Class(GeoBeans.Control.TrackControl,{
	
	initialize : function(){
		this.type = GeoBeans.Control.Type.TRACKOVERLAY;//"TrackBufferControl";

		// this.map.overlayLayer.registerHitEvent(this.onFeatureHit);
	},

	trackMarker : function(callback){
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
				var pt = that.map.transformation.toMapPoint(evt.layerX,evt.layerY);
				
				var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				symbolizer.icon_url = "../images/marker.png";
				symbolizer.icon_offset_x = 0;
				symbolizer.icon_offset_y = 0;
				var marker = new GeoBeans.Overlay.Marker("maker",pt,symbolizer);
				that.map.addOverlay(marker);
				that.map.draw();

				callback(marker);
			}
			that.map.canvas.removeEventListener("mousedown", that.onMouseDown);
			that.map.canvas.style.cursor = "default";
		};
		
		var onmousemove = function(evt){
			evt.preventDefault();
		};
		
		this.onMouseDown = onmousedown;
		this.onMouseMove = onmousemove;
		
		this.map.canvas.addEventListener("mousemove", onmousemove);
		this.map.canvas.addEventListener("mousedown", onmousedown);
	},


	trackLine : function(callback){
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
				points.push({x:evt.layerX,y:evt.layerY});
			}

			var onmousemove = function(evt){
				that.map.restoreSnap();
				that.drawLine(points, evt.layerX,evt.layerY);
				that.drawPoints(points, evt.layerX,evt.layerY);
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
					var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
					symbolizer.stroke.color.set(255,0,0,1);
					symbolizer.width = 3;
					
					var polyline = new GeoBeans.Overlay.Polyline("polyline",lineString,symbolizer);
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
				points.push({x:evt.layerX,y:evt.layerY});
			}

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

						var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
						
						symbolizer.fill.color.set(255,0,0,1);
						symbolizer.stroke.color.set(255,0,0,0.2);

						var geometry_poly = that.buildPolygon(points);
						var polygon = new GeoBeans.Overlay.Polygon("polygon",
								geometry_poly,symbolizer);	
						that.map.addOverlay(polygon);
						that.map.draw();			
						callback(polygon);
						// }						
					}
				}
				db_points = [];
				points = [];
			}
			
			that.map.canvas.addEventListener("mousemove", onmousemove);
			that.map.canvas.addEventListener("dblclick", onmousedbclick);

			that.onMouseMove = onmousemove;
			that.onMouseDBclick = onmousedbclick;
		};
			
		this.map.canvas.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	}

		
});