GeoBeans.Layer.RangeSymbolChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	
	// 分级图对应的底图
	rangeBaseLayerName : null,

	rangeBaseLayerField : null,

	rangeChartField : null,

	rangeOption : null,

	// 等级符号对应的底图
	symbolBaseLayerName : null,

	symbolBaseLayerField : null,

	symbolChartField : null,

	symbolOption : null,

	// 样式，为RANGE底图的样式
	style : null,

	// 图例中最大的圈大小
	maxSymbolRadius : 30,

	// 等级划分
	levelMap : null,

	// 图例间隙
	legendPadding : 4,	

	initialize : function(name,rangeBaseLayerName,rangeBaseLayerField,rangeChartField,
		symbolBaseLayerName,symbolBaseLayerField,symbolChartField,dbName,tableName,tableField,rangeOption,symbolOption){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.name = name;
		this.rangeBaseLayerName = rangeBaseLayerName;
		this.rangeBaseLayerField = rangeBaseLayerField;
		this.rangeChartField = rangeChartField;
		this.symbolBaseLayerName = symbolBaseLayerName;
		this.symbolBaseLayerField = symbolBaseLayerField;
		this.symbolChartField = symbolChartField;
		this.dbName = dbName;
		this.tableName = tableName;
		this.tableField = tableField;
		this.chartFields = [this.rangeChartField,this.symbolChartField];
		this.rangeOption = rangeOption;
		this.symbolOption = symbolOption;
		this.type = GeoBeans.Layer.ChartLayer.Type.RANGESYMBOL;
	},

	cleanup : function(){
		GeoBeans.Layer.ChartLayer.prototype.cleanup.apply(this, arguments);
		this.unRegisterHitEvent();
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		this.getFeatures();

		var uerServer = this.map.server.slice(0,this.map.server.lastIndexOf("/mgr"));;
		this.styleMgr = new GeoBeans.StyleManager(uerServer);

		// 注册点击事件
		this.registerHitEvent(this.onFeatureHit);
	},

	load : function(){
		var mapViewer = this.map.viewer;
		if(mapViewer != null && this.viewer != null 
			&& mapViewer.equal(this.viewer) && this.features != null
			&& this.flag == GeoBeans.Layer.Flag.LOADED){
			// this.drawLegend();
			return;		
		}	

		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);
		this.renderer.clearRect();
		this.drawRangChart();
		this.drawSymbolChart();	
		this.drawLegend();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	drawLegend : function(){
		if(this.minMax == null || this.rangeOption == null || this.symbolOption == null){
			return;
		}
		this.removeLegend();
		this.drawRangeLegend();
		this.drawSymbolLegend();
		this.resizeLegend();
	},

	// 获取元素
	getFeatures : function(){
		if(this.rangeBaseLayerName == null || this.rangeBaseLayerField == null ||
			this.symbolBaseLayerName == null || this.symbolBaseLayerField == null ||
			this.dbName == null || this.tableName == null ||this.tableField == null){
			return;
		}
		// 获取表格数据
		var workspace = new GeoBeans.WFSWorkspace("tmp",this.map.server,"1.0.0");
		var tableFeatureType = new GeoBeans.FeatureType(workspace,this.tableName);
		tableFeatureType.getFields(null,this.dbName);
		var tableFieldIndex = tableFeatureType.getFieldIndex(this.tableField);
		if(tableFieldIndex == -1){
			return;
		}
		var tableFeatures = tableFeatureType.getFeaturesFilter(null,
			this.dbName,null,null,null,[this.tableField].concat(this.chartFields));

		// 获取range base数据
		var rangeLayer = this.map.getLayer(this.rangeBaseLayerName);
		var rangeFeatureType = rangeLayer.getFeatureType();
		var rangeBaseLayerFieldIndex = rangeFeatureType.getFieldIndex(this.rangeBaseLayerField);
		if(rangeBaseLayerFieldIndex == -1){
			return;
		}
		var rangeGeomField = rangeFeatureType.geomFieldName;
		var fields = [this.rangeBaseLayerField,rangeGeomField];
		var rangeFeatures = rangeFeatureType.getFeaturesFilter(this.map.name,null,null,null,null,fields);

		// 获取symbol base数据
		var symbolLayer = this.map.getLayer(this.symbolBaseLayerName);
		var symbolFeatureType = symbolLayer.getFeatureType();
		var symbolBaseLayerFieldIndex = symbolFeatureType.getFieldIndex(this.symbolBaseLayerField);
		if(symbolBaseLayerFieldIndex == -1){
			return;
		}
		var symbolGeomField = symbolFeatureType.geomFieldName;
		var fields = [this.symbolBaseLayerField,symbolGeomField];
		var symbolFeatures = symbolFeatureType.getFeaturesFilter(this.map.name,null,null,null,null,fields);
		

		// chartField
		var rangeChartFieldIndex = tableFeatureType.getFieldIndex(this.rangeChartField);
		var symbolChartFieldIndex = tableFeatureType.getFieldIndex(this.symbolChartField);
		// 以rangeFeatures为底图进行匹配
		var rFeature = null,rValues = null,sFeature = null,sValues = null,tFeature = null,tValues = null;
		var rbFieldValue = null,sbFieldValue = null,tFieldValue = null;
		var rChartFieldValue = null, sChartFieldValue = null;
		var rMin = null,rMax = null,sMin = null,sMax = null;
		for(var i = 0; i < rangeFeatures.length;++i){
			rFeature = rangeFeatures[i];
			if(rFeature == null){
				continue;
			}
			rValues = rFeature.values;

			if(rValues == null){continue;}
			rbFieldValue =  rValues[rangeBaseLayerFieldIndex];
			for(var j = 0; j < symbolFeatures.length;++j){
				sFeature = symbolFeatures[j];
				if(sFeature == null){continue;}
				sValues = sFeature.values;
				if(sValues == null){continue;}
				sbFieldValue = sValues[symbolBaseLayerFieldIndex];
				if(rbFieldValue == sbFieldValue){
					// 匹配range和symbol
					rFeature.symbolGeomtry = sFeature.geometry;
					for(var k = 0; k < tableFeatures.length;++k){
						tFeature = tableFeatures[k];
						if(tFeature == null){continue;}
						tValues = tFeature.values;
						if(tValues == null){continue;}
						tFieldValue = tValues[tableFieldIndex];
						if(tFieldValue == rbFieldValue){
							// sFeature.
							rChartFieldValue = tValues[rangeChartFieldIndex];
							sChartFieldValue = tValues[symbolChartFieldIndex];
							rChartFieldValue = parseFloat(rChartFieldValue);
							sChartFieldValue = parseFloat(sChartFieldValue);
							rFeature.rValue = rChartFieldValue;
							rFeature.sValue = sChartFieldValue;
							
							if(rMin == null){
								rMin = rChartFieldValue;
							}else{
								rMin = (rMin < rChartFieldValue) ? rMin : rChartFieldValue;
							}
							if(rMax == null){
								rMax = (rMax > rChartFieldValue) ? rMax : rChartFieldValue;
							}

							if(sMin == null){
								sMin = sChartFieldValue;
							}else{
								sMin = (sMin < sChartFieldValue) ? sMin : sChartFieldValue;
							}
							if(sMax == null){
								sMax = sChartFieldValue;
							}else{
								sMax = (sMax > sChartFieldValue) ? sMax :sChartFieldValue;
							}

							break;
						}
					}
					break;
				}
			}
			rFeature.tValue = rbFieldValue; //空间匹配字段
		}
		// 将所有的信息就记录在rangeFeatures
		this.features = rangeFeatures;
		this.minMax = {
			range :{
				min : rMin,
				max : rMax
			},
			symbol :{
				min : sMin,
				max : sMax
			}
		};
	},


	drawRangChart : function(){
		// if(this.style == null){
		// 	this.style = this.getRangeStyle();
		// }
		this.style = this.getRangeStyle();
		if(this.style == null){
			return;
		}
		
		this.drawLayer();
	},

	getRangeStyle : function(){
		if(this.features == null || this.rangeOption == null  || this.minMax == null){
			return null;
		}
		var count = this.features.length;
		var colorMapID = this.rangeOption.colorMapID;

		var colorMap = this.styleMgr.getColorMapByID(colorMapID);
		this.colorMap = colorMap;
		var minMaxValue = this.minMax.range;
		var colorRangeMap = new GeoBeans.ColorRangeMap(this.colorMap.startColor,
			this.colorMap.endColor,minMaxValue.min,minMaxValue.max);


		var style = new GeoBeans.Style.FeatureStyle("chart",
			GeoBeans.Style.FeatureStyle.GeomType.Polygon);
		var rules = [];


		for(var i = 0; i < count; ++i){
			var feature = this.features[i];
			if(feature == null){
				continue;
			}
			var chartValue = feature.rValue;

			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();

			// fill color
			var color = null;
			if(chartValue == null){
				color = new GeoBeans.Color();
				color.setByHex("#ffffff",1.0);
			}else{
				// 根据值获得颜色
				chartValue = parseFloat(chartValue);
				color = colorRangeMap.getValue(chartValue);
			}

			if(this.rangeOption.opacity != null){
				color.setOpacity(this.rangeOption.opacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.fill.color = color;

			// stroke
			color = new GeoBeans.Color();
			if(this.rangeOption.border != null){
				color.setByHex(this.rangeOption.border,1);
			}
			if(this.rangeOption.borderOpacity != null){
				color.setOpacity(this.rangeOption.borderOpacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.stroke.color = color;	

			var filter = new GeoBeans.IDFilter();
			filter.addID(feature.fid);


			var color = new GeoBeans.Color();
			var fill = new GeoBeans.Fill();
			fill.color = color;


			var rule = new GeoBeans.Rule();
			rule.filter = filter;
			rule.name = chartValue;
			rule.symbolizer = symbolizer;
			rules.push(rule);
		}

		style.rules = rules;
		return style;		
	},

	// 绘制symbo
	drawSymbolChart : function(){
		if(this.minMax == null || this.symbolOption == null || this.features == null){
			return;
		}
		var byLevel = this.symbolOption.byLevel;
		if(byLevel){
			this.drawSymbolLayerByLevel();
		}else{
			this.drawSymbolLayerByValue();
		}
	},

	// 按照分的等级划分
	drawSymbolLayerByLevel : function(){
		if(this.features == null || this.minMax == null || this.symbolOption == null){
			return;
		}
		var level = this.symbolOption.level;
		var minMaxValue = this.minMax.symbol;
		var min = minMaxValue.min;
		var max = minMaxValue.max;	
		
		var size = this.symbolOption.maxsize;

		var symbolizer = this.getSymbolizer();
		this.renderer.setSymbolizer(symbolizer);
		var chartFeature = null,values = null,value = null;
		var geometry = null, radius = null,circle = null;

		var levelMap = this.getLevelMap(size,level,min,max);
		this.levelMap = levelMap;

		for(var i = 0; i <this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			value = feature.sValue;
			geometry = feature.symbolGeomtry;
			radius = this.getRadiusByLevelMap(parseFloat(value),levelMap);
			circle = new GeoBeans.Geometry.Circle(geometry,radius);		
			feature.circle = circle;	
			this.renderer.drawGeometry(circle,symbolizer,this.map.transformation);
		}			
	},

	// 等级符号对应的半径值
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

	drawSymbolLayerByValue : function(){
		if(this.minMax == null || this.features == null || this.symbolOption == null){
			return;
		}
		var minMaxValue = this.minMax.symbol;
		var min = minMaxValue.min;
		var max = minMaxValue.max;

		var symbolizer = this.getSymbolizer();
		this.renderer.setSymbolizer(symbolizer);
		var feature = null,value = null;
		var geometry = null, radius = null,circle = null;
		for(var i = 0; i <this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			value = feature.sValue;
			if(value == null){
				continue;
			}
			geometry = feature.symbolGeomtry;
			radius = parseFloat(value)/max * this.symbolOption.maxsize;
			circle = new GeoBeans.Geometry.Circle(geometry,radius);		
			feature.circle = circle;		
			this.renderer.drawGeometry(circle,symbolizer,this.map.transformation);
		}			
	},

	// 等级符号图的样式
	getSymbolizer : function(){
		var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		var color = this.symbolOption.color;
		if(color != null){
			symbolizer.fill.color.setByHex(color,1);
		}
		var opacity = this.symbolOption.opacity;
		if(opacity != null){
			symbolizer.fill.color.setOpacity(opacity);
		}else{
			symbolizer.fill.color.setOpacity(1);
		}

		var border = this.symbolOption.border;
		if(border != null){
			symbolizer.stroke.color.setByHex(border,1);
		}
		var borderOpacity = this.symbolOption.borderOpacity;
		if(borderOpacity != null){
			symbolizer.stroke.color.setOpacity(borderOpacity);
		}else{
			symbolizer.stroke.color.setOpacity(1);
		}
		return symbolizer;
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

			if(feature == null){
				return;
			}
			var tValue = feature.tValue;
			var rValue = feature.rValue;
			var sValue = feature.sValue;

			var rangeChartField = layer.rangeChartField;
			var symbolChartField = layer.symbolChartField;
			var html = "<div>" 
				+	"<div>"+ rangeChartField + " : " + (rValue == null? "": rValue) +  "</div>"
				+	"<div>"+ symbolChartField + " : " + (sValue == null? "": sValue) +  "</div>"
				+ "</div>";
			var options = {
				title : tValue,
				width : 100,
				height : 40
			};
			var infoWindow = new GeoBeans.InfoWindow(html,options);
			layer.map.openInfoWindow(infoWindow,point);
		}
		
	},	

	drawRangeLegend : function(){
		if(this.minMax == null || this.rangeOption == null){
			return;
		}
		var color = null;
		var fill = null;
		var rule = null;
		var colorValue = null;
		var label = null;
		var html = "";

		var legends = this.map.mapDiv.find(".chart-legend");
		var left = 0;
		if(legends.length > 0){
			var last = legends.last();
			var l = last.css("left");
			var w = last.css("width");
			l = parseInt(l.replace("px",""));
			w = parseInt(w.replace("px",""));
			left = l  + w + 5;
		}else{
			left = 10;
		}		
		var html = "<div class='chart-legend chart-legend-range-symbol' id='" + this.name + "' style='left:" + left + "px'>";
		html += "<div class='chart-legend-item chart-legend-rs-range'><div class='chart-legend-title'>"
		+	"<h5>" + this.rangeChartField + "</h5>"
		 +	"</div>";
		html +=	"<div class='chart-legend-canvas'>"
		+ 	"	<canvas width='20' height='200'></canvas>"
		+	"</div>"
		+ 	"<div class='chart-legend-value'>"
		+	"<div class='chart-legend-label'>"
		+ 	this.minMax.range.max
		+ 	"</div>"
		+	"<div class='chart-legend-label' style='padding-top:180px'>"
		+	this.minMax.range.min
		+	"</div>"		
		+	"</div>"
		+	"</div>"
		
		html += "</div>";
		this.map.mapDiv.append(html);
		var canvas = this.map.mapDiv.find("#"+this.name + " .chart-legend-canvas canvas");
		var context = canvas[0].getContext('2d');

		var image = new Image();
		image.src = this.colorMap.url;
		image.onload = function(){
			var x = canvas.width() / 2;
			var y = canvas.height() / 2;
			var width = image.width;
			var height = image.height;
			
			context.clearRect(0,0,width,height);
			context.translate(x, y);
			context.rotate(270*Math.PI/180);
			context.drawImage(image, -width / 2, -height / 2, width, height);
			context.rotate(-270*Math.PI/180);
			context.translate(-x, -y);
		};	
	},

	// 获取symbol图例
	drawSymbolLegend : function(){
		if(this.symbolOption == null){
			return "";
		}
		var byLevel = this.symbolOption.byLevel;
		if(byLevel){
			return this.drawSymbolLegendByLevel();
		}else{
			return this.drawSymbolLegendByValue();
		}
	},

	drawSymbolLegendByLevel : function(){
		if(this.symbolOption == null){
			return;
		}
		var maxsize =  this.symbolOption.maxsize;
		var level = this.symbolOption.level;
		var canvasWidth = this.maxSymbolRadius *2;

		var canvasHeight = this.getLegendCanvasHeightByLevel(this.levelMap,this.maxSymbolRadius,maxsize);
		if(canvasHeight == null){
			return;
		}

		var html = "<div class='chart-legend-item chart-legend-rs-symbol'>";
		html += "<div class='chart-legend-title'<h5>" + this.symbolChartField + "</h5></div>";
		html += "<div class='chart-legend-canvas'><canvas width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas></div>";
		html += "<div class='chart-legend-value' style='font-size:12px;ling-height:12px'></div>";
		html += "</div>";
		this.map.mapDiv.find("#" + this.name).prepend(html);

		var titleHeight = this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol .chart-legend-title").height();
		var itemHeight = titleHeight + canvasHeight + 20;
		this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol").css("height",itemHeight + "px");

		var labelHtml = "";
		var canvas = this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol canvas");
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
			
			if(preTop == null){
				preTop = -16.99/2;
			}

			labelPadding = top - preTop - 16.99;
			preTop = top;
			// labelPadding = Math.ceil(labelPadding);
			labelHtml += "<div class='chart-legend-label' style='padding-top:" +labelPadding + "px'>" + itemHtml + "</div>";
			var center = new GeoBeans.Geometry.Point(this.maxSymbolRadius,top);
			top += legendRadius+ this.legendPadding;

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
		this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol .chart-legend-value").html(labelHtml);
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
		height = Math.ceil(height);
		return height;
	},

	drawSymbolLegendByValue : function(){
		if(this.symbolOption == null){
			return;
		}	
		var minMaxValue = this.minMax.symbol;
		var min = minMaxValue.min;
		var max = minMaxValue.max;
		var maxsize =  this.symbolOption.maxsize;
		var minRadius = min/max * this.maxSymbolRadius;
		var minHeight = minRadius;
		if(minRadius < 8.5){
			minHeight = 8.5;
		}
		var canvasWidth = this.maxSymbolRadius *2;
		var canvasHeight = (this.maxSymbolRadius + minHeight)*2 + this.legendPadding;

		var legends = this.map.mapDiv.find(".chart-legend");
		var left = 0;
		if(legends.length > 0){
			var last = legends.last();
			var l = last.css("left");
			var w = last.css("width");
			l = parseInt(l.replace("px",""));
			w = parseInt(w.replace("px",""));
			left = l  + w + 5;
		}else{
			left = 10;
		}
		var html = "<div class='chart-legend-item chart-legend-rs-symbol'>";
		html += "<div class='chart-legend-title'><h5>" + this.symbolChartField + "</h5></div>";
		html += "<div class='chart-legend-canvas'><canvas width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas></div>";
		html += "<div class='chart-legend-value' style='font-size:12px;ling-height:12px'></div>";
		html += "</div>";
		this.map.mapDiv.find("#" + this.name).prepend(html);

		var titleHeight = this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol .chart-legend-title").height();
		var itemHeight = titleHeight + canvasHeight + 20;
		this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol").css("height",itemHeight + "px");


		var canvas = this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol canvas");
		var renderer = new GeoBeans.Renderer(canvas[0]);
		var symbolizer = this.getSymbolizer();
		renderer.setSymbolizer(symbolizer);
		var context = renderer.context;	
		

		var minCenter = new GeoBeans.Geometry.Point(this.maxSymbolRadius,minHeight);
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
		var maxCenter = new GeoBeans.Geometry.Point(this.maxSymbolRadius, maxTop);
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
		this.map.mapDiv.find("#" + this.name + " .chart-legend-rs-symbol .chart-legend-value").html(labelHtml);

	},

	// 重新调整位置
	resizeLegend : function(){
		var rangeLegendValue = this.map.mapDiv.find(".chart-legend-rs-range .chart-legend-value");
		var width = rangeLegendValue.width();
		var legendWidth = this.map.mapDiv.find(".chart-legend#" + this.name).width();
		
		if(width + 40 < legendWidth){
			var interval = legendWidth - width - 30;
			var margin = interval / 2;
			rangeLegendValue.css("margin-right",margin + "px");
			this.map.mapDiv.find(".chart-legend-rs-range .chart-legend-canvas").css("margin-left",margin + "px");
		}
	},	


	setRangeBaseLayer : function(rangeBaseLayerName){
		if(rangeBaseLayerName != null){
			this.rangeBaseLayerName = rangeBaseLayerName;
		}
	},

	setRangeBaseLayerField : function(rangeBaseLayerField){
		if(rangeBaseLayerField != null){
			this.rangeBaseLayerField = rangeBaseLayerField;
		}
	},

	setSymbolBaseLayer : function(symbolBaseLayerName){
		if(symbolBaseLayerName != null){
			this.symbolBaseLayerName = symbolBaseLayerName;
		}
	},

	setSymbolBaseLayerField : function(symbolBaseLayerField){
		if(symbolBaseLayerField != null){
			this.symbolBaseLayerField = symbolBaseLayerField;
		}
	},

	setRangeChartField : function(rangeChartField){
		if(rangeChartField != null){
			this.rangeChartField = rangeChartField;
		}
	},

	setSymbolChartField : function(symbolChartField){
		if(symbolChartField != null){
			this.symbolChartField = symbolChartField;
		}
	},

	setRangeChartOption : function(rangeOption){
		if(rangeOption != null){
			this.rangeOption = rangeOption;	
			this.flag = GeoBeans.Layer.Flag.READY;
		}
	},

	setSymbolChartOption : function(symbolOption){
		if(symbolOption != null){
			this.symbolOption = symbolOption;
			this.flag = GeoBeans.Layer.Flag.READY;
		}
	},
});