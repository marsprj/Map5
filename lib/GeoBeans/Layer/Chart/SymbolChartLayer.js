GeoBeans.Layer.SymbolChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	
	chartOption : null,

	// 等级划分
	levelMap : null,

	// 图例间隙
	legendPadding : 4,

	// 图例中最大的圈大小
	maxSymbolRadius : 30,

	minMax : null,

	initialize : function(name,baseLayerName,baseLayerField,dbName,tableName,tableField,
		chartFields,chartOption){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Layer.ChartLayer.Type.SYMBOL;
		this.chartOption = chartOption;
	},

	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);
			// 注册点击事件
		this.registerHitEvent(this.onFeatureHit);
		map._addLegend(this);
	},


	cleanup : function(){
		GeoBeans.Layer.ChartLayer.prototype.cleanup.apply(this, arguments);
		this.unRegisterHitEvent();
		this.chartOption = null;
		this.levelMap = null;
		this.minMax = null;
	},

	load : function(){
		if(this.features == null){
			this.features = this.chartFeatures;
		}
		this.renderer.clearRect();
		
		this.drawLayer();
		this.removeLegend();
		this.addLegend();
		if(this.visible){
			this.showLegend();
		}else{
			this.hideLegend();
		}		
		this.flag = GeoBeans.Layer.Flag.LOADED;

	},


	getSymbolizer : function(){
		var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		var color = this.chartOption.color;
		if(color != null){
			symbolizer.fill.color.setByHex(color,1);
		}
		var opacity = this.chartOption.opacity;
		if(opacity != null){
			symbolizer.fill.color.setOpacity(opacity);
		}else{
			symbolizer.fill.color.setOpacity(1);
		}

		var border = this.chartOption.border;
		if(border != null){
			symbolizer.stroke.color.setByHex(border,1);
		}
		var borderOpacity = this.chartOption.borderOpacity;
		if(borderOpacity != null){
			symbolizer.stroke.color.setOpacity(borderOpacity);
		}else{
			symbolizer.stroke.color.setOpacity(1);
		}
		return symbolizer;
	},

	drawLayer : function(){
		if(this.chartOption == null){
			return;
		}
		var byLevel = this.chartOption.byLevel;
		if(byLevel){
			this.drawLayerByLevel();
		}else{
			this.drawLayerByValue();
		}
		
	},

	// 按照分的等级划分
	drawLayerByLevel : function(){
		if(this.chartOption == null){
			return;
		}
		var level = this.chartOption.level;
		var minMax = this.getMinMaxValue();
		this.minMax = minMax;
		var min = minMax.min;
		var max = minMax.max;	
		
		var size = this.chartOption.maxsize;

		var chartField = this.chartFields[0];
		var chartFeatureType = this.chartFeatureType;
		var chartFieldIndex = chartFeatureType.getFieldIndex(this.chartFields);				

		var symbolizer = this.getSymbolizer();
		this.renderer.setSymbolizer(symbolizer);
		var chartFeature = null,values = null,value = null;
		var geometry = null, radius = null,circle = null;

		var levelMap = this.getLevelMap(size,level,min,max);
		this.levelMap = levelMap;

		for(var i = 0; i <this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
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
			// radius = parseFloat(value)/min * this.chartOption.size;
			radius = this.getRadiusByLevelMap(parseFloat(value),levelMap);
			// console.log(radius);
			circle = new GeoBeans.Geometry.Circle(geometry,radius);		
			chartFeature.circle = circle;	
			this.renderer.drawGeometry(circle,symbolizer,this.map.transformation);
		}			

	},

	// 按照值大小划分
	drawLayerByValue : function(){
		var minMax = this.getMinMaxValue();
		this.minMax = minMax;
		var min = minMax.min;
		var max = minMax.max;

		var chartField = this.chartFields[0];
		var chartFeatureType = this.chartFeatureType;
		var chartFieldIndex = chartFeatureType.getFieldIndex(this.chartFields);	

		var symbolizer = this.getSymbolizer();
		this.renderer.setSymbolizer(symbolizer);
		var chartFeature = null,values = null,value = null;
		var geometry = null, radius = null,circle = null;
		for(var i = 0; i <this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
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
			radius = parseFloat(value)/max * this.chartOption.maxsize;
			circle = new GeoBeans.Geometry.Circle(geometry,radius);		
			chartFeature.circle = circle;		
			this.renderer.drawGeometry(circle,symbolizer,this.map.transformation);
		}			
	},

	// 获取最大最小值
	getMinMaxValue : function(){
		if(this.chartFeatures == null){
			return null;
		}
		var chartFeature = null;
		var chartField = this.chartFields[0];
		var chartFeatureType = this.chartFeatureType;
		var chartFieldIndex = chartFeatureType.getFieldIndex(this.chartFields[0]);
		var values = null,min = null, max = null,value = null;
		for(var i = 0; i < this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
			if(chartFeature == null){
				continue;
			}
			values = chartFeature.values;
			if(values == null){
				continue;
			}
			value = values[chartFieldIndex];
			// console.log(value);
			if(value == null){
				continue;
			}
			value = parseFloat(value);
			if(min == null){
				min = value;
			}else{
				min = (value < min ) ? value : min; 
			}
			if(max == null){
				max = value;
			}else{
				max = (value > max) ? value : max;
			}
		}
		return{
			min : min,
			max : max
		};
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
		if(this.chartOption == null){
			return;
		}
		var byLevel = this.chartOption.byLevel;
		if(byLevel){
			this.addLegendByLevel();
		}else{
			this.addLegendByValue();
		}
	},

	// 按照等级来显示
	addLegendByLevel : function(){
		if(this.chartOption == null){
			return;
		}
		var maxsize =  this.chartOption.maxsize;
		var level = this.chartOption.level;
		var canvasWidth = this.maxSymbolRadius *2 + 4;

		var canvasHeight = this.getLegendCanvasHeightByLevel(this.levelMap,this.maxSymbolRadius,maxsize);
		if(canvasHeight == null){
			return;
		}

		var legends = this.map.mapDiv.find(".chart-legend");
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

		if(this.legendIndex == 0){
			left = 10;
		}else{
			var lastIndex = this.legendIndex - 1;
			var last = this.map.mapDiv.find(".chart-legend[lindex='" +  lastIndex + "']");
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
		this.map.mapDiv.append(html);


		var labelHtml = "";
		var canvas = this.map.mapDiv.find("#" + this.name + " canvas");
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

		this.map.mapDiv.find("#" + this.name + ".chart-legend .chart-legend-value").html(labelHtml);

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
		if(this.chartOption == null){
			return;
		}

		var minMax = this.minMax;
		if(minMax == null){
			return;
		}
		var min = minMax.min;
		var max = minMax.max;
		var maxsize =  this.chartOption.maxsize;
		var minRadius = min/max * this.maxSymbolRadius;
		var minHeight = minRadius;
		if(minRadius < 8.5){
			minHeight = 8.5;
		}
		var canvasWidth = this.maxSymbolRadius *2 + 4;
		var canvasHeight = (this.maxSymbolRadius + minHeight)*2 + this.legendPadding + 4;

		var legends = this.map.mapDiv.find(".chart-legend");
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
			var last = this.map.mapDiv.find(".chart-legend[lindex='" +  lastIndex + "']");
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
		this.map.mapDiv.append(html);

		var canvas = this.map.mapDiv.find("#" + this.name + " canvas");
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
		this.map.mapDiv.find("#" + this.name + ".chart-legend .chart-legend-value").html(labelHtml);
	},


	onFeatureHit : function(layer,selection,point){
		console.log(selection.length);
		if(document.body.style.cursor == "pointer"){
			layer.map.closeInfoWindow();
			return;
		}
		if(selection.length == 0){
			layer.map.closeInfoWindow();
		}else{
			var feature = selection[0];
			var value = feature.chartValue;
			var chartFeatureType = layer.chartFeatureType;
			if(chartFeatureType == null){
				return;
			}
			var values = feature.values;
			if(values == null){
				return;
			}
			var chartFieldIndex = chartFeatureType.getFieldIndex(layer.chartFields[0]);
			var chartValue = values[chartFieldIndex];
			var tableFieldIndex = chartFeatureType.getFieldIndex(layer.tableField);
			var tableFieldValue = values[tableFieldIndex];
			
			var html = "<div>" + chartValue + "</div>";
			var options = {
				title : tableFieldValue,
				width : 100,
				height : 40
			};
			var infoWindow = new GeoBeans.InfoWindow(html,options);
			var center = feature.circle.center;
			layer.map.openInfoWindow(infoWindow,center);
		}
		
	},	

	hit : function(x,y,callback){
		if(this.chartFeatures == null){
			return;
		}
		var render = this.map.renderer;
		var transformation = this.map.transformation;
		
		// this.unselection = this.selection;
		this.selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			// g = f.geometry;
			g = f.circle;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					this.selection.push(f);
				}
			}
		}

		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawLayersAll();
		if(callback!=undefined){
			var point = new GeoBeans.Geometry.Point(x,y);
			callback(this, this.selection,point);
		}		
	},


});