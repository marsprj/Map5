GeoBeans.Layer.SymbolChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{

	// 等级划分
	levelMap : null,

	// 图例间隙
	legendPadding : 4,

	// 图例中最大的圈大小
	maxSymbolRadius : 30,

	initialize : function(name,baseLayerName,baseLayerField,option){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
	},


	destroy : function(){
		GeoBeans.Layer.ChartLayer.prototype.destroy.apply(this, arguments);
		this.unRegisterClickEvent();
	},

	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);
		map._addLegend(this);
		this.minMax = this.getMinMaxValue();

		this.clickCanvas = document.createElement("canvas");
		this.clickCanvas.width = this.canvas.width;
		this.clickCanvas.height = this.canvas.height;
		this.clickRenderer  = new GeoBeans.Renderer(this.clickCanvas);
	},


	draw : function(){
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.drawLayer();
		if(this.visible){
			this.removeLegend();
			this.addLegend();
			this.showLegend();
		}else{
			this.removeLegend();
			this.hideLegend();
		}
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},


	getSymbolizer : function(){
		var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		var color = this.option.color;
		if(color != null){
			symbolizer.fill.color.setHex(color,1);
		}
		var opacity = this.option.opacity;
		if(opacity != null){
			symbolizer.fill.color.setOpacity(opacity);
		}else{
			symbolizer.fill.color.setOpacity(1);
		}

		var width = this.option.borderWidth;
		
		if(width == 0){
			symbolizer.stroke = null;
		}else{
			color = new GeoBeans.Color();
			if(this.option.border != null){
				color.setHex(this.option.border,1);
			}
			if(this.option.borderOpacity != null){
				color.setOpacity(this.option.borderOpacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.stroke.color = color;
			if(width != null){
				//边界宽度
				symbolizer.stroke.width = this.option.borderWidth; 	
			}
		}

		
		return symbolizer;
	},

	drawLayer : function(){
		if(this.option == null){
			return;
		}
		// 是否按照级别来绘制
		var byLevel = this.option.byLevel;
		if(byLevel){
			this.drawLayerByLevel();
		}else{
			this.drawLayerByValue();
		}
		this.drawClickLayer();
	},

	// 按照分的等级划分
	drawLayerByLevel : function(){
		if(this.option == null){
			return;
		}
		var level = this.option.level;
		
		var min = this.minMax.min;
		var max = this.minMax.max;	
		
		var size = this.option.maxsize;

		var chartField = this.baseLayerField;
		var featureType = this.featureType;
		var chartFieldIndex = featureType.findField(this.baseLayerField);				

		var symbolizer = this.getSymbolizer();
		this.renderer.setSymbolizer(symbolizer);
		var chartFeature = null,values = null,value = null;
		var geometry = null, radius = null,circle = null,center = null;

		var levelMap = this.getLevelMap(size,level,min,max);
		this.levelMap = levelMap;

		for(var i = 0; i <this.features.length; ++i){
			chartFeature = this.features[i];
			if(chartFeature == null){
				continue;
			}
			values = chartFeature.values;
			if(values == null){
				continue;
			}
			value = values[chartFieldIndex];
			if(value == null){
				continue;
			}
			geometry = chartFeature.geometry;

			if(geometry == null){
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
			radius = this.getRadiusByLevelMap(parseFloat(value),levelMap);
			var center_s = this.map.getViewer().toScreenPoint(center.x,center.y);
			var center_r_s = new GeoBeans.Geometry.Point(center_s.x+radius,center_s.y);
			var center_r = this.map.getViewer().toMapPoint(center_r_s.x,center_r_s.y);
			radius_m = center_r.x - center.x;	
			circle = new GeoBeans.Geometry.Circle(center,radius_m);
			chartFeature.circle = circle;	
			this.renderer.drawGeometry(circle,symbolizer,this.map.getViewer());
		}			

	},	

	// 按照值大小划分
	drawLayerByValue : function(){
		
		var min = this.minMax.min;
		var max = this.minMax.max;

		var chartField = this.baseLayerField;
		var featureType = this.featureType;
		var chartFieldIndex = featureType.findField(this.baseLayerField);	

		var symbolizer = this.getSymbolizer();
		this.renderer.setSymbolizer(symbolizer);
		var chartFeature = null,values = null,value = null;
		var geometry = null, radius = null,circle = null,center = null;
		for(var i = 0; i <this.features.length; ++i){
			chartFeature = this.features[i];
			if(chartFeature == null){
				continue;
			}
			values = chartFeature.values;
			if(values == null){
				continue;
			}
			value = values[chartFieldIndex];
			if(value == null){
				continue;
			}
			geometry = chartFeature.geometry;
			if(geometry == null){
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

			radius = parseFloat(value)/max * this.option.maxsize;
			var center_s = this.map.getViewer().toScreenPoint(center.x,center.y);
			var center_r_s = new GeoBeans.Geometry.Point(center_s.x+radius,center_s.y);
			var center_r = this.map.getViewer().toMapPoint(center_r_s.x,center_r_s.y);
			radius_m = center_r.x - center.x;	
			circle = new GeoBeans.Geometry.Circle(center,radius_m);
			chartFeature.circle = circle;	
			this.renderer.drawGeometry(circle,symbolizer,this.map.getViewer());
		}			
	},

	getLevelMap : function(radius,level,min,max){
		if(radius == null || level == null || min == null || max == null){
			return;
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
	},

	getRadiusByLevelMap : function(value,levelMap){
		if(value == null || levelMap == null){
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
	},

	addLegend : function(){
		if(this.option == null){
			return;
		}
		var byLevel = this.option.byLevel;
		if(byLevel){
			this.addLegendByLevel();
		}else{
			this.addLegendByValue();
		}
	},

	// 按照等级来显示
	addLegendByLevel : function(){
		if(this.option == null){
			return;
		}
		var maxsize =  this.option.maxsize;
		var level = this.option.level;
		var canvasWidth = this.maxSymbolRadius *2 + 4;

		var canvasHeight = this.getLegendCanvasHeightByLevel(this.levelMap,this.maxSymbolRadius,maxsize);
		if(canvasHeight == null){
			return;
		}

		var mapContainer = this.map.getContainer();
		var legends = $(mapContainer).find(".chart-legend");
		var left = 0;

		if(this.legendIndex == 0){
			left = 10;
		}else{
			var lastIndex = this.legendIndex - 1;
			var last = $(mapContainer).find(".chart-legend[lindex='" +  lastIndex + "']");
			var l = last.css("left");
			var w = last.css("width");
			l = parseInt(l.replace("px",""));
			w = parseInt(w.replace("px",""));
			left = l  + w + 5;			
		}
		var html = "<div class='chart-legend chart-symbol-legend' id='" + this.name 
		+ "' style='left:" + left + "px' lindex='" + this.legendIndex + "'>";
		html += "<div class='chart-legend-title'<h5>" + this.name + "</h5></div>";
		html += "<div class='chart-legend-canvas'><canvas width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas></div>";
		html += "<div class='chart-legend-value' style='font-size:12px;ling-height:12px'></div>";
		html += "</div>";
		$(mapContainer).append(html);


		var labelHtml = "";
		var canvas = $(mapContainer).find("#" + this.name + " canvas");
		var renderer = new GeoBeans.Renderer(canvas[0]);
		var symbolizer = this.getSymbolizer();
		renderer.setSymbolizer(symbolizer);
		var context = renderer.context;

		var top = 0;
		var obj = null,radius = null, legendRadius = null,min = null,max = null,itemHtml=null,labelPadding=0;
		var preTop = null;
		for(var i = 0; i < this.levelMap.length; ++i){
			obj = this.levelMap[i];
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

		$(mapContainer).find("#" + this.name + ".chart-legend .chart-legend-value").html(labelHtml);

	},

	// 等级划分的图例绘图的高度
	getLegendCanvasHeightByLevel : function(levelMap,maxSymbolRadius,maxsize){
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
	},

	// 按照
	addLegendByValue : function(){
		if(this.option == null){
			return;
		}

		var minMax = this.minMax;
		if(minMax == null){
			return;
		}

		var mapContainer = this.map.getContainer();

		var min = minMax.min;
		var max = minMax.max;
		var maxsize =  this.option.maxsize;
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

		var legends = $(mapContainer).find(".chart-legend");
		var left = 0;
		// if(legends.length > 0){
		// 	var last = legends.last();
		// 	var l = last.css("left");
		// 	var w = last.css("width");
		// 	l = parseInt(l.replace("px",""));
		// 	w = parseInt(w.replace("px",""));
		// 	left = l  + w + 5;
		// }else{
		// 	left = 10;
		// }
		// for(var i = 0; i < legends.length; ++i){
		// 	var legend = legends[i];
		// 	var index = legend.attr("")
		// }
		if(this.legendIndex == 0){
			left = 10;
		}else{
			var lastIndex = this.legendIndex - 1;
			var last = $(mapContainer).find(".chart-legend[lindex='" +  lastIndex + "']");
			var l = last.css("left");
			var w = last.css("width");
			l = parseInt(l.replace("px",""));
			w = parseInt(w.replace("px",""));
			left = l  + w + 5;			
		}

		var html = "<div class='chart-legend chart-symbol-legend' id='" + this.name 
		+ "' style='left:" + left + "px' lindex='" + this.legendIndex + "'>";
		html += "<div class='chart-legend-title'><h5>" + this.name + "</h5></div>";
		html += "<div class='chart-legend-canvas'><canvas width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas></div>";
		html += "<div class='chart-legend-value' style='font-size:12px;ling-height:12px'></div>";
		html += "</div>";
		$(mapContainer).append(html);

		var canvas = $(mapContainer).find("#" + this.name + " canvas");
		var renderer = new GeoBeans.Renderer(canvas[0]);
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
		console.log(minLabelPadding);
		console.log(maxLabelPadding);
		labelHtml += "<div class='chart-legend-label' style='padding-top:" + minLabelPadding + "px'>" + min + "</div>";
		labelHtml += "<div class='chart-legend-label' style='padding-top:" + maxLabelPadding + "px'>" + max + "</div>";
		$(mapContainer).find("#" + this.name + ".chart-legend .chart-legend-value").html(labelHtml);
	},

	// 点击事件
	registerClickEvent : function(style,callback){
		var map = this.map;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;
		var layer = this;
		if(style != null){
			this.clickStyle = style;
		}
		this.clickEvent = function(evt){
			console.log("click up");
			var index = layer.map.controls.find(GeoBeans.Control.Type.DRAG_MAP)
			var dragControl = layer.map.controls.get(index);
			if(dragControl.draging){
				console.log("draging");
				return;
			}
			layer.clickRenderer.clearRect(0,0,layer.clickCanvas.width,layer.clickCanvas.height);
			layer.map.drawLayersAll();
			var mp = map.getViewer().toMapPoint(evt.layerX, evt.layerY);
			layer.clickHit(mp.x, mp.y, callback);
			
		};
		map.canvas.addEventListener('mouseup', this.clickEvent);		
	},

	clickHit : function(x,y,callback){
		this.map.closeInfoWindow();
		if(this.features == null){
			if(callback != null){
				callback(null);
			}
			return;
		}
		var selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			g = f.circle;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					selection.push(f);
				}
			}
		}


		if(selection.length == 0){
			this.clickFeature = null;
			if(callback != null){
				callback(null);	
			}
			return;
		}


		var feature = selection[0];
		var circle = feature.circle;
		var distance = this.getDistance(x,y,circle);
		for(var i = 1; i <  selection.length;++i){
			var f = selection[i];
			var g = f.circle;
			var d = this.getDistance(x,y,g);
			if(d < distance){
				feature = f;
			}
		}

		if(callback != null){
			this.clickFeature = feature;
			this.map.drawLayersAll();
			callback(feature,x,y);
		}
	},

	drawClickLayer : function(){
		this.clickRenderer.clearRect(0,0,this.clickCanvas.width,this.clickCanvas.height);
		if(this.clickFeature == null){
			return;
		}
		var style = this.clickStyle;
		if(style == null){
			style = this.getDefaultStyle();
		}
		if(style == null){
			return;
		}

		var rules = style.rules;
		if(rules.length == 0){
			return;
		}

		for(var i=0; i<rules.length; i++){
			var rule = rules[i];
			var features = this.selectFeaturesByFilter(rule.filter,[this.clickFeature]);
			if(rule.symbolizer != null){
				this.drawClickFeatures(features, rule.symbolizer);
			}

			if(rule.textSymbolizer != null){
				this.labelClickFeatures(features,rule.textSymbolizer);
			}
		}
	},

	drawClickFeatures : function(features,symbolizer){
		if(features == null){
			return;
		}
		this.clickRenderer.save();
		this.clickRenderer.setSymbolizer(symbolizer);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			if((symbolizer!=null) && (symbolizer!='undefined')){
				this.clickRenderer.drawGeometry(feature.circle, symbolizer, this.map.getViewer());
			}
		}
		this.clickRenderer.restore();
	},
});