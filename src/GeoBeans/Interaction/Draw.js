/**
 * @classdesc
 * Map5的绘制交互类
 * @class
 * @description 实现Map5与用户的交互功能
 * @extends {GeoBeans.Interaction}
 */
GeoBeans.Interaction.Draw = GeoBeans.Class(GeoBeans.Interaction, {

	_map : null,
	onMouseDown : null,
	onMouseMove : null,
	onMouseDClick : null,
	// 是否在绘制
	_isDrawing : false,

	/**
	 * 绘制完成时候的事件响应函数，返回绘制好的Geometry对象。
	 */
	onComplete : null,
	/**
	 * 绘制图形时，鼠标移动时，触发事件。
	 */
	onMouseMove : null,
	
	initialize : function(options){
		GeoBeans.Interaction.prototype.initialize.apply(this, arguments);

		if(isValid(options._map)){
			this._map = options._map;	
		}
		if(isValid(options.onComplete)){
			this.onComplete = options.onComplete;	
		}

		this._type = GeoBeans.Interaction.Type.DRAW;
	},
	
	destory : function(){
		GeoBeans.Interaction.prototype.destory.apply(this, arguments);
	},

	CLASS_NAME : "GeoBeans.Interaction.Draw"
});

/**
 * 绘制要素
 */
GeoBeans.Interaction.Draw.prototype.draw = function(type,symbolizer){
	switch(type){
		case "Point":
			this.drawPoint(symbolizer);
			break;
		case "LineString":
			this.drawLine(symbolizer);
			break;
		case "Polygon":
			this.drawPolygon(symbolizer);
			break;
		case "Circle":
			this.drawCircle(symbolizer);
			break;
		case "Rect":
			this.drawRect(symbolizer);
			break;
	}
}

/**
 * 绘制点
 */
GeoBeans.Interaction.Draw.prototype.drawPoint = function(symbolizer){
	var that = this;
	this._map.saveSnap();
	this.cleanup();

	var _mapContainer = this._map.getContainer();
	var onmouseup = function(evt){
		if(that._enabled){
			var control = that._map.getControl(GeoBeans.Control.Type.DRAG_MAP)
			if(control.isDragging()){
				return;
			}
			that.draw_point(evt.layerX,evt.layerY,symbolizer);
			
			if(isValid(that.onComplete)){
				var viewer = that._map.getViewer();
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY,symbolizer);

				that.onComplete(pt);
			}

			that._isDrawing = false;
			that._map.saveSnap();
			that.cleanup();
		}
	};
	var mpt = null;
	var onmousemove = function(evt){
		if(that._enabled){
			that._isDrawing = true;
			var control = that._map.getControl(GeoBeans.Control.Type.DRAG_MAP)
			if(control.draging){
				return;
			}
			that._map.clearMap();
			var pt = that._map.getViewer().toMapPoint(evt.layerX,evt.layerY);
			that.draw_point(pt.x,pt.y,symbolizer);	

			mpt = pt;

			that.drawingEvent = function(){
				that._map.restoreSnap();
				var viewer = that._map.getViewer();
				var status = viewer.getStatus();
				if(status == GeoBeans.Viewer.Status.DRAG){
					that.draw_point(mpt.x,mpt.y,symbolizer);
				}else if(status == GeoBeans.Viewer.Status.SCROLL){
					var pt = that._map.getViewer().toMapPoint(evt.layerX,evt.layerY);
					that.draw_point(pt.x,pt.y,symbolizer);
				}
			};
		}
	};
	
	// this.onMouseDown = onmousedown;
	this.onMouseUp = onmouseup;
	this.onMouseMove = onmousemove;
	
	_mapContainer.addEventListener("mousemove", onmousemove);
	_mapContainer.addEventListener("mouseup", onmouseup);
}

/**
 * 绘制线
 */
GeoBeans.Interaction.Draw.prototype.drawLine = function(symbolizer){
	var that = this;
	var points = [];
	var db_points = [];
	var addEvent_flag = false;
	this._map.saveSnap();
	this.cleanup();

	var _mapContainer = this._map.getContainer();

	var viewer = this._map.getViewer();

	var onmouseup = function(evt){
		if(points.length == 0){
			that._map.saveSnap();	
		}
		var control = that._map.getControl(GeoBeans.Control.Type.DRAG_MAP);
		if(control.isDragging()){
			return;
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
		that._isDrawing = true;

		var onmousemove = function(evt){
			that._map.clearMap();
			var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
			that.draw_line(points,pt.x,pt.y,symbolizer);
			that.draw_points(points,pt.x,pt.y,symbolizer);
			that.drawingEvent = function(){
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				that.draw_line(points,pt.x,pt.y,symbolizer);
				that.draw_points(points,pt.x,pt.y,symbolizer);
			};
		};

		var onmousedbclick = function(evt){
			_mapContainer.removeEventListener("mousemove", onmousemove);
			_mapContainer.removeEventListener("dblclick",  onmousedbclick);

			if(db_points.length == points.length){
				return;
			}			
			if(db_points.length == 0){
				points.forEach(function(element, index){
					db_points.push(element);
				});
			}

			evt.preventDefault();

			that._map.restoreSnap();

			if(isValid(that.onComplete)){
				var geometry = that.buildLineString(points);
				that.onComplete(geometry);
			}

			db_points = [];
			points = [];
			addEvent_flag = false;
			that._isDrawing = false;
			that.cleanup();
		}

		if(db_flag == false){
			// points.push({x:evt.layerX,y:evt.layerY});
			var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
			points.push({
				x : evt.layerX,
				y : evt.layerY,
				mapX : pt.x,
				mapY : pt.y});			}

		if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
			console.log('add-mousemove');
			_mapContainer.addEventListener("mousemove", onmousemove);
			_mapContainer.addEventListener("dblclick", onmousedbclick);
			addEvent_flag = true;
		}
		that.onMouseDClick = onmousedbclick;
		that.onMouseMove = onmousemove;
		
	};
	
	_mapContainer.addEventListener("mouseup", onmouseup);
	this.onMouseUp = onmouseup;	
}

/**
 * 绘制面
 */
GeoBeans.Interaction.Draw.prototype.drawPolygon = function(symbolizer){
	var that = this;
	var points = [];
	var db_points = [];
	var addEvent_flag = false;
	this._map.saveSnap();
	this.cleanup();

	var _mapContainer = this._map.getContainer();
	var viewer = this._map.getViewer();

	var onmouseup = function(evt){
		evt.preventDefault();
		if(points.length == 0){
			that._map.saveSnap();
		}

		var control = that._map.getControl(GeoBeans.Control.Type.DRAG_MAP);
		if(control.isDragging()){
			return;
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

		that._isDrawing = true;

		var onmousemove = function(evt){
			that._map.clearMap();
			var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
			if(points.length>1){
				that.draw_polygon(points,pt.x,pt.y,symbolizer);
				that.draw_points(points,pt.x,pt.y,symbolizer);
			}
			else{
				that.draw_line(points, pt.x,pt.y,symbolizer);
				that.draw_points(points,pt.x,pt.y,symbolizer);
			}
			that.drawingEvent = function(){
				var pt = viewer.toMapPoint(evt.layerX,evt.layerY);
				if(points.length>1){
					that.draw_polygon(points,pt.x,pt.y,symbolizer);
					that.draw_points(points,pt.x,pt.y,symbolizer);
				}
				else{
					that.draw_line(points, pt.x,pt.y,symbolizer);
					that.draw_points(points,pt.x,pt.y,symbolizer);
				}
			}
		};

		var onmousedbclick = function(evt){
			_mapContainer.removeEventListener("mousemove", onmousemove);
			_mapContainer.removeEventListener("dblclick",  onmousedbclick);

			if(db_points.length == points.length){
				return;
			}			
			if(db_points.length == 0){
				points.forEach(function(element, index){
					db_points.push(element);
				});
			}

			if(isValid(onComplete)){
				if(points.length>=3){
					var geometry = that.buildPolygon(points);
					that.onComplete(geometry);
				}
			}

			db_points = [];
			points = [];
			that._isDrawing = false;
			addEvent_flag = false;
			that.cleanup();
		}
		if(!addEvent_flag){ //只有第一次mousedown的时候才会触发注册事件
			_mapContainer.addEventListener("mousemove", onmousemove);
			_mapContainer.addEventListener("dblclick", onmousedbclick);
			addEvent_flag = true;
		}
		that.onMouseDClick = onmousedbclick;
		that.onMouseMove = onmousemove;
	};
		
	
	_mapContainer.addEventListener("mouseup", onmouseup);
	this.onMouseUp = onmouseup;	
}

/**
 * 绘制圆
 * @public
 */
GeoBeans.Interaction.Draw.prototype.drawCircle = function(symbolizer){
	var that = this;

	var point_r = null;
	var point_e = null;
	var radius = 0;
	this._map.saveSnap();
	this._map.enableDrag(false);
	this.cleanup();

	var viewer = this._map.getViewer();
	var _mapContainer = this._map.getContainer();

	var onmousedown = function(evt){
		that._map.saveSnap();

		evt.preventDefault();
		that._map.enableDrag(false);
		point_r = viewer.toMapPoint(evt.layerX,evt.layerY);
		that.draw_points([],point_r.x,point_r.y);
		that.drawing = true;

		var onmousemove = function(evt){
			if(point_r == null){
				return;
			}
			evt.preventDefault();
			point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
			that._map.restoreSnap();
			that.draw_points([],point_e.x,point_e.y,symbolizer);
			that.draw_circle(point_r,point_e,symbolizer);
			that.drawingEvent = function(){
				console.log(point_r);
				console.log(point_e);
				that.draw_circle(point_r,point_e);
			};
		};

		var onmouseup = function(evt){
			evt.preventDefault();
			if(point_e == null){
				return;
			}
			_mapContainer.removeEventListener("mousemove", onmousemove);
			_mapContainer.removeEventListener("mouseup", onmouseup);
			that._map.restoreSnap();
			// that._map.enableDrag(true);

			radius = GeoBeans.Utility.getDistance(point_e.x,point_e.y,point_r.x,point_r.y);

			if(isValid(that.onComplete)){
				var circle = new GeoBeans.Geometry.Circle(point_r,radius);
				that.onComplete(circle);
			}

			that.drawing = false;
			point_r = null;
			point_e = null;
		};

		_mapContainer.addEventListener("mousemove", onmousemove);
		_mapContainer.addEventListener("mouseup", onmouseup);

		that.onMouseMove = onmousemove;
		that.onMouseUp = onmouseup;
	};	

	_mapContainer.addEventListener("mousedown", onmousedown);
	this.onMouseDown = onmousedown;
}

GeoBeans.Interaction.Draw.prototype.drawRect = function(symbolizer){
	var that = this;

	this._map.saveSnap();
	this._map.enableDrag(false);
	this.cleanup();

	var point_b = null;
	var point_e = null;
	var rect = null;
	var mapContainer = this._map.getContainer();
	var viewer = this._map.getViewer();


	var onmousedown = function(evt){
		that._map.saveSnap();
		evt.preventDefault();
		point_b = {x:evt.layerX,y:evt.layerY};
		that.draw_points([],point_b.x,point_b.y,symbolizer);

		that.drawing = true;

		var onmousemove = function(evt){
			evt.preventDefault();
			if(point_b == null){
				return;
			}
			point_b_m = viewer.toMapPoint(point_b.x,point_b.y);
			point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
			that._map.restoreSnap();
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
			that.draw_polygon(points,point_b_m.x,point_b_m.y,symbolizer);

			that.drawingEvent = function(){
				point_b_m = viewer.toMapPoint(point_b.x,point_b.y);
				point_e = viewer.toMapPoint(evt.layerX,evt.layerY);
				var points = [];
				points.push({x:point_b.x,y:point_b.y,mapX:point_b_m.x,mapY:point_b_m.y});
				points.push({x:evt.layerX,y:point_b.y,mapX:point_e.x,mapY:point_b_m.y});
				points.push({x:evt.layerX,y:evt.layerY,mapX:point_e.x,mapY:point_e.y});
				points.push({x:point_b.x,y:evt.layerY,mapX:point_b_m.x,mapY:point_e.y});
				that.draw_polygon(points,point_b_m.x,point_b_m.y,symbolizer);
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
			that._map.restoreSnap();
			// that._map.enableDrag(true);
			if(Math.abs(dis_x) < 0.0001 && Math.abs(dis_y) < 0.0001){
				return;
			}
			var rect = that.buildRect(point_b,point_e);

			if(isValid(that.onComplete)){
				that.onComplete(rect);
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
}


GeoBeans.Interaction.Draw.prototype.cleanup = function(){
	var mapContainer = this._map.getContainer();
	mapContainer.removeEventListener("mousedown", this.onMouseDown);
	mapContainer.removeEventListener("mousemove", this.onMouseMove);
	mapContainer.removeEventListener("dblclick",  this.onMouseDClick);
	mapContainer.removeEventListener("mouseup",  this.onMouseUp);

	this.onMouseDown = null;
	this.onMouseMove = null;
	this.onMouseDClick = null;
	this.onMouseUp = null;

	this.drawingEvent = null;

	// this._map.restoreSnap();
}

/**
 * 在地图上绘制点图元
 * @private
 */
GeoBeans.Interaction.Draw.prototype.draw_point = function(x, y,symbolizer){
	if(!isValid(symbolizer)){
		symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		symbolizer.fill.color.set(255,0,0,0.25);
		symbolizer.stroke.color.set(0,0,0,0.75);
		symbolizer.stroke.lineWidth = 1.0;
	}

	var renderer = this._map.renderer;
	renderer.setSymbolizer(symbolizer);

	var viewer = this._map.getViewer();
	// var pt = viewer.toMapPoint(x,y);
	var pt = new GeoBeans.Geometry.Point(x,y);
	renderer.drawPoint(pt,symbolizer,viewer);

}

/**
 * 在地图上绘制多点
 * @private
 */
GeoBeans.Interaction.Draw.prototype.draw_points = function(points, x, y,symbolizer){
	var lineColor = null;
	if(isValid(symbolizer)){
		var stroke = symbolizer.stroke;
		if(isValid(stroke)){
			lineColor = stroke.color;
		}
	}
	var pointSymbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	if(isValid(lineColor)){
		pointSymbolizer.fill.color = lineColor.clone();
	}else{
		pointSymbolizer.fill.color.set(255,0,0,0.75);
	}
	pointSymbolizer.stroke.color.set(255,255,255,0.75);
	pointSymbolizer.stroke.lineWidth = 1.0;
	

	var renderer = this._map.renderer;
	var context = renderer.context;
	var viewer = this._map.getViewer();
	context.save();
	renderer.setSymbolizer(pointSymbolizer);

	var r = 5;
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
}

/**
 * 在地图上绘制线
 * @private
 */
GeoBeans.Interaction.Draw.prototype.draw_line = function(points, x, y, symbolizer){
	var renderer = this._map.renderer;
	if(!isValid(symbolizer)){
		symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		symbolizer.stroke.color.set(255,0,0,0.75);
		symbolizer.stroke.lineWidth = 3.0;
	}

	var context = renderer.context;
	var viewer = this._map.getViewer();
	context.save();
	
	renderer.setSymbolizer(symbolizer);
	
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

}

/**
 * 在地图上绘制面
 * @private
 */
GeoBeans.Interaction.Draw.prototype.draw_polygon = function(points, x, y,symbolizer){
	if(!isValid(symbolizer)){
		symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		symbolizer.stroke.color.set(0,0,0,1);
		symbolizer.stroke.lineWidth = 0.5;
		symbolizer.fill.color.set(255,255,255,0.25);
	}

	var renderer = this._map.renderer;
	var context = renderer.context;	
	var viewer = this._map.getViewer();


	context.save();
	renderer.setSymbolizer(symbolizer);

	var len = points.length;
	context.beginPath();
	var spt = viewer.toScreenPoint(x,y);
	context.moveTo(spt.x, spt.y);
	for(var i=0; i<len; i++){
		var spt = viewer.toScreenPoint(points[i].mapX,points[i].mapY);
		context.lineTo(spt.x, spt.y);
	}
	context.closePath();
	context.fill();
	context.stroke();
	context.restore();
}


/**
 * 在地图上绘制圆
 * @private
 */
GeoBeans.Interaction.Draw.prototype.draw_circle = function(point_r,point_e,symbolizer){
	if(!isValid(symbolizer)){
		symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		symbolizer.stroke.color.set(0,0,0,1);
		symbolizer.stroke.lineWidth = 0.5;
		symbolizer.fill.color.set(255,255,255,0.25);
	}

	var renderer = this._map.renderer;
	var context = renderer.context;
	var viewer = this._map.getViewer();
	var point_r_s = viewer.toScreenPoint(point_r.x,point_r.y);
	var point_e_s = viewer.toScreenPoint(point_e.x,point_e.y);

	var radius = GeoBeans.Utility.getDistance(point_r_s.x,point_r_s.y,point_e_s.x,point_e_s.y);

	renderer.setSymbolizer(symbolizer);

	context.save();
	context.beginPath();
	context.arc(point_r_s.x,point_r_s.y,radius,0,Math.PI*2,true);
	context.stroke();
	context.fill();
	context.closePath();
}


/**
 * 组合线
 * @private
 */
GeoBeans.Interaction.Draw.prototype.buildLineString = function(dots){
	var pt = null;
	var points = [];
	var num = dots.length;
	var viewer = this._map.getViewer();
	for(var i=0; i<num; i++){
		pt = new GeoBeans.Geometry.Point(dots[i].mapX,dots[i].mapY);
		points.push(pt);
	}
	return (new GeoBeans.Geometry.LineString(points));
}

/**
 * 组合面
 * @private
 */
GeoBeans.Interaction.Draw.prototype.buildPolygon = function(dots){
	var pt = null;
	var points = [];
	var num = dots.length;
	var viewer = this._map.getViewer();
	for(var i=0; i<num; i++){
		pt = new GeoBeans.Geometry.Point(dots[i].mapX, dots[i].mapY);
		points.push(pt);
	}
	points.push(points[0]);
	var r = new GeoBeans.Geometry.LinearRing(points);
	return (new GeoBeans.Geometry.Polygon([r]));
}

/**
 * 组合矩形
 * @private
 */
GeoBeans.Interaction.Draw.prototype.buildRect = function(point_b,point_e){
	var xmin = (point_b.x > point_e.x) ? point_e.x : point_b.x;
	var xmax = (point_b.x > point_e.x) ? point_b.x : point_e.x;
	var ymin = (point_b.y > point_e.y) ? point_e.y : point_b.y;
	var ymax = (point_b.y > point_e.y) ? point_b.y : point_e.y;
	var envelope = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
	return envelope;		
}


/**
 * 判断是否在进行绘制
 * @return {Boolean} 是否正在绘制
 */
GeoBeans.Interaction.Draw.prototype.isDrawing = function(){
	return this._isDrawing;
}


/**
 * 设置是否可用
 * @public
 * @param  {boolean} f 
 */
GeoBeans.Interaction.Draw.prototype.enable = function(f){
	GeoBeans.Interaction.prototype.enable.apply(this,arguments);
	if(this._enabled){
		this._map.saveMapSnap();
	}
};