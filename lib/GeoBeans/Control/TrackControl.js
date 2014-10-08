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
	
	trackPoint : function(callback){
		var that = this;
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmousedown = function(evt){
			that.drawPoint(evt.layerX,evt.layerY);
			//that.map.saveSnap();
			
			if( (callback!=null) && (callback!=undefined)){
				var pt = that.map.transformation.toMapPoint(evt.layerX,evt.layerY);
				callback(pt);
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
		this.map.saveSnap();
		this.map.enableDrag(false);
		this.cleanup();

		var onmousedown = function(evt){
			points.push({x:evt.layerX,y:evt.layerY});

			var onmousemove = function(evt){
				that.map.restoreSnap();
				that.drawLine(points, evt.layerX,evt.layerY);
				that.drawPoints(points, evt.layerX,evt.layerY);
			};

			var onmousedbclick = function(evt){
				that.map.canvas.removeEventListener("mousemove", onmousemove);
				that.map.canvas.removeEventListener("dblclick",  onmousedbclick);

				points.push({x:evt.layerX,y:evt.layerY});
				that.map.restoreSnap();
				if( (callback!=null) && (callback!='undefined')){
					if(points.length>=2){
						callback(that.buildLineString(points));
					}
				}
				points = [];
			}
			
			that.map.canvas.addEventListener("mousemove", onmousemove);
			that.map.canvas.addEventListener("dblclick", onmousedbclick);
		};
			
		
		this.map.canvas.addEventListener("mousedown", onmousedown);
		this.onMouseDown = onmousedown;
	},
	
	trackPolygon : function(callback){
		var that = this;
		var points = [];
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
				
			}

			
			that.map.canvas.addEventListener("mousemove", onmousemove);
			that.map.canvas.addEventListener("dblclick", onmousedbclick);
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