GeoBeans.AQIStatCompChart = GeoBeans.Class({
	name : null,

	// 要展示的容器
	container  			: null,

	dbName 				: null,

	tableName 			: null,

	chartFields 		: null,

	// 站点字段
	stationCodeField 	: null,

	// 站点名称
	stationCodes 		: null,


	// 时间字段
	timeField 			: null,

	// 起始时间
	startTime 			: null,

	// 终止时间
	endTime 			: null,

	// 站点名称字段
	positionField 		: null,

	map 				: null,

	features 			: null,

	featureType 		: null,


	chart 				: null,


	initialize : function(name,container,dbName,tableName,chartFields,
		stationCodeField,stationCodes,timeField,startTime,endTime,positionField){
		this.name = name;
		this.container = container;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartFields = chartFields;
		this.stationCodeField = stationCodeField;
		this.stationCodes = stationCodes;
		this.timeField = timeField;
		this.startTime = startTime;
		this.endTime = endTime;
		this.positionField = positionField;
	},

	setMap : function(map){
		this.map = map;
	},

	cleanup : function(){
		if(this.chart != null){
			this.chart.clear();
		}
	},

	show : function(){
		if(this.container == null || this.dbName == null || this.tableName == null
			|| this.chartFields == null || this.stationCodeField == null
			|| this.stationCodes == null || this.timeField == null
			|| this.startTime == null || this.endTime == null
			|| this.map == null){
			return;
		}
		this.getFeatures();
	},

	getFeatures : function(){
		var filter = new GeoBeans.Filter.BinaryLogicFilter();
		filter.operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprAnd;


		// 站点字段
		var stationsFilter = new GeoBeans.Filter.BinaryLogicFilter();
		stationsFilter.operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprOr;
		var stationCode = null;
		var stationCodeFieldProp = new GeoBeans.Expression.PropertyName();
		stationCodeFieldProp.setName(this.stationCodeField);
		for(var i = 0; i < this.stationCodes.length; ++i){
			stationCode = this.stationCodes[i];
			if(stationCode == null){
				continue;
			}
			var stationFilter = new GeoBeans.Filter.BinaryComparisionFilter();
			stationFilter.operator = GeoBeans.Filter.ComparisionFilter.
				OperatorType.ComOprEqual;
			var stationCodeLiteral = new GeoBeans.Expression.Literal();
			stationCodeLiteral.setValue(stationCode);
			stationFilter.expression1 = stationCodeFieldProp;
			stationFilter.expression2 = stationCodeLiteral;
			stationsFilter.addFilter(stationFilter);
		}

		// 时间filter
		var timeFilter = new GeoBeans.Filter.BinaryLogicFilter();
		timeFilter.operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprAnd;;
		
		var startTimeFilter =  new GeoBeans.Filter.BinaryComparisionFilter();
		startTimeFilter.operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual;
		var timeProp = new GeoBeans.Expression.PropertyName();
		timeProp.setName(this.timeField);
		literal = new GeoBeans.Expression.Literal();
		literal.setValue(this.startTime);
		startTimeFilter.expression1 = timeProp;
		startTimeFilter.expression2 = literal;

		var endTimeFilter =  new GeoBeans.Filter.BinaryComparisionFilter();
		endTimeFilter.operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThanOrEqual;
		literal = new GeoBeans.Expression.Literal();
		literal.setValue(this.endTime);
		endTimeFilter.expression1 = timeProp;
		endTimeFilter.expression2 = literal;

		timeFilter.addFilter(startTimeFilter);
		timeFilter.addFilter(endTimeFilter);

		filter.addFilter(stationsFilter);
		filter.addFilter(timeFilter);

		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var featureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
	
		this.featureType = featureType;

		// 采用异步方式
		this.featureType.getFeaturesFilterAsync2(null,this.dbName,filter,null,null,
			[this.timeField,this.stationCodeField,this.positionField]
			.concat(this.chartFields),this.timeField,this,this.getFeatures_callback);
	},

	// 返回features
	getFeatures_callback : function(obj,features){
		if(obj == null || features == null){
			return;
		}
		obj.features = features;

		var option = obj.getChartOption();
		var chart = echarts.init(obj.container);
		chart.setOption(option); 
		obj.chart = chart;
	},

	getChartOption : function(){
		if(this.features == null || this.featureType == null){
			return null;
		}
		// 时间节点X轴
		var timePoints = this.getTimePointsList();
		var timePointIndex = this.featureType.getFieldIndex(this.timeField);

		// 要展示的字段
		var chartFieldsIndexs = [];
		var chartFieldsValues = [];
		for(var i = 0; i < this.chartFields.length; ++i){
			var index = this.featureType.getFieldIndex(this.chartFields[i]);
			chartFieldsIndexs.push(index);
			chartFieldsValues[i] = [];
		}

		// 站点字段
		var stationCodeIndex = this.featureType.getFieldIndex(this.stationCodeField);
		
		
		var feature = null;
		var values = null;
		var stationCodeValue = null;
		var stationCode = null;
		var timePoint = null;
		var timePointValue = null;
		var chartField = null;

		var stationCodesSeries = [];
		// 站点名称
		var positionNames = [];
		for(var i = 0; i < this.stationCodes.length; ++i){
			stationCode = this.stationCodes[i];
			if(stationCode == null){
				continue;
			}
			stationCodesSeries[i] = [];
			for(var j = 0; j < this.chartFields.length; ++j){
				if(this.chartFields[j] != null){
					stationCodesSeries[i][j] = [];
				}
			}
		}

		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			values = feature.values;
			if(values == null){
				continue;
			}
			stationCodeValue = values[stationCodeIndex];
			timePointValue = values[timePointIndex];

			for(var j = 0; j < this.stationCodes.length; ++j){
				stationCode = this.stationCodes[j];
				if(stationCode == null){
					continue;
				}


				// 当前站点的数据
				if(stationCodeValue == stationCode){

					// 开始收集各个时间点的数据
					for(var k = 0; k < timePoints.length; ++k){
						timePoint = timePoints[k];
						if(timePoint == null){
							continue;
						}
						if(timePoint == timePointValue){
							// 开始收集每个显示字段的值

							for(var m = 0; m < this.chartFields.length; ++m){
								chartField = this.chartFields[m];
								if(chartField == null){
									continue;
								}
								
								chartFieldValue = values[chartFieldsIndexs[m]];
								chartFieldValue = parseFloat(chartFieldValue);
								stationCodesSeries[j][m].push(chartFieldValue);
							}
						}
					}
				}
			}
		}

		var positionNames = this.getPositionNames();

		// 按照站点和字段来整理
		var legendData = [];
		var series = [];
		var stationCodeSeries = null;
		var stationCodeChartFieldSeries = null;
		var serie = null;
		for(var i = 0; i < stationCodesSeries.length; ++i){
			stationCodeSeries = stationCodesSeries[i];
			if(stationCodeSeries != null){
				for(var j = 0; j < stationCodeSeries.length; ++j){
					stationCodeChartFieldSeries = stationCodeSeries[j];
					if(stationCodeChartFieldSeries != null){
						serie = {
							name : positionNames[i] + "--"+  this.chartFields[j],
							type : 'line',
							smooth:true,
							data : stationCodeChartFieldSeries

						};
						series.push(serie);
						legendData.push(positionNames[i] + "--"+  this.chartFields[j]);
					}
				}
			}
		}


		var option = {
			// title :{
			// 	text : this.name,
			// 	x : "left",
			// 	y : "top"
			// },
			toolbox:{
				show : true,
				x : 0,
				y : 'top',
				feature : {
					dataView : {show: true, readOnly: true},
					magicType : {show: true, type: ['line', 'bar']},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
		    tooltip : {
		        trigger: 'axis'
		    },	
		    legend :{
		    	data : legendData,
		    	// x : "center",
		    	// y : "top"
		    	x : "140px",
		    	y : "top"
		    	// orient : 'vertical',
		    },
		    calculable : true,
		    yAxis:[{
		    	type :'value',
            	boundaryGap : [0, 0.01]	
		    }],
		    xAxis:[{
		    	type :'category',
		    	data : timePoints
		    }],
		    series : series

		};
		return option;
	},

	// 获得时间列表节点
	getTimePointsList : function(){
		var timePoints = [];
		var timePoint = null;
		var feature = null;
		var values = null;

		var timePointIndex = this.featureType.getFieldIndex(this.timeField);
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			values = feature.values;
			if(values == null){
				continue;
			}
			timePoint = values[timePointIndex];
			if(timePoint == null){
				continue;
			}
			if(timePoints.indexOf(timePoint) == -1){
				timePoints.push(timePoint);
			}
		}
		return timePoints;
	},

	// 获得站点名称
	getPositionNames : function(){
		var positionFieldIndex = this.featureType.getFieldIndex(this.positionField);
		var positionNames = [];

		// 站点字段
		var stationCodeIndex = this.featureType.getFieldIndex(this.stationCodeField);
		for(var i = 0; i < this.stationCodes.length;++i){
			var stationCode = this.stationCodes[i];

			for(var j = 0; j < this.features.length; ++j){
				var feature = this.features[j];
				if(feature == null){
					continue;
				}
				var values = feature.values;
				if(values == null){
					continue;
				}
				var stationCodeValue = values[stationCodeIndex];
				if(stationCode == stationCodeValue){
					var positionName = values[positionFieldIndex];
					if(positionNames[i] == null){
						positionNames.push(positionName);
						break;
					}
				}
			}
		}
		return positionNames;
	}
});