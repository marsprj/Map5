GeoBeans.Control.TrackControl.TrackTransactionControl = 
			GeoBeans.Class(GeoBeans.Control.TrackControl,{
	initialize : function(){
		this.type = GeoBeans.Control.Type.TRACKTRANSACTION;
	},	

	trackPoint : function(callback,userCallback,layer){
		var that = this;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmousedown = function(evt){
			that.drawPoint(evt.layerX,evt.layerY);
			that.map.enableDrag(true);
			
			if( (callback!=null) && (callback!=undefined)){
				var pt = that.map.transformation.toMapPoint(evt.layerX,evt.layerY);
				callback(pt,userCallback,layer);
			}
			that.map.canvas.removeEventListener("mousemove", that.onMouseMove);
			that.map.canvas.removeEventListener("mousedown", that.onMouseDown);
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

	trackLine : function(callback,userCallback,layer,multiFlag){
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
			console.log('mouseclick');
			console.log(points);

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

				evt.preventDefault();
				console.log('mousedbclick');
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("dblclick",  onmousedbclick);

				
				if( (callback!=null) && (callback!='undefined')){
					if(multiFlag){
						var lines = [that.buildLineString(points)];
						var mulitLineString = new GeoBeans.Geometry.MultiLineString(lines);
						callback(mulitLineString,userCallback,layer);
					}else{
						callback(that.buildLineString(points),userCallback,layer);
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
		
		this.map.canvas.addEventListener("click", onmouseclick);
		this.onMouseClick = onmouseclick;
	},

	trackPolygon : function(callback,userCallback,layer,multiFlag){
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

				if( (callback!=null) && (callback!='undefined')){
					if(points.length>=3){
						if(multiFlag){
							var polygons = [that.buildPolygon(points)];
							var multiPolygon = new GeoBeans.Geometry.MultiPolygon(polygons);
							callback(multiPolygon,userCallback,layer);
						}else{
							callback(that.buildPolygon(points),userCallback,layer);
						}						
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

})