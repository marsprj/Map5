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
	_layer : null,
	_condition: GeoBeans.Interaction.SelectType.CLICK,
	_onMouseDown : null,

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

		this.init();
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
		that._layer.query(query, this.resultHandler);
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
 * 查询结果回调函数，处理查询到的features
 * @param  {[type]} features [description]
 * @return {[type]}          [description]
 */
GeoBeans.Interaction.Select.prototype.resultHandler = function(features){

}