/**
 * @classdesc
 * 图例控件
 * @class
 * @extends {GeoBeans.Widget}
 */
GeoBeans.Widget.LegendWidget = GeoBeans.Class(GeoBeans.Widget, {
	
	_legends  : null,

	initialize : function(map){
		GeoBeans.Widget.prototype.initialize.apply(this, arguments);		
		this.attach(map);
		this.type = GeoBeans.Widget.Type.LEGEND_WIDGET;
		this._legends = [];
		this.createContainer();
	}
});


/**
 * 创建容器
 * @private
 */
GeoBeans.Widget.LegendWidget.prototype.createContainer = function(){
	var html = "<div class='map5-legend-widget'></div>";
	var mapContainer = this._map.getContainer();
	$(mapContainer).append(html);

	this._container = $(mapContainer).find(".map5-legend-widget")[0];
};

/**
 * 添加图例
 * @public
 * @param {string} layerName 图层名称
 */
GeoBeans.Widget.LegendWidget.prototype.addLegend = function(layerName){
	var layer = this._map.getLayer(layerName);
	if(!isValid(layer)){
		return;
	}
	this._legends.push(layerName);
}

/**
 * 删除图例
 * @public
 * @param  {string} layerName 图层名称
 */
GeoBeans.Widget.LegendWidget.prototype.removeLegend = function(layerName){
	for(var i = 0; i < this._legends.length;++i){
		if(this._legends[i] == layerName){
			this._legends.splice(i,1);
		}
	}
};


/**
 * 刷新图例
 * @public
 */
GeoBeans.Widget.LegendWidget.prototype.refresh= function(){
	$(this._container).empty();
	var html = "";
	for(var i = 0; i < this._legends.length;++i){
		var layerName = this._legends[i];
		var layer = this._map.getLayer(layerName);
		if(isValid(layer) && layer.isVisible() && isDefined(layer.getLegendHtml)){
			html += layer.getLegendHtml(); 
		}
	}
	$(this._container).html(html);
}