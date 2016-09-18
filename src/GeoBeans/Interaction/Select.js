GeoBeans.Interaction.SelectType = {
	CLICK 	 : "click",
	HOVER	 : "hover",
	LINE 	 : "line",
	POLYGON  : "polygon",
	CIRCLE 	 : "circle",
	BBOX	 : "bbox"
};

/**
 * [initialize description]
 * private
 * @param  {[type]} handler [description]
 * @param  {[type]} target) {			}}     [description]
 * @return {[type]}         [description]
 */
// GeoBeans.Interaction.SelectHandler = GeoBeans.Class({
// 	_target  : null,

// 	initialize: function (target) {
// 		this._target  = target;	
// 	},

// 	execute : function(features){
// 		this._target.setSelection(features);
// 	}
// });


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
		this._renderer = this._map.renderer;

		this.init();
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
			this.SelectByPoint();
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
		{

		}
		break;
		case GeoBeans.Interaction.SelectType.BBOX:
		{

		}
		break;
	}
}

/**
 * 点查询
 * @private
 */
GeoBeans.Interaction.Select.prototype.SelectByPoint = function(){
	var that = this;
	this._map.saveSnap();
	this._map.enableDrag(false);
	this.cleanup();

	var mapContainer = this._map.getContainer();
	var onmousedown = function(evt){
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


GeoBeans.Interaction.Select.prototype.SelectByHover = function(){
	
}

GeoBeans.Interaction.Select.prototype.SelectByLine = function(){
	
}

GeoBeans.Interaction.Select.prototype.SelectByPolygon = function(){
	
}

GeoBeans.Interaction.Select.prototype.SelectByCircle = function(){
	
}

GeoBeans.Interaction.Select.prototype.SelectByBBox = function(){
	
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
	if(!isValid(this._selection)){
		return;
	}

	if(this._selection.length==0){
		return;
	}

	//绘制选择集
	var viewer = this._map.getViewer();
	var w = viewer.getWindowWidth();
	var h = viewer.getWindowHeight();
	//this._renderer.clearRect(0,0,w,h);
	
	this._renderer.save();
	var symbolizer = this.getSymbolizer(this._selection[0].geometry.type);
	this._renderer.setSymbolizer(symbolizer);
	
	var count = this._selection.length;
	for(var i=0; i<count; i++){
		var feature = this._selection[i];
		this._renderer.draw(feature, symbolizer, this._map.getViewer());
	}
	// for (feature in this._selection){
	// 	this._renderer.draw(feature, symbolizer, this._map.getViewer());
	// }
	this._renderer.restore();
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
	if(this._show){
		this.draw();
	}
}


