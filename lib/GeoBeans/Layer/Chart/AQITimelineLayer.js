GeoBeans.Layer.AQITimelineLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要显示的字段
	chartField : null,

	// 辅助字段
	labelField : null,

	// 时间点
	timePoints  : null,

	styleMgr : null,

	// 所有的要素
	// featuresAll : null,

	// // 所有的标注点的信息
	// tipInfos  : null,

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
			var layer = new GeoBeans.Layer.AQIChartLayer(this.name,this.dbName,
				this.tableName,this.chartField,this.labelField,this.flagField,
				this.timeField,timePoint,this.chartOption);
			layer.setMap(this.map);
			this.chartLayers.push(layer);
		}
		this.currentLayerID = 0;

		this.timeline = new GeoBeans.TimeLineBar(this);

	},

	cleanup : function(){
		GeoBeans.Layer.ChartLayer.prototype.cleanup.apply(this, arguments);
		this.timeline.cleanup();
	},

	load : function(){
		if(this.chartLayers == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;;
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
			if(canvas != null){
				this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			}
		}
		
		this.flag = GeoBeans.Layer.Flag.LOADED;
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

});