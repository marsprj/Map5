GeoBeans.Layer.AQITimelineLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要显示的字段
	chartField : null,

	// 辅助字段
	labelField : null,

	// 时间点
	timePoint  : null,

	styleMgr : null,

	// 所有的要素
	// featuresAll : null,

	// // 所有的标注点的信息
	// tipInfos  : null,

	// 标志字段 station_code
	flagField : null,

	// 下属的图层
	chartLayers : null,

	interval : null,

	currentLayerID : null,



	initialize : function(name,dbName,tableName,chartField,labelField,flagField,timePoints,interval,chartOption){
		this.name = name;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartField = chartField;
		this.labelField = labelField;
		this.flagField = flagField;
		this.timePoints = timePoints;
		this.interval = interval;		
		this.chartOption = chartOption;
		this.chartLayers = [];
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		// this.layers = [];
		var timePoint = null;
		for(var i = 0; i < this.timePoints.length; ++i){
			timePoint = this.timePoints[i];
			if(timePoint == null){
				continue;
			}
			var layer = new GeoBeans.Layer.AQIChartLayer(this.name+"-"+i,this.dbName,
				this.tableName,this.chartField,this.labelField,this.flagField,
				timePoint,this.chartOption);
			layer.setMap(this.map);
			this.chartLayers.push(layer);
		}
		console.log(this.chartLayers.length);
		this.currentLayerID = 0;

		var timeline = new GeoBeans.Timeline(this.interval,this.timePoints);
		timeline.setMap(this.map);
		this.timeline = timeline;
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
			// 时间轴没有写完
			// this.timeline.draw();
			// var lineCanvas = this.timeline.canvas;
			// if(lineCanvas != null){
			// 	this.renderer.drawImage(lineCanvas,0,0,lineCanvas.width,lineCanvas.height);
			// }
		}
		
		this.flag = GeoBeans.Layer.Flag.LOADED;;
	},

	start : function(){
		// for(var i)
		var that = this;
		this.timelineID = setInterval(function(){
			++that.currentLayerID;
			if(that.currentLayerID == that.chartLayers.length){
				that.currentLayerID = 0;
			}
			that.map.drawLayersAll();
		}, this.interval);
	},


	stop : function(){
		window.clearInterval(this.timelineID);
	}

});