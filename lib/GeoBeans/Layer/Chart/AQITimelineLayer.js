GeoBeans.Layer.AQITimelineLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要显示的字段
	chartField : null,

	// 辅助字段
	labelField : null,

	// 时间点
	timePoints  : null,

	styleMgr : null,

	// 标志字段 station_code
	flagField : null,

	//时间字段
	timeField : null,

	// 下属的图层
	chartLayers : null,

	interval : null,

	currentLayerID : null,

	// 时间轴
	timeline : null,

	initialize : function(name,dbName,tableName,chartField,labelField,flagField,
		timeField,timePoints,interval,chartOption){
		this.name = name;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartField = chartField;
		this.labelField = labelField;
		this.flagField = flagField;
		this.timeField = timeField;
		this.timePoints = timePoints;
		this.interval = interval;		
		this.chartOption = chartOption;
		this.chartLayers = [];
		this.type = GeoBeans.Layer.ChartLayer.Type.AQITIMELINE;
	},


	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var timePoint = null;
		for(var i = 0; i < this.timePoints.length; ++i){
			timePoint = this.timePoints[i];
			if(timePoint == null){
				continue;
			}
			var layer = new GeoBeans.Layer.AQIChartLayer("aqi-timline",this.dbName,
				this.tableName,this.chartField,this.labelField,this.flagField,
				this.timeField,timePoint,this.chartOption);
			layer.setMap(this.map,true);
			this.chartLayers.push(layer);
		}
		this.currentLayerID = 0;

		this.timeline = new GeoBeans.TimeLineBar(this);

		map._addLegend(this);
		if(this.chartLayers.length > 0){
			this.colorMap = this.chartLayers[0].colorMap;
		}
		
	},

	cleanup : function(){
		GeoBeans.Layer.ChartLayer.prototype.cleanup.apply(this, arguments);
		this.timeline.cleanup();
		for(var i = 0; i < this.chartLayers.length;++i){
			this.chartLayers[i].cleanup();
		}
	},

	load : function(){
		if(this.minMaxValue == null){
			this.minMaxValue = this.getMinMaxValue();
		}
		this.drawLegend();
		if(this.chartLayers == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			return;
		}
		this.setTransformation(this.map.transformation);
		this.drawLayerSnap();
		this.renderer.clearRect();
		var chartLayers = this.chartLayers;
		var layer = chartLayers[this.currentLayerID];
		if(layer != null){
			layer.load();
			var canvas = layer.canvas;
			if(canvas != null && layer.flag == GeoBeans.Layer.Flag.LOADED){
				this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			}
		}
		
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	drawLegend : function(){
		if(this.chartLayers.length == 0){
			return;
		}
		var layer = this.chartLayers[0];
		if(layer.changeLegend){
			this.removeLegend();
			this.addLegend();
			layer.changeLegend = false;
		}else{
			var legend = this.map.mapDiv.find(".chart-legend#" + this.name);
			var legendIndex = parseInt(legend.attr("lindex"));
			if(legendIndex  != this.legendIndex){
				this.removeLegend();
				this.addLegend();
			}
		}
		if(this.visible){
			this.showLegend();
		}else{
			this.hideLegend();
			return;		
		}
	},

	getChartField : function(){
		return this.chartField;
	},

	getTimePoints : function(){
		return this.timePoints;
	},



	setTimePoints : function(timePoints){
		this.timePoints = timePoints;
		for(var i = 0; i < this.chartLayers.length;++i){
			var layer  = this.chartLayers[i];
			if(layer != null){
				layer.cleanup();
			}
		}
		this.chartLayers = [];
		for(var i = 0; i < this.timePoints.length; ++i){
			timePoint = this.timePoints[i];
			if(timePoint == null){
				continue;
			}
			var layer = new GeoBeans.Layer.AQIChartLayer(this.name,this.dbName,
				this.tableName,this.chartField,this.labelField,this.flagField,
				this.timeField,timePoint,this.chartOption);
			layer.setMap(this.map);
			this.chartLayers.push(layer);
		}
		this.currentLayerID = 0;
		// 重设时间轴
		this.timeline.cleanup();
		this.timeline = new GeoBeans.TimeLineBar(this);
	},

	setChartOption : function(chartOption){
		this.chartOption = chartOption;
		var layer = null;
		for(var i = 0; i < this.chartLayers.length;++i){
			layer = this.chartLayers[i];
			if(layer != null){
				layer.features = null;
				layer.changeLegend = true;
				layer.setChartOption(chartOption);
			}
		}
	},

	setChartField : function(chartField){
		this.chartField = chartField;
		for(var i = 0; i < this.chartLayers.length;++i){
			layer = this.chartLayers[i];
			if(layer != null){
				layer.features = null;
				layer.changeLegend = true;
				layer.setChartField(chartField);
			}
		}		
	},

	getInterval : function(){
		return this.interval;
	},

	setInterval : function(interval){
		this.interval = interval;
		this.timeline.cleanup();
		this.timeline = new GeoBeans.TimeLineBar(this);
	},

	setVisiable : function(visible){
		GeoBeans.Layer.prototype.setVisiable.apply(this, arguments);
		if(this.visible){
			this.timeline.show();
		}else{
			this.timeline.hide();
		}
	},

	getMinMaxValue : function(){
		if(this.chartLayers.length > 0){
			return this.chartLayers[0].getMinMaxValue();
		}else{
			return null;
		}
		
	},

	// 获得图例
	addLegend : function(){
		if(this.minMaxValue == null || this.minMaxValue.min == null
			|| this.minMaxValue.max == null){
			return;
		}

		var left = 0;
		if(this.legendIndex == 0){
			left = 10;
		}else{
			var lastIndex = this.legendIndex - 1;
			var last = this.map.mapDiv.find(".chart-legend[lindex='" +  lastIndex + "']");
			if(last.length != 0){
				var l = last.css("left");
				var w = last.css("width");
				l = parseInt(l.replace("px",""));
				w = parseInt(w.replace("px",""));
				left = l  + w + 5;	
			}
		}

		var symbolizer = null;
		var color = null;
		var fill = null;
		var rule = null;
		var colorValue = null;
		var label = null;
		var html = "";
		var html = "<div class='chart-legend chart-legend-aqi' id='" + this.name 
		+ "' style='left:" + left + "px' lindex='" + this.legendIndex + "'>";
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

	},
});