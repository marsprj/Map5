GeoBeans.Layer.SymbolChartLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	
	field : null,

	color : null,

	opacity : null,

	border : null,

	borderOpacity : null,

	borderWidth : null,

	maxSize : null,

	byLevel : null,

	level : null,

	// 图例中最大的圈大小
	maxSymbolRadius : 30,

	// 图例间隙
	legendPadding : 4,


	CLASS_NAME : "GeoBeans.Layer.SymbolChartLayer",


	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		if(isValid(options)){
			if(isValid(options.name)){
				this.name = options.name;
			}
			if(isValid(options.source)){
				this._source = options.source;
			}

			if(isValid(options.showGeometry)){
				this.showGeometry = options.showGeometry;
			}else{
				this.showGeometry = false;
			}

			if(isValid(options.style)){
				this.style = options.style;
			}

			if(isValid(options.field)){
				this.field = options.field;
			}

			if(isValid(options.color)){
				this.color = options.color;
			}

			if(isValid(options.opacity)){
				this.opacity = options.opacity;
			}else{
				this.opacity = 1;
			}

			if(isValid(options.border)){
				this.border = options.border;
			}

			if(isValid(options.borderOpacity)){
				this.borderOpacity = options.borderOpacity;
			}

			if(isValid(options.borderWidth)){
				this.borderWidth = options.borderWidth;
			}

			if(isValid(options.maxSize)){
				this.maxSize = options.maxSize;
			}

			if(isValid(options.byLevel)){
				this.byLevel = options.byLevel;
			}	
			
			if(isValid(options.level)){
				this.level = options.level;
			}	
		}
		
	},

	destroy : function(){
		var legendWidget = this.map.getWidget(GeoBeans.Widget.Type.LEGEND_WIDGET);
		if(isValid(legendWidget)){
			legendWidget.removeLegend(this.name);
		}
		GeoBeans.Layer.FeatureLayer.prototype.destroy.apply(this, arguments);
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);	

		var legendWidget = this.map.getWidget(GeoBeans.Widget.Type.LEGEND_WIDGET);
		if(isValid(legendWidget)){
			legendWidget.addLegend(this.name);
		}
	},	
});

/**
 * 绘制
 * @public
 */
GeoBeans.Layer.SymbolChartLayer.prototype.draw = function(){
	if(!this.isVisible()){
		this.clear();
		return;
	}

	var success = {
		target : this,
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			var layer = this.target;
			layer.clear();


			if(layer.showGeometry){
				layer.drawLayerFeatures(features);
			}

			layer.drawSymbolFeatures(features);
		}
	};
	this._source.getFeatures(null,success,null);
};

/**
 * 绘制等级符号图
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.drawSymbolFeatures = function(features){
	if(!isValid(features)){
		return;
	}

	if(this.byLevel){
		this.drawLayerByLevel(features);
	}else{
		this.drawLayerByValue(features);
	}
};

/**
 * 按照等级进行绘制
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.drawLayerByLevel = function(features){
	if(!isValid(features)){
		return;
	}

	var source = this.getSource();
	var field  = this.field;

	var minMax = source.getMinMaxValue(field);
	if(!isValid(minMax)){
		return;
	}

	var symbolizer = this.getSymbolizer();
	this.renderer.save();
	this.renderer.setSymbolizer(symbolizer);

	var levelMap = this.getLevelMap(this.maxSize,this.level,minMax.min,minMax.max);

	var viewer = this.map.getViewer();

	var feature = null,value = null,geometry = null,center = null,radius = null,radius_m = null;
	for(var i = 0; i < features.length;++i){
		feature = features[i];
		if(!isValid(feature)){
			continue;
		}

		geometry = feature.geometry;
		if(!isValid(geometry)){
			continue;
		}

		if(geometry.type == GeoBeans.Geometry.Type.POINT){
			center = geometry;
		}else if(geometry.type == GeoBeans.Geometry.Type.POLYGON 
			|| geometry.type == GeoBeans.Geometry.Type.MULTIPOLYGON){
			center = geometry.getCentroid();
		}
		if(center == null){
			continue;
		}

		value = feature.getValue(field);
		if(!isValid(value)){
			continue;
		}

		radius = this.getRadiusByLevelMap(parseFloat(value),levelMap);

		var center_s = viewer.toScreenPoint(center.x,center.y);
		var center_r_s = new GeoBeans.Geometry.Point(center_s.x+radius,center_s.y);
		var center_r = viewer.toMapPoint(center_r_s.x,center_r_s.y);
		radius_m = center_r.x - center.x;	
		circle = new GeoBeans.Geometry.Circle(center,radius_m);
		this.renderer.drawGeometry(circle,symbolizer,viewer);
	}

	this.renderer.restore();
}

/**
 * 按照等级划分数值区间段
 * @private
 * @param  {float} radius 最大半径
 * @param  {integer} level  级别
 * @param  {float} min    最小值
 * @param  {float} max    最大值
 * @return {Array}        
 */
GeoBeans.Layer.SymbolChartLayer.prototype.getLevelMap = function(radius,level,min,max){
	if(!isValid(radius) || !isValid(level) || !isValid(min) || !isValid(max)){
		return null;
	}
	var interval = (max - min )/level;
	var levelMap = [];
	for(var i = 0; i < level; ++i){
		var s = min + i*interval;
		var b = min + (i+1)*interval;
		var r = Math.pow(1.2,i+1-level)*radius;
		var object = {
			min : s,
			max : b,
			radius : r
		}
		levelMap.push(object);
	}

	return levelMap;

}

/**
 * 从等级划分区间段内寻找值
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.getRadiusByLevelMap = function(value,levelMap){
	if(!isValid(value) || !isValid(levelMap)){
		return null;
	}
	var object = null,min = null, max = null;
	for(var i  = 0; i < levelMap.length; ++i){
		object = levelMap[i];
		if(object == null){
			continue;
		}
		min = object.min;
		max = object.max;
		if(i == 0 && value == min){
			return object.radius;
		}
		if(min < value && max >= value){
			return object.radius;
		}
	}
	return null;

};
/**
 * 获取样式
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.getSymbolizer = function(){
	var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
	var color = this.color;
	if(isValid(color)){
		symbolizer.fill.color.setHex(color,1);
	}
	var opacity = this.opacity;
	if(isValid(opacity)){
		symbolizer.fill.color.setOpacity(opacity);
	}else{
		symbolizer.fill.color.setOpacity(1);
	}

	var width = this.borderWidth;
	
	if(width == 0){
		symbolizer.stroke = null;
	}else{
		color = new GeoBeans.Color();
		if(isValid(this.border)){
			color.setHex(this.border,1);
		}
		if(isValid(this.borderOpacity)){
			color.setOpacity(this.borderOpacity);
		}else{
			color.setOpacity(1);
		}
		symbolizer.stroke.color = color;
		if(isValid(width)){
			//边界宽度
			symbolizer.stroke.width = this.borderWidth; 	
		}
	}
	return symbolizer;
};

/**
 * 按照数值大小进行绘制
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.drawLayerByValue = function(features){
	if(!isValid(features)){
		return;
	}	

	var source = this.getSource();
	var minMax = source.getMinMaxValue(this.field);
	if(!isValid(minMax)){
		return;
	}

	var viewer = this.map.getViewer();
	var symbolizer = this.getSymbolizer();
	this.renderer.save();
	this.renderer.setSymbolizer(symbolizer);

	var feature = null, geometry = null, center = null,circle = null,radius;

	for(var i = 0; i < features.length;++i){
		feature = features[i];
		if(!isValid(feature)){
			continue;
		}

		value = feature.getValue(this.field);
		if(!isValid(value)){
			continue;
		}

		geometry = feature.geometry;
		if(!isValid(geometry)){
			continue;
		}
		if(geometry.type == GeoBeans.Geometry.Type.POINT){
			center = geometry;
		}else if(geometry.type == GeoBeans.Geometry.Type.POLYGON 
			|| geometry.type == GeoBeans.Geometry.Type.MULTIPOLYGON){
			center = geometry.getCentroid();
		}

		if(!isValid(center)){
			continue;
		}
		radius = parseFloat(value)/minMax.max * this.maxSize;

		var center_s = viewer.toScreenPoint(center.x,center.y);
		var center_r_s = new GeoBeans.Geometry.Point(center_s.x+radius,center_s.y);
		var center_r = viewer.toMapPoint(center_r_s.x,center_r_s.y);
		radius_m = center_r.x - center.x;	
		circle = new GeoBeans.Geometry.Circle(center,radius_m);

		this.renderer.drawGeometry(circle,symbolizer,viewer);
	}	
}
	

/**
 * 获取图例内容
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.getLegendHtml = function(){
	if(this.byLevel){
		return this.getLegendHtmlByLevel();
	}else{
		return this.getLegendHtmlByValue();
	}
};

GeoBeans.Layer.SymbolChartLayer.prototype.getLegendHtmlByLevel = function(){
	var maxsize =  this.maxSize;
	var level = this.level;
	var canvasWidth = this.maxSymbolRadius *2 + 4;

	var source = this.getSource();
	var field  = this.field;

	var minMax = source.getMinMaxValue(field);
	if(!isValid(minMax)){
		return "";
	}

	var levelMap = this.getLevelMap(this.maxSize,this.level,minMax.min,minMax.max);

	var canvasHeight = this.getLegendCanvasHeightByLevel(levelMap,this.maxSymbolRadius,maxsize);
	if(isValid(canvasHeight)){
		return "";
	}
	var html = "<div class='chart-legend chart-symbol-legend' id='" + this.name 
	+ "_legend'>";
	html += "<div class='chart-legend-title'<h5>" + this.name + "</h5></div>";
	html += "<div class='chart-legend-canvas'>";



	var labelHtml = "";
	var canvas = document.createElement("canvas");
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;
	var renderer = new GeoBeans.Renderer(canvas);
	var symbolizer = this.getSymbolizer();
	renderer.setSymbolizer(symbolizer);
	var context = renderer.context;

	var top = 0;
	var obj = null,radius = null, legendRadius = null,min = null,max = null,itemHtml=null,labelPadding=0;
	var preTop = null;
	for(var i = 0; i < levelMap.length; ++i){
		obj = levelMap[i];
		if(obj == null){
			continue;
		}
		min = obj.min;
		max = obj.max;
		min = min.toFixed(2);
		max = max.toFixed(2);
		itemHtml = min + "~" + max; 

		radius = obj.radius;
		legendRadius = radius/maxsize * this.maxSymbolRadius;
		top += legendRadius;
		top = Math.ceil(top);

		if(preTop == null){
			preTop = -16.99/2;
		}

		labelPadding = top - preTop - 16.99;
		preTop = top;
		// labelPadding = Math.ceil(labelPadding);
		labelHtml += "<div class='chart-legend-label' style='padding-top:" +labelPadding + "px'>" + itemHtml + "</div>";
		var center = new GeoBeans.Geometry.Point(this.maxSymbolRadius + 2,top);
		top += legendRadius+ this.legendPadding;
		top = Math.ceil(top);

		context.beginPath();
		context.arc(center.x,center.y,legendRadius,0,Math.PI*2,true);
		if(symbolizer.fill != null){
			context.fill();
		}
		if(symbolizer.stroke != null){
			context.stroke();
		}
		context.closePath();
	}

	html += "<img src='" + canvas.toDataURL() + "'/>";
	html += "</div><div class='chart-legend-value' style='font-size:12px;ling-height:12px'>" + labelHtml+"</div>";
	html += "</div>";
	return html;
};

/**
 * 计算canvas的高度
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.getLegendCanvasHeightByLevel = function(levelMap,maxSymbolRadius,maxsize){
	if(levelMap == null || maxSymbolRadius == null || maxsize == null){
		return null;
	}
	var height = 0;
	var obj = null,radius = null;
	for(var i = levelMap.length -1 ; i >= 0 ; --i){
		obj = levelMap[i];
		if(obj == null){
			continue;
		}
		radius = obj.radius;
		var h = radius / maxsize * maxSymbolRadius;
		height += h*2 + this.legendPadding;
	}
	height += 4;
	height = Math.ceil(height);
	return height;
};


/**
 * 按照值来获取图例
 * @private
 */
GeoBeans.Layer.SymbolChartLayer.prototype.getLegendHtmlByValue = function(){
	var source = this.getSource();
	var minMax = source.getMinMaxValue(this.field);
	if(!isValid(minMax)){
		return "";
	}

	var min = minMax.min;
	var max = minMax.max;
	var maxsize =  this.maxSize;
	var minRadius = min/max * this.maxSymbolRadius;
	if(minRadius < 0){
		minRadius = this.maxSymbolRadius/10;
	}
	var minHeight = minRadius;
	if(minRadius < 8.5){
		minHeight = 8.5;
	}
	var canvasWidth = this.maxSymbolRadius *2 + 4;
	var canvasHeight = (this.maxSymbolRadius + minHeight)*2 + this.legendPadding + 4;

	var html = "<div class='chart-legend chart-symbol-legend' id='" + this.name 
	+ "_legend'>";
	html += "<div class='chart-legend-title'><h5>" + this.name + "</h5></div>";
	html += "<div class='chart-legend-canvas'>";
	
	var canvas = document.createElement("canvas");
	canvas.height = canvasHeight;
	canvas.width =canvasWidth;
	var renderer = new GeoBeans.Renderer(canvas);
	var symbolizer = this.getSymbolizer();
	renderer.setSymbolizer(symbolizer);
	var context = renderer.context;	
	

	var minCenter = new GeoBeans.Geometry.Point(this.maxSymbolRadius + 2,minHeight);
	context.beginPath();
	context.arc(minCenter.x,minCenter.y,minRadius,0,Math.PI*2,true);
	if(symbolizer.fill != null){
		context.fill();
	}
	if(symbolizer.stroke != null){
		context.stroke();
	}
	context.closePath();
	context.beginPath();
	var maxTop = this.maxSymbolRadius + minHeight*2 + this.legendPadding;
	var maxCenter = new GeoBeans.Geometry.Point(this.maxSymbolRadius + 2, maxTop);
	context.arc(maxCenter.x,maxCenter.y,this.maxSymbolRadius,0,Math.PI*2,true);
	if(symbolizer.fill != null){
		context.fill();
	}
	if(symbolizer.stroke != null){
		context.stroke();
	}
	context.closePath();

	var labelHtml = "";
	var minLabelPadding = minHeight - 8.5;
	var maxLabelPadding = maxCenter.y - minCenter.y - 16.99;

	labelHtml += "<div class='chart-legend-label' style='padding-top:" + minLabelPadding + "px'>" + min + "</div>";
	labelHtml += "<div class='chart-legend-label' style='padding-top:" + maxLabelPadding + "px'>" + max + "</div>";

	html += "<img src='" + canvas.toDataURL() + "'/>";
	html += "</div><div class='chart-legend-value' style='font-size:12px;ling-height:12px'>" + labelHtml + "</div>";
	html += "</div>";
	return html;
};