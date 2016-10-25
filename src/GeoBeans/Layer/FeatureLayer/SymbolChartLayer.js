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

	destory : function(){
		GeoBeans.Layer.FeatureLayer.prototype.destory.apply(this, arguments);
	}
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
 * @param  {float]} max    最大值
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
 * @param  {[type]} value    [description]
 * @param  {[type]} levelMap [description]
 * @return {[type]}          [description]
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