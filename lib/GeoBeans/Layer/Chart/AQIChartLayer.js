GeoBeans.Layer.AQIChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要显示的字段
	chartField : null,

	// 辅助字段
	labelField : null,

	// 时间字段
	timeField : null,

	// 时间点
	timePoint  : null,

	styleMgr : null,

	// 所有的要素
	featuresAll : null,

	// 所有的标注点的信息
	tipInfos  : null,

	// 标志字段 station_code
	flagField : null,

	// 是否需要重绘legend
	changeLegend : true,

	// 色阶
	colorMap : null,

	initialize : function(name,dbName,tableName,chartField,labelField,
		flagField,timeField,timePoint,chartOption){
		this.name = name;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartField = chartField;
		this.labelField = labelField;
		this.flagField = flagField;
		this.timeField = timeField;
		this.timePoint = timePoint;		
		this.chartOption = chartOption;
		this.type = GeoBeans.Layer.ChartLayer.Type.AQI;
	},

	setChartOption : function(chartOption){
		this.chartOption = chartOption;
		this.features = null;
		this.changeLegend = true;
		var colorMapID = this.chartOption.colorMapID;
		var colorMap = this.styleMgr.getColorMapByID(colorMapID);
		this.colorMap = colorMap;
	},

	getChartField : function(){
		return this.chartField;
	},

	setChartField : function(chartField){
		this.chartField = chartField;
		this.features = null;
		this.changeLegend = true;
	},

	getFlagField : function(){
		return this.flagField;
	},

	getTimeField : function(){
		return this.timeField;
	},


	getTimePoint : function(){
		return this.timePoint;
	},

	setTimePoint : function(timePoint){
		this.timePoint = timePoint;
		this.features = null;
	},

	getLableField : function(){
		return this.labelField;
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var featureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		this.featureType = featureType;
		var tableFields = featureType.getFields(null,this.dbName);

		this.styleMgr = new GeoBeans.StyleManager(this.map.server);
		var colorMapID = this.chartOption.colorMapID;
		// var colors = this.styleMgr.getColorMap(colorMapID,2);
		// this.colors = colors;
		var colorMap = this.styleMgr.getColorMapByID(colorMapID);
		this.colorMap = colorMap;
	},


	load : function(){

		var mapViewer = this.map.viewer;
		// if(this.features == null){
		// 	this.getFeatures();
		// }

		// 获取最大最小值
		if(this.minMaxValue == null){
			var minMaxValue =  this.getMinMaxValue();
			if(minMaxValue == null){
				return;
			}
			this.minMaxValue = minMaxValue;
		}

		this.drawLegend();
		
		if(mapViewer != null && this.viewer != null 
			&& mapViewer.equal(this.viewer) && this.features != null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			this.drawLegend();
			// this.drawLayerSnap();
			// this.renderer.clearRect();
			// this.showTips();
			// this.drawLayer();
			
			return;		
		}

		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);
		// this.features = this.getCurrentViewerFeatures(this.viewer);
		this.getFeatures();
		
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;

		that.setTransformation(that.map.transformation);
		that.drawLayerSnap();
		that.renderer.clearRect();
		var timer = new Date();
		this.showTips();
		that.drawLayer();
		that.drawLegend();
		console.log("time:" + (new Date() - timer));
		// that.map.drawLayersAll();
		that.flag = GeoBeans.Layer.Flag.LOADED;

	},

	// 画图例
	drawLegend : function(){
		if(this.changeLegend){
			this.removeLegend();
			this.addLegend();	
			this.changeLegend = false;		
		}
		if(this.visible){
			this.showLegend();
		}else{
			this.hideLegend();
			return;		
		}
	},
	getFeatures : function(){
		var filter = new GeoBeans.BinaryLogicFilter();
		filter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprAnd;

		var timeFilter = new GeoBeans.BinaryComparisionFilter();
		timeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.PropertyName();
		prop.setName(this.timeField);
		// prop.setName("gid");
		var literal =  new GeoBeans.Literal();
		literal.setValue(this.timePoint);
		// literal.setValue("1");
		timeFilter.expression1 = prop;
		timeFilter.expression2 = literal;
		filter.addFilter(timeFilter);


		var geomField = this.featureType.geomFieldName;
		var viewer = this.map.viewer;
		var bboxFilter = new GeoBeans.BBoxFilter();
		bboxFilter.extent = viewer;
		prop = new GeoBeans.PropertyName();
		prop.setName(geomField);
		bboxFilter.propName = prop;
		filter.addFilter(bboxFilter);


		
		var features = this.featureType.getFeaturesFilter(null,
			this.dbName,filter,null,null,[this.chartField,geomField,
			this.labelField,this.flagField]);

		// this.featuresAll = features;	
		this.features = features;
		this.style = this.getStyle();
	},


	showTips : function(){
		if(this.features == null || this.chartOption == null
			|| this.colorMap == null || this.minMaxValue == null){
			return;
		}

		this.tipInfos = [];

		// 渐变色
		var colorRangeMap = new GeoBeans.ColorRangeMap(this.colorMap.startColor,
			this.colorMap.endColor,this.minMaxValue.min,this.minMaxValue.max);

		var chartFieldIndex = this.featureType.getFieldIndex(this.chartField);
		var labelFieldIndex = this.featureType.getFieldIndex(this.labelField);
		var flagFieldIndex = this.featureType.getFieldIndex(this.flagField);
		var value = null;

		var feature = null;
		var geometry = null;
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			geometry = feature.geometry;
			if(geometry == null){
				continue;
			}
			var values = feature.values;
			if(values == null){
				continue;
			}
			
			value = values[chartFieldIndex];
			value = parseFloat(value);
			// 差值获得的颜色
			var colorValue = colorRangeMap.getValue(value);

			var rule = new GeoBeans.Rule();
			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
			var fill = new GeoBeans.Fill();
			fill.color = colorValue;
			symbolizer.fill = fill;
			var stroke = new GeoBeans.Stroke();
			// color = new GeoBeans.Color();
			// color.setByHex("#000000",1.0);
			stroke.color = colorValue;
			stroke.width = 0.5;
			symbolizer.stroke = stroke;
			rule.symbolizer = symbolizer;

			var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
			textSymbolizer.labelText = value;
			var font = new GeoBeans.Font();
			font.family = "宋体";
			font.style = "normal";
			font.weight = "normal";
			font.size = "12";		
			textSymbolizer.font = font;
			var color = new GeoBeans.Color();
			color.setByHex("#ffffff",1.0);
			var fill = new GeoBeans.Fill();
			fill.color = color;
			textSymbolizer.fill = fill;
			rule.textSymbolizer = textSymbolizer;


			// 标注
			var label = values[labelFieldIndex];
			var labelRule = new GeoBeans.Rule();
			var labelSymbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();	
			var fill = new GeoBeans.Fill();
			color = new GeoBeans.Color();
			color.setByHex("#ffffff",1.0);
			fill.color = color;
			labelSymbolizer.fill = fill;
			var stroke = new GeoBeans.Stroke();
			stroke.color = colorValue;
			stroke.width = 0.5;
			labelSymbolizer.stroke = stroke;
			labelRule.symbolizer = labelSymbolizer;

			var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
			textSymbolizer.labelText = label;
			var font = new GeoBeans.Font();
			font.family = "宋体";
			font.style = "normal";
			font.weight = "normal";
			font.size = "12";		
			textSymbolizer.font = font;
			var color = new GeoBeans.Color();
			color.setByHex("#000000",1.0);
			var fill = new GeoBeans.Fill();
			fill.color = color;
			textSymbolizer.fill = fill;
			labelRule.textSymbolizer = textSymbolizer;

			var flagValue = values[flagFieldIndex];
			var tipViewer = this.renderer.drawTip(geometry,this.map.transformation,rule,labelRule);
			var tipInfo = {
				flag : flagValue,
				viewer : tipViewer,
				name : label
			};
			this.tipInfos.push(tipInfo);
		}
	},

	// 根据指数名称来确定图例的大小值
	getMinMaxValue : function(){
		var chartField = this.chartField;
		var min = 0;
		var max = 500;
		switch(chartField){
			case "aqi":{
				min = 0;
				max = 500;
				break;
			}
			case "co":{
				min = 0;
				max = 90;
				break;
			}
			case "co_24h":{
				min = 0;
				max = 90;
				break;
			}
			case "no2":{
				min = 0;
				max = 100;
				break;
			}
			case "no2_24h":{
				min = 0;
				max = 100;
				break;
			}
			case "o3":{
				min = 0;
				max = 200;
				break;
			}
			case "o3_24h":{
				min = 0;
				max = 200;
				break;
			}
			case "o3_8h":{
				min = 0;
				max = 200;
				break;
			}
			case "o3_8h_24h":{
				min = 0;
				max = 200;
				break;
			}
			case "pm10":{
				min = 0;
				max = 500;
				break;
			}
			case "pm10_24":{
				min = 0;
				max = 500;
				break;
			}
			case "pm2_5":{
				min = 0;
				max = 300;
				break;
			}
			case "pm_2_5_24h":{
				min = 0;
				max = 300;
				break;
			}
			case "so2":{
				min = 0;
				max = 500;
				break;
			}
			case "so2_24h":{
				min = 0;
				max = 500;
				break;
			}
			default:{
				min = 0;
				max = 500;
				break;
			}
		}
		return {
			min : min,
			max : max
		}
	},




	getStyle : function(){
		var style = new GeoBeans.Style.FeatureStyle("default",
			GeoBeans.Style.FeatureStyle.GeomType.Point);
		var rule = new GeoBeans.Rule();
		var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		var color = new GeoBeans.Color();
		color.setByHex("#A4C3F2",1.0);
		symbolizer.fill.color = color;
		color = new GeoBeans.Color();
		color.setByHex("#808000",0.1);
		symbolizer.stroke.color = color;
		symbolizer.size = 1;
		rule.symbolizer = symbolizer;

		// var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
		// textSymbolizer.labelProp = "position_name";
		// var font = new GeoBeans.Font();
		// font.family = "Microsoft YaHei";
		// font.style = "normal";
		// font.weight = "normal";
		// font.size = "12";
		// textSymbolizer.font = font;
		// var color = new GeoBeans.Color();
		// color.setByHex("#000000",1.0);
		// var fill = new GeoBeans.Fill();
		// fill.color = color;
		// textSymbolizer.fill = fill;
		// textSymbolizer.stroke = null;
		// rule.textSymbolizer = textSymbolizer;

		style.addRule(rule);
		return style;
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
		var html = "<div class='chart-legend chart-legend-aqi' id='" + this.name + "'>";
		html += "<div class='chart-legend-title'>"
		+	"<h5>" + this.chartField + "</h5>"
		 +	"</div>"
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


		 // ctx.clearRect(0,0,canvas.width,canvas.height);
	  //   ctx.save();
	  //   ctx.translate(canvas.width/2,canvas.height/2);
	  //   ctx.rotate(degrees*Math.PI/180);
	  //   ctx.drawImage(image,-image.width/2,-image.width/2);
	  //   ctx.restore();
	},


	// // 一旦改变了参数
	// setChartOption : function(chartOption){
	// 	this.chartOption = chartOption;
	// 	if(this.chartOption != null){
	// 		var colorMapID = this.chartOption.colorMapID;
	// 		var colors = this.styleMgr.getColorMap(colorMapID,2);
	// 		this.colors = colors;			
	// 	}
	// },

	// 获得当前范围内的feature
	getCurrentViewerFeatures : function(viewer){
		if(this.featuresAll == null || viewer == null){
			return [];
		}
		var features = [];
		var feature = null;
		var geometry = null;
		var x,y;
		for(var i = 0; i < this.featuresAll.length; ++i){
			feature = this.featuresAll[i];
			if(feature == null){
				continue;
			}
			geometry = feature.geometry;
			if(geometry == null){
				continue;
			}
			x = geometry.x;
			y = geometry.y;
			if(viewer.contain(x,y)){
				features.push(feature);
			}
		}
		return features;
	},

	// 弹出详细信息
	registerHitEvent : function(infoWindowContent,callback){
		var that = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 3;

		this.hitEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
				var point = new GeoBeans.Geometry.Point(x_o,y_o);
				var point_s = that.map.transformation.toMapPoint(point.x,point.y);
				var tipInfo = that.getTipInfo(point);
				if(tipInfo != null){
					// var html = "<a href='javascript:void(0)' class='aqi_info' flag='" + tipInfo.flag + "'>点击查看详细信息</div>";
					var option = {
						title : tipInfo.name
					};
					var infoWindow = new GeoBeans.InfoWindow(infoWindowContent,option);
					that.map.openInfoWindow(infoWindow,point_s);
					if(callback != null){
						callback(tipInfo.flag,tipInfo.name,that);
					}
				}
			}else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					x_o = evt.layerX;
					y_o = evt.layerY;

					var point = new GeoBeans.Geometry.Point(x_o,y_o);
					var point_s = that.map.transformation.toMapPoint(point.x,point.y);
					var tipInfo = that.getTipInfo(point);
					if(tipInfo != null){
						// var html = "<a href='javascript:void(0)' class='aqi_info' flag='" + tipInfo.flag + "'>点击查看详细信息</div>";
						var option = {
							title : tipInfo.name
						};
						var infoWindow = new GeoBeans.InfoWindow(infoWindowContent,option);
						that.map.openInfoWindow(infoWindow,point_s);
						if(callback != null){
							callback(tipInfo.flag,tipInfo.name,that);
						}
					}

				}
			}
		};

		var x_m = null;
		var y_m = null;
		this.moveEvent = function(evt){
			if(x_m==null){
				x_m = evt.layerX;
				y_m = evt.layerY;
			}else{
				var dis = Math.abs(evt.layerX-x_m) + Math.abs(evt.layerY-y_m);
				if(dis > tolerance){
					x_m = evt.layerX;
					y_m = evt.layerY;

					var point = new GeoBeans.Geometry.Point(x_m,y_m);
					var point_s = that.map.transformation.toMapPoint(point.x,point.y);
					var tipInfo = that.getTipInfo(point);
					if(tipInfo != null){
						document.body.style.cursor = 'pointer';
					}else{
						document.body.style.cursor = 'default';
					}
				}

			}
		};

		this.map.canvas.addEventListener('click', this.hitEvent);
		this.map.canvas.addEventListener('mousemove', this.moveEvent);
	},

	unRegisterHitEvent : function(){
		this.map.canvas.removeEventListener('click',this.hitEvent);
		this.map.canvas.removeEventListener('mousemove',this.moveEvent);
		this.hitEvent = null;
		this.moveEvent = null;
	},

	setVisiable : function(visible){
		GeoBeans.Layer.prototype.setVisiable.apply(this, arguments);
		if(this.visible){
			if(this.hitEvent != null){
				this.map.canvas.addEventListener('click', this.hitEvent);
				this.map.canvas.addEventListener('mousemove', this.moveEvent);
			}
		}else{
			if(this.hitEvent != null){
				this.map.canvas.removeEventListener('click',this.hitEvent);
				this.map.canvas.removeEventListener('mousemove',this.moveEvent);
			}
		}
	},

	// 返回点击点的tip
	getTipInfo : function(point){
		var tipInfo = null;
		var tipViewer = null;
		for(var i = this.tipInfos.length; i >=0; i--){
			tipInfo = this.tipInfos[i];
			if(tipInfo == null){
				continue;
			}
			tipViewer = tipInfo.viewer;
			if(tipViewer.contain(point.x,point.y)){
				return tipInfo;
			}
		}
		return null;
	},
});