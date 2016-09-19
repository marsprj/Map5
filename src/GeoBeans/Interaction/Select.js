GeoBeans.Interaction.SelectType = {
	CLICK 	 : "click",
	HOVER	 : "hover",
	LINE 	 : "line",
	POLYGON  : "polygon",
	CIRCLE 	 : "circle",
	BBOX	 : "bbox"
};

/**
 * Map5的查询交互类
 * @class
 * @description 实现Map5与用户的交互功能
 */
GeoBeans.Interaction.Select = GeoBeans.Class(GeoBeans.Interaction, {
	_map	: null,
	_layer	: null,
	_condition: GeoBeans.Interaction.SelectType.CLICK,
	_onMouseDown : null,
	_selection	 : [],
	_onchange    : null,
	_show		 : true,
	_symbolizer	 : null,
	_symbolizers : null,
	_renderer	 : null,
	_canvas		 : null,

	initialize : function(options){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);

		if(isValid(options.map)){
			this._map = options.map;	
		}
		if(isValid(options.layer)){
			this._layer = options.layer;	
		}
		if(isValid(options.condition)){
			this._condition = options.condition;	
		}

		// ????? 暂时使用map的render，这种用法不对，需要修改。
		//this._renderer = this._map.renderer;

		this.init();
		this.initRenderer();
		this.loadSymbols();
	},
	
	destory : function(){
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
	},

	CLASS_NAME : "GeoBeans.Interaction.Select"
});


GeoBeans.Interaction.Select.prototype.setCondition = function(condition){
	this._condition = condition;
}

GeoBeans.Interaction.Select.prototype.getCondition = function(){
	return this._condition;
}

GeoBeans.Interaction.Select.prototype.getSelection = function(){
	return this._selection;
}

GeoBeans.Interaction.Select.prototype.init = function(){
	switch(this._condition){
		case GeoBeans.Interaction.SelectType.CLICK:
			this.selectByPoint();
			break;
		case GeoBeans.Interaction.SelectType.HOVER:
		{

		}
		break;
		case GeoBeans.Interaction.SelectType.LINE:		
		{

		}
		break;
		case GeoBeans.Interaction.SelectType.POLYGON:
		{

		}
		break;
		case GeoBeans.Interaction.SelectType.CIRCLE:
			this.selectByCircle();
			break;
		case GeoBeans.Interaction.SelectType.BBOX:
			this.selectByBBox();
			break;
	}
}

/**
 * 初始化renderer
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Select.prototype.initRenderer = function(){
	this._canvas = $("<canvas>")
				.attr("width", 800)
			    .attr("height", 600)[0];
	this._renderer = new GeoBeans.Renderer(this._canvas);
}

/**
 * 点查询
 * @private
 */
GeoBeans.Interaction.Select.prototype.selectByPoint = function(){
	var that = this;
	//this._map.saveSnap();
	//this._map.enableDrag(false);
	this.cleanup();

	var mapContainer = this._map.getContainer();
	var onmousedown = function(evt){
		//if(that._enabled){
		var viewer = that._map.getViewer();
		var pt = viewer.toMapPoint(evt.layerX,evt.layerY);

		var query = that.createSpatialQuery(pt);
		//查询结果的回调函数类，接口实现GeoBeans.Handler。
		var handler = {
			target : that,
			execute : function(features){
				this.target.setSelection(features);
			}
		}
		that._layer.query(query, handler);
	};
	
	this._onMouseDown = onmousedown;
	
	mapContainer.addEventListener("mousedown", onmousedown);
}


GeoBeans.Interaction.Select.prototype.selectByHover = function(){
	
}

GeoBeans.Interaction.Select.prototype.selectByLine = function(){
	
}

GeoBeans.Interaction.Select.prototype.selectByPolygon = function(){
	
}

GeoBeans.Interaction.Select.prototype.selectByCircle = function(){
	var that = this;

	var point_r = null;
	var point_e = null;
	var radius = 0;
	this._map.saveSnap();
	this._map.enableDrag(false);
	this.cleanup();

	var viewer = this._map.getViewer();
	var mapContainer = this._map.getContainer();

	var onmousedown = function(evt){
		evt.preventDefault();
		that._map.enableDrag(false);
		point_r = {x:evt.layerX,y:evt.layerY};
		that.drawPoints([],evt.layerX,evt.layerY);

		var onmousemove = function(evt){
			evt.preventDefault();
			point_e = {x:evt.layerX,y:evt.layerY};
			that._map.restoreSnap();
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
			mapContainer.removeEventListener("mousemove", onmousemove);
			mapContainer.removeEventListener("mouseup", onmouseup);
			that._map.restoreSnap();
			that._map.enableDrag(true);

			var point_map_r = viewer.toMapPoint(point_r.x,point_r.y);
			var point_map_e = viewer.toMapPoint(point_e.x,point_e.y);
			var radius_map = Math.sqrt((point_map_e.x - point_map_r.x)*(point_map_e.x - point_map_r.x)
						+ (point_map_e.y - point_map_r.y)*(point_map_e.y - point_map_r.y));


			var query = that.createDistanceBufferFilterQuery(point_map_r, radius_map);
			//查询结果的回调函数类，接口实现GeoBeans.Handler。
			var handler = {
				target : that,
				execute : function(features){
					this.target.setSelection(features);
				}
			}
			that._layer.query(query, handler);

			// if( (callback!=null) && (callback!='undefined')){
			// 	// trackBufferCircleCallback(layer,radius_map,point_map_r,callback);
			// 	var circle = new GeoBeans.Geometry.Circle(point_map_r,radius_map);

			// 	callback(circle);
			// }
		};

		mapContainer.addEventListener("mousemove", onmousemove);
		mapContainer.addEventListener("mouseup", onmouseup);

		that.onMouseMove = onmousemove;
		that.onMouseUp = onmouseup;
	};	

	mapContainer.addEventListener("mousedown", onmousedown);
	this.onMouseDown = onmousedown;
}

GeoBeans.Interaction.Select.prototype.selectByBBox = function(){
	var that = this;

	this._map.saveSnap();
	this._map.enableDrag(false);
	this.cleanup();

	var point_b = null;
	var point_e = null;
	var rect = null;
	var mapContainer = this._map.getContainer();
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
			that._map.restoreSnap();
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

			
			mapContainer.removeEventListener("mousemove", onmousemove);
			mapContainer.removeEventListener("mouseup", onmouseup);
			that._map.restoreSnap();
			// that._map.enableDrag(true);
			if(Math.abs(dis_x) < 0.0001 && Math.abs(dis_y) < 0.0001){
				return;
			}
			var rect = that.buildRect(point_b,point_e);

			var query = that.createBBoxQuery(rect);
			//查询结果的回调函数类，接口实现GeoBeans.Handler。
			var handler = {
				target : that,
				execute : function(features){
					this.target.setSelection(features);
				}
			}
			that._layer.query(query, handler);

			point_b = null;
			point_e = null;
		};

		mapContainer.addEventListener("mousemove", onmousemove);
		mapContainer.addEventListener("mouseup", onmouseup);

		that.onMouseMove = onmousemove;
		that.onMouseUp = onmouseup;
	};

	mapContainer.addEventListener("mousedown", onmousedown);
	this.onMouseDown = onmousedown;
}

GeoBeans.Interaction.Select.prototype.cleanup = function(){
	var mapContainer = this._map.getContainer();
	mapContainer.removeEventListener("mousedown", this.onMouseDown);

	this.onMouseDown = null;
}

/**
 * 设置Select的onchange事件响应函数，当选择集发生变化时候，触发onchange事件，通知调用者选择集发生变化。<br>
 * onchange函数包含一个参数，该参数是一个features集合([])，即选择级。<br>
 * function onchange(features){<br>
 * }<br>
 * @public
 * @param  {[type]} handler [description]
 * @return {[type]}         [description]
 */
GeoBeans.Interaction.Select.prototype.onchange = function(handler){
	this._onchange = handler;
}

/**
 * 创建Spatial查询Filter
 * @private
 * @param  {[type]} point [description]
 * @return {[type]}       [description]
 */
GeoBeans.Interaction.Select.prototype.createSpatialQuery = function(g){
	// Filter
	var filter = new GeoBeans.SpatialFilter();
	filter.geometry = g;
	filter.operator = GeoBeans.SpatialFilter.OperatorType.SpOprIntersects;
	var featureType = this._layer.getFeatureType();
	filter.propName = featureType.geomFieldName;

	var query = new GeoBeans.Query({
		"typeName"	: featureType.getName(),
		"filter"	: filter
	});

	return query;
}

/**
 * 创建BBox查询Filter
 * @private
 * @param  {[type]} rect [description]
 * @return {[type]}      [description]
 */
GeoBeans.Interaction.Select.prototype.createBBoxQuery = function(rect){
	var featureType = this._layer.getFeatureType();
	var filter = new GeoBeans.BBoxFilter(
						featureType.geomFieldName,
						rect);

	var query = new GeoBeans.Query({
		"typeName"	: featureType.getName(),
		"filter"	: filter
	});

	return query;
}

GeoBeans.Interaction.Select.prototype.createDistanceBufferFilterQuery = function(g, r){
	var featureType = this._layer.getFeatureType();
	var filter = new GeoBeans.DistanceBufferFilter(
						featureType.geomFieldName,
						g,
						r);
	
	var query = new GeoBeans.Query({
		"typeName"	: featureType.getName(),
		"filter"	: filter
	});

	return query;
}

/**
 * 设置是否在地图上显示选择集
 * @public
 * @param  {[type]} f [description]
 * @return {[type]}   [description]
 */
GeoBeans.Interaction.Select.prototype.show = function(f){
	this._show = f;
}

/**
 * 返回是否在地图上显示选择集
 * @public
 * @return {Boolean} [description]
 */
GeoBeans.Interaction.Select.prototype.isShow = function(){
	return this._show;
}

/**
 * 绘制选择集
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Select.prototype.draw = function(){

	//绘制选择集
	var viewer = this._map.getViewer();
	var w = viewer.getWindowWidth();
	var h= viewer.getWindowHeight();
	this._canvas.width = w;
	this._canvas.height= h;
	this._renderer.clearRect(0,0,w,h);
	
	if(!this._show){
		return;
	}

	if(!isValid(this._selection)){
		return;
	}

	if(this._selection.length==0){
		return;
	}


	
	var symbolizer = this.getSymbolizer(this._selection[0].geometry.type);
	this._renderer.setSymbolizer(symbolizer);
	
	var count = this._selection.length;
	for(var i=0; i<count; i++){
		var feature = this._selection[i];
		this._renderer.draw(feature, symbolizer, viewer);
	}
}

/**
 * [loadSymbols description]
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Interaction.Select.prototype.loadSymbols = function(){

	var point = new GeoBeans.Symbolizer.PointSymbolizer();
	point.size = 6;
	point.fill.color.set(255, 0, 0,0.6);
	point.stroke.color.set(0,255, 0,0.6);

	var line  = new GeoBeans.Symbolizer.LineSymbolizer();
	line.stroke.color.set(0,0,255,0.6);
	line.stroke.width = 3;

	var polygon = new GeoBeans.Symbolizer.PolygonSymbolizer();
	polygon.fill.color.set(0, 255, 0,0.6);
	polygon.stroke.color.set(255, 0, 0,0.6);
	polygon.stroke.width = 1;;

	// this._symbolizers = {
	// 	GeoBeans.Geometry.Type.POINT 		: point,
	// 	GeoBeans.Geometry.Type.LINESTRING	: line,
	// 	GeoBeans.Geometry.Type.POLYGON		: polygon
	// };
	this._symbolizers = {
		"Point" 		: point,
		"LineString"	: line,
		"Polygon"		: polygon,
		"MultiPoint" 		: point,
		"MultiLineString"	: line,
		"MultiPolygon"		: polygon
	};
}

/**
 * [getSymbolizer description]
 * @private
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
GeoBeans.Interaction.Select.prototype.getSymbolizer = function(type){
	return this._symbolizers[type];
}

/**
 * 查询结果回调函数，处理查询到的features。然后将features，设置为选择集合_selections，用于高亮显示。
 * @deprecated [description]
 * @private
 * @param  {[type]} features [description]
 * @return {[type]}          [description]
 */
GeoBeans.Interaction.Select.prototype.setSelection = function(features){
	this._selection = features;
	if(isValid(this._onchange)){
		this._onchange(this._selection);
	}
	//this.draw();
	this._map.refresh();
}


GeoBeans.Interaction.Select.prototype.drawPoints = function(points, x, y){
	var context = this._map.renderer.context;
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
}

GeoBeans.Interaction.Select.prototype.drawPolygon = function(points, x, y){
	var context = this._map.renderer.context;	
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
}

GeoBeans.Interaction.Select.prototype.drawCircle = function(point_r,radius){
	var context = this._map.renderer.context;
	context.save();

	context.strokeStyle = 'rgba(255,0,0,0.25)';
	context.lineWidth = 1.0;
	
	context.beginPath();
	context.arc(point_r.x,point_r.y,radius,0,Math.PI*2,true);
	context.strokeStyle = "#08c";
	context.stroke();
	context.closePath();

}

GeoBeans.Interaction.Select.prototype.buildRect = function(point_b,point_e){
	var viewer = this._map.getViewer();
	point_b = viewer.toMapPoint(point_b.x,point_b.y);
	point_e = viewer.toMapPoint(point_e.x,point_e.y);
	var xmin = (point_b.x > point_e.x) ? point_e.x : point_b.x;
	var xmax = (point_b.x > point_e.x) ? point_b.x : point_e.x;
	var ymin = (point_b.y > point_e.y) ? point_e.y : point_b.y;
	var ymax = (point_b.y > point_e.y) ? point_b.y : point_e.y;
	var envelope = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
	return envelope;
}