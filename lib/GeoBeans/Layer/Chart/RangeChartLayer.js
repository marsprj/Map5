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

	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);
		if(this.features == null){
			var layer = this.map.getLayer(this.baseLayerName);
			if(layer == null){
				return;
			}
			var featureType = layer.featureType;
			if(featureType == null){
				return;
			}
			var geomFieldName = featureType.geomFieldName;
			if(geomFieldName == null){
				return;
			}
			var features = layer.getFeatureFilter(null,null,null,[geomFieldName]);
			this.features = features;
		}
		this.styleMgr = new GeoBeans.StyleManager(this.map.server);

		// 注册点击事件
		this.registerHitEvent(this.onFeatureHit);
	},

	onFeatureHit : function(layer,selection,point){
		console.log(selection.length);
		if(selection.length == 0){
			layer.map.closeInfoWindow();
		}else{
			var feature = selection[0];
			var id = feature.fid;
			var chartFeatureValueObj = layer.getChartFeatureValue(id);
			var html = "<div>" + chartFeatureValueObj.value + "</div>";
			var options = {
				title : chartFeatureValueObj.table,
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
		// var labelLayer = this.getLabelLayer();
		// labelLayer.setVisiable(false);
		this.removeLegend();
		this.addLegend();
		if(this.visible){
			this.showLegend();
		}else{
			// this.renderer.clearRect();
			this.hideLegend();
			return;		
		}
		
		var mapViewer = this.map.viewer;
		if(mapViewer != null && this.viewer != null 
			&& mapViewer.equal(this.viewer) && this.features != null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			// 暂且不绘制
			// this.drawLayerSnap();
			// this.renderer.clearRect();
			// this.drawLayer();

			// if(labelLayer != null && labelLayer.visiable){
			// 	labelLayer.setMap(this.map);
			// 	labelLayer.renderer.clearRect();
			// 	labelLayer.drawLayer();
			// 	var canvas = labelLayer.canvas;
			// 	this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			// }
			return;		
		}

		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);
		if(this.style == null){
			var style = this.getChartStyle();
			this.style = style;
		}
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;

		that.setTransformation(that.map.transformation);
		that.drawLayerSnap();
		that.renderer.clearRect();
		var timer = new Date();
		that.drawLayer();
		// if(labelLayer != null){
		// 	labelLayer.setMap(this.map);
		// 	labelLayer.renderer.clearRect();
		// 	labelLayer.drawLayer();
		// 	var canvas = labelLayer.canvas;
		// 	this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
		// }
		console.log("time:" + (new Date() - timer));
		that.map.drawLayersAll();
		that.flag = GeoBeans.Layer.Flag.LOADED;



		// var features = this.featureType.getFeatureBBoxGet(this.map.name,null,
		// 	this.viewer,null,null);
		// that.features = features;
		// that.setTransformation(that.map.transformation);
		// that.drawLayerSnap();
		// that.renderer.clearRect();
		//  var timer = new Date();
		// that.drawLayer();
		// console.log("time:" + (new Date() - timer));
		// that.map.drawLayersAll();
		// that.flag = GeoBeans.Layer.Flag.LOADED;

	},

	// 获得图例
	addLegend : function(){
		if(this.style == null){
			return null;
		}
		var rules = this.style.rules;
		if(rules == null){
			return null;
		}
		var symbolizer = null;
		var color = null;
		var fill = null;
		var rule = null;
		var colorValue = null;
		var label = null;
		var html = "";
		var html = "<div class='chart-legend chart-legend-range' id='" + this.name + "'>";
		html += "<div class='chart-legend-title'>"
		+	"<h5>" + this.chartFields[0] + "</h5>"
		 +	"</div>"
		html +=	"<div class='chart-legend-canvas'>"
		+ 	"	<canvas width='20' height='200'></canvas>"
		+	"</div>"
		+ 	"<div class='chart-legend-value'>"
		+	"<div class='chart-legend-min'>"
		+ 	this.minMaxValue.min
		+ 	"</div>"
		+	"<div class='chart-legend-max'>"
		+	this.minMaxValue.max
		+	"</div>"		
		+	"</div>"
		
		html += "</div>";
		this.map.mapDiv.append(html);
		var canvas = this.map.mapDiv.find("#"+this.name + " .chart-legend-canvas canvas");
		var ctx = canvas[0].getContext('2d');
		var bColor = this.colors[0];
		var eColor = this.colors[1];
		var grd = ctx.createLinearGradient(0,0,0,200);
		grd.addColorStop(0.0,bColor);
		grd.addColorStop(1.0,eColor);
		ctx.fillStyle  = grd;
		ctx.fillRect(0,0,20,200);
	},


	addLegend2 : function(){
		this.renderer.save();
		var bColor = this.colors[0];
		var eColor = this.colors[1];
		var x = 200;
		var y = this.canvas.height - 200 - 20;
		var grd = this.renderer.context.createLinearGradient(x,y,x,y+200);
		grd.addColorStop(0.0,bColor);
		grd.addColorStop(1.0,eColor);
		
		this.renderer.context.fillStyle  = grd;
		this.renderer.context.fillRect(x,y,20,200);
		this.renderer.restore();
	},


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
		var colors = this.styleMgr.getColorMap(colorMapID,2);
		this.colors = colors;
		var colorRangeMap = new GeoBeans.ColorRangeMap(colors[0],colors[1],
			minMaxValue.min,minMaxValue.max);

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


	// 获得最大最小值
	getMinMaxValue : function(){
		var chartFeature = null;
		var min = null;
		var max = null;

		if(this.chartFields == null){
			return null;
		}

		var chartField = this.chartFields[0];
		var chartFieldIndex = this.chartFeatureType.getFieldIndex(chartField);
		
		for(var i = 0; i < this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
			if(chartFeature == null){
				return;
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


	//获得文字样式
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
});