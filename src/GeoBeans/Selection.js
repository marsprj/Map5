/**
 * @classdesc
 * Feature选择集
 * @class
 */
GeoBeans.Selection = GeoBeans.Class({

	_map : null,
	_features : [],
	_symbolizer	 : null,
	_symbolizers : null,
	_onchange    : null,
	_show		 : true,
	_canvas		 : null,

	initialize: function(map){
		this._map = map;
		this.initRenderer();
		this.loadSymbols();
	},
	
	destroy : function(){
	}
});

/**
 * 设置features集合，Selection已有features集合被清空。
 * 并触发onChange事件
 * @public
 * @param {Array<GeoBeans.Feature>} features features集合
 */
GeoBeans.Selection.prototype.setFeatures = function(features){
	if(isValid(features)){
		this._features = features;

		if(isValid(this._onchange)){
			this._onchange(features);
		}

		this._map.refresh();
	}
}

/**
 * 增加新的feature。
 * 并触发onChange事件。
 * @public
 * @param {Array<GeoBeans.Feature>} features features集合
 */
GeoBeans.Selection.prototype.addFeatures = function(features){
	if(isValid(features)){
		var that = this;
		features.forEach(function(f){
			that._features.push(feature);
		});

		if(isValid(this._onchange)){
			this._onchange(features);
		}

		this._map.refresh();
	}
}

/**
 * 增加新的features。
 * 并触发onChange事件。
 * @public
 * @param {GeoBeans.Feature} features features集合
 */
GeoBeans.Selection.prototype.addFeature = function(feature){
	if(isValid(feature)){
		this._features.push(feature);

		if(isValid(this._onchange)){
			this._onchange([feature]);
		}

		this._map.refresh();
	}
}

/**
 * 设置选择集的样式
 * @public
 * @param {GeoBeans.Style.Symbolizer} symbolizer 选择集的样式
 */
GeoBeans.Selection.prototype.setSymbolizer = function(symbolizer){
	this._symbolizer = symbolizer;
}

/**
 * 重制选择集。
 * @public
 */
GeoBeans.Selection.prototype.refresh = function(){
	this.draw();
}


/**
 * 设置是否在地图上显示选择集
 * @public
 * @param  {[type]} f [description]
 * @return {[type]}   [description]
 */
GeoBeans.Selection.prototype.show = function(f){
	this._show = f;
}

/**
 * 返回是否在地图上显示选择集
 * @public
 * @return {Boolean} [description]
 */
GeoBeans.Selection.prototype.isShow = function(){
	return this._show;
}

/**
 * 设置Selection的onchange事件响应函数，当选择集发生变化时候，触发onchange事件，通知调用者选择集发生变化。<br>
 * onchange函数包含一个参数，该参数是一个features集合([])，即选择级。<br>
 * function onchange(features){<br>
 * }<br>
 * @public
 * @param  {[type]} handler [description]
 * @return {[type]}         [description]
 */
GeoBeans.Selection.prototype.onchange = function(handler){
	this._onchange = handler;
}

/**
 * [loadSymbols description]
 * @private
 * @return {[type]} [description]
 */
GeoBeans.Selection.prototype.loadSymbols = function(){

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
 * 绘制选择集
 * @private
 */
GeoBeans.Selection.prototype.draw = function(){

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

	if(this._features.length==0){
		return;
	}
	
	var symbolizer = this.getSymbolizer(this._features[0].geometry.type);
	this._renderer.setSymbolizer(symbolizer);
	
	var count = this._features.length;
	for(var i=0; i<count; i++){
		var feature = this._features[i];
		this._renderer.draw(feature, symbolizer, viewer);
	}
}

/**
 * 初始化renderer
 * @private
 */
GeoBeans.Selection.prototype.initRenderer = function(){
	this._canvas = $("<canvas>")
				.attr("width", 800)
			    .attr("height", 600)[0];
	this._renderer = new GeoBeans.Renderer(this._canvas);
}

/**
 * [getSymbolizer description]
 * @private
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
GeoBeans.Selection.prototype.getSymbolizer = function(type){
	return this._symbolizers[type];
}