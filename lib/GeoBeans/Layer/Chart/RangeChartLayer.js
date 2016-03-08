GeoBeans.Layer.RangeChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
		
	chartOption : null,
	style : null,

	styleMgr : null,

	// 色阶端点
	colors : null,

	// 最大最小值
	minMaxValue : null,

	// 标注层匹配图层
	labelLayerName : null,

	// 标注层匹配字段
	labelLayerField : null,

	// 是否需要重绘legend
	changeLegend : true,

	initialize : function(name,baseLayerName,baseLayerField,
		dbName,tableName,tableField,chartFields,option,labelLayerName,
		labelLayerField){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
		// this.style = style;
		this.chartOption = option;
		this.type = GeoBeans.Layer.ChartLayer.Type.RANGE;

		this.labelLayerName = labelLayerName;
		this.labelLayerField = labelLayerField;
	},


	cleanup : function(){
		GeoBeans.Layer.ChartLayer.prototype.cleanup.apply(this, arguments);
		this.unRegisterHitEvent();
	},

	setVisiable : function(visible){
		GeoBeans.Layer.prototype.setVisiable.apply(this, arguments);
		if(this.visible){
			if(this.hitEvent == null){
				this.registerHitEvent(this.onFeatureHit);
			}
		}else{
			if(this.hitEvent != null){
				this.unRegisterHitEvent();
			}
		}
	},


	setChartOption : function(chartOption){
		GeoBeans.Layer.ChartLayer.prototype.setChartOption.apply(this, arguments);
		// this.style = this.getChartStyle();
		this.style = this.getStyle();
		this.changeLegend = true;
		this.flag = GeoBeans.Layer.Flag.READY;
	},

	setChartFields : function(chartFields){
		this.chartFields = chartFields;
		this.changeLegend = true;
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		this.getFeatures();
		
		var uerServer = this.map.server.slice(0,this.map.server.lastIndexOf("/mgr"));;
		this.styleMgr = new GeoBeans.StyleManager(uerServer);

		// 注册点击事件
		this.registerHitEvent(this.onFeatureHit);
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
			var featureType = layer.featureType;
			if(featureType == null){
				return;
			}
			var values = feature.values;
			if(values == null){
				return;
			}
			var baseLayerFieldIndex = featureType.getFieldIndex(layer.baseLayerField);
			var fieldValue = values[baseLayerFieldIndex];
			
			if(value == null){
				value = "空";
			}
			var html = "<div>" + value + "</div>";
			var options = {
				title : fieldValue,
				width : 100,
				height : 40
			};
			var infoWindow = new GeoBeans.InfoWindow(html,options);
			layer.map.openInfoWindow(infoWindow,point);
		}
		
	},

	//获取显示数值
	getChartFeatureValue : function(id){
		var chartField = this.chartFields[0];
		var chartFieldIndex = this.chartFeatureType.getFieldIndex(chartField);
		var tableField = this.tableField;
		var tableFieldIndex = this.chartFeatureType.getFieldIndex(tableField);

		var chartFeature = null;
		for(var i = 0; i < this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
			if(chartFeature == null){
				continue;
			}
			var gid = chartFeature.gid;
			if(gid == id){
				var values = chartFeature.values;
				if(values != null) {
					var chartValue = values[chartFieldIndex];
					var tableValue = values[tableFieldIndex];
					return {
						value : chartValue,
						table : tableValue
					};
				}
			}
		}
		return "";
	},


	load : function(){
		
		var mapViewer = this.map.viewer;
		if(mapViewer != null && this.viewer != null 
			&& mapViewer.equal(this.viewer) && this.features != null
			&& this.flag == GeoBeans.Layer.Flag.LOADED){
			this.drawLegend();

			return;		
		}

		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);
		if(this.style == null){
			this.style = this.getStyle();
		}
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;

		that.setTransformation(that.map.transformation);
		that.drawLayerSnap();
		that.drawLegend();
		// this.addLegend();
		that.renderer.clearRect();
		var timer = new Date();
		that.drawLayer();
		
		// console.log("time:" + (new Date() - timer));
		that.flag = GeoBeans.Layer.Flag.LOADED;

	},

	drawLegend : function(){
		if(this.changeLegend){
			this.removeLegend();
			this.addLegend();
			this.changeLegend = false;
		}else{

		}
		// this.removeLegend();
		// this.addLegend();
	},

	// 获得图例
	addLegend : function(){
		if(this.minMaxValue == null || this.minMaxValue.min == null
			|| this.minMaxValue.max == null){
			return;
		}
		var symbolizer = null;
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
		var html = "<div class='chart-legend chart-legend-range' id='" + this.name + "' style='left:" + left + "px'>";
		html += "<div class='chart-legend-title'>"
		+	"<h5>" + this.chartFields[0] + "</h5>"
		 +	"</div>";
		html +=	"<div class='chart-legend-canvas'>"
		+ 	"	<canvas width='20' height='200'></canvas>"
		+	"</div>"
		+ 	"<div class='chart-legend-value'>"
		+	"<div class='chart-legend-max'>"
		+ 	this.minMaxValue.max
		+ 	"</div>"
		+	"<div class='chart-legend-min'>"
		+	this.minMaxValue.min
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


	// 修改了获取方式之后不用。
	getChartStyle : function(){
		if(this.chartFeatures == null || this.chartOption == null){
			return null;
		}
		var minMaxValue =  this.getMinMaxValue();
		if(minMaxValue == null){
			return null;
		}

		this.minMaxValue = minMaxValue;
		var count = this.chartFeatures.length;
		var colorMapID = this.chartOption.colorMapID;
		var colorMap = this.styleMgr.getColorMapByID(colorMapID);
		this.colorMap = colorMap;

		var colorRangeMap = new GeoBeans.ColorRangeMap(this.colorMap.startColor,
			this.colorMap.endColor,minMaxValue.min,minMaxValue.max);

		var chartField = this.chartFields[0];
		var chartFieldIndex = this.chartFeatureType.getFieldIndex(chartField);
		
		var tableField = this.tableField;
		var tableFieldIndex = this.chartFeatureType.getFieldIndex(tableField);

		var style = new GeoBeans.Style.FeatureStyle("chart",
			GeoBeans.Style.FeatureStyle.GeomType.Polygon);
		var rules = [];

		var chartFeature = null;
		for(var i = 0; i < count; ++i){
			chartFeature = this.chartFeatures[i];
			if(chartFeature == null){
				continue;
			}
			var values = chartFeature.values;
			if(values == null){
				continue;
			}
			var value = values[chartFieldIndex];
			value = parseFloat(value);
			if(value == null){
				continue;
			}
			var tableFieldValue = values[tableFieldIndex];
			var color = colorRangeMap.getValue(value);
			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();

			if(this.chartOption.opacity != null){
				color.setOpacity(this.chartOption.opacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.fill.color = color;

			color = new GeoBeans.Color();
			if(this.chartOption.border != null){
				color.setByHex(this.chartOption.border,1);
			}
			if(this.chartOption.borderOpacity != null){
				color.setOpacity(this.chartOption.borderOpacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.stroke.color = color;	

			var filter = new GeoBeans.IDFilter();
			filter.addID(chartFeature.gid);


			var color = new GeoBeans.Color();
			var fill = new GeoBeans.Fill();
			fill.color = color;

			
			var rule = new GeoBeans.Rule();
			rule.filter = filter;
			rule.name = tableFieldValue;
			rule.symbolizer = symbolizer;
			rules.push(rule);
		}
		style.rules = rules;
		return style;

	},


	//获得文字样式,暂时不用
	getLabelLayer : function(){
		var layer = this.map.getLayer(this.labelLayerName);
		if(layer == null){
			return null;
		}
		var featureType = layer.featureType;
		var labelLayerGeomField = featureType.geomFieldName;
		var fields = [this.labelLayerField,labelLayerGeomField];
		var features = featureType.getFeaturesFilter(this.map.name,
			null,null,null,null,fields);
		var labelLayerFieldIndex = featureType.getFieldIndex(this.labelLayerField);
		var feature = null;
		// var labelValue = null;
		
		// 匹配字段
		var tableFieldIndex = this.chartFeatureType.getFieldIndex(this.tableField);
		var chartFieldIndex = this.chartFeatureType.getFieldIndex(this.chartFields[0]);

		var featureLayer = new GeoBeans.Layer.FeatureLayer("label");
		featureLayer.features = [];

		var style = new GeoBeans.Style.FeatureStyle("label",
			GeoBeans.Style.FeatureStyle.GeomType.Point);
		var rules = [];

		// 筛选有效的feature
		for(var i = 0; i < features.length; ++i){
			feature = features[i];
			if(feature == null){
				continue;
			}
			var featureValues = feature.values;
			if(featureValues == null){
				continue;
			}
			var featureValue = featureValues[labelLayerFieldIndex];
			for(var j = 0; j < this.chartFeatures.length; ++j){
				var chartFeature = this.chartFeatures[j];
				if(chartFeature == null){
					continue;
				}
				var chartValues = chartFeature.values;
				if(chartValues == null){
					continue;
				}
				var chartValue = chartValues[tableFieldIndex];
				if(chartValue == featureValue){
					featureLayer.addFeature(feature);

					var value = chartValues[chartFieldIndex];
					var rule = new GeoBeans.Rule();

					var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
					textSymbolizer.labelText = value;
					var font = new GeoBeans.Font();
					font.family = "SimSun";
					font.style = "normal";
					font.weight = "normal";
					font.size = "18";
					textSymbolizer.font = font;
					var color = new GeoBeans.Color();
					color.setByHex("#f500c0",1.0);
					var fill = new GeoBeans.Fill();
					fill.color = color;
					textSymbolizer.fill = fill;
					textSymbolizer.stroke = null;
					var filter = new GeoBeans.IDFilter();
					filter.addID(feature.fid);
					rule.textSymbolizer = textSymbolizer;
					rule.filter = filter;
					rules.push(rule);
				}
			}
		}
		
		style.rules = rules;
		featureLayer.style = style;
		return featureLayer;
	},


	getFeatures : function(){
		if(this.baseLayerName == null || this.baseLayerField == null
			|| this.dbName == null || this.tableName == null 
			|| this.tableField == null){
			return;
		}	
		
		var layer = this.map.getLayer(this.baseLayerName);
		if(layer == null){
			return;
		}
		//计算表的要素
		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var tableFeatureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		this.chartFeatureType = tableFeatureType;
		var tableFields = tableFeatureType.getFields(null,this.dbName);

		var tableFeatures = tableFeatureType.getFeaturesFilter(null,
			this.dbName,null,null,null,[this.tableField].concat(this.chartFields));
		var tableFieldIndex = tableFeatureType.getFieldIndex(this.tableField);
		if(tableFieldIndex == -1){
			return;
		}
		var chartFieldIndex = tableFeatureType.getFieldIndex(this.chartFields[0]);


		// 计算底图
		// var baseLayerFeatureType = layer.featureType;
		var baseLayerFeatureType = layer.getFeatureType();
		var baseLayerGeomField = baseLayerFeatureType.geomFieldName;
		var fields = [this.baseLayerField,baseLayerGeomField];
		var baseLayerFeatures = baseLayerFeatureType.getFeaturesFilter(this.map.name,
			null,null,null,null,fields);
		var baseLayerFields = layer.getFields();
		var baseLayerFieldIndex = baseLayerFeatureType.getFieldIndex(this.baseLayerField);
		if(baseLayerFieldIndex == -1){
			return;
		}

		for(var i = 0; i < baseLayerFeatures.length; ++i){
			var feature = baseLayerFeatures[i];
			if(feature == null){
				continue;
			}
			var values = feature.values;
			if(values == null){
				continue;
			}
			var value = values[baseLayerFieldIndex];
			for(var j = 0; j < tableFeatures.length; ++j){
				var tableFeature = tableFeatures[j];
				if(tableFeature == null){
					continue;
				}
				var tableValues = tableFeature.values;
				if(tableValues == null){
					continue;
				}
				var tableValue = tableValues[tableFieldIndex];
				if(value == tableValue){
					var chartValue = tableValues[chartFieldIndex];
					feature.chartValue = chartValue;
				}
			}

		}
		// return baseLayerFeatures;
		this.features = baseLayerFeatures;
		this.featureType = baseLayerFeatureType;
	},


	// 根据baseLayer来获取
	getStyle : function(){
		if(this.features == null || this.chartOption == null){
			return null;
		}
		var minMaxValue =  this.getMinMaxValue();
		if(minMaxValue == null){
			return null;
		}

		this.minMaxValue = minMaxValue;
		var count = this.features.length;
		var colorMapID = this.chartOption.colorMapID;
		// var colors = this.styleMgr.getColorMap(colorMapID,2);
		// this.colors = colors;
		var colorMap = this.styleMgr.getColorMapByID(colorMapID);
		this.colorMap = colorMap;

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
			var chartValue = feature.chartValue;

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

			if(this.chartOption.opacity != null){
				color.setOpacity(this.chartOption.opacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.fill.color = color;

			// stroke
			color = new GeoBeans.Color();
			if(this.chartOption.border != null){
				color.setByHex(this.chartOption.border,1);
			}
			if(this.chartOption.borderOpacity != null){
				color.setOpacity(this.chartOption.borderOpacity);
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

	// 根据baseLayer的feature来获取
	getMinMaxValue : function(){
		if(this.features == null){
			return null;
		}
		var min = null;
		var max = null;
		var feature = null;
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			var value = feature.chartValue;
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
		return {
			min : min,
			max : max
		};
	},
});