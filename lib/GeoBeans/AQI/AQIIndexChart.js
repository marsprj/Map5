GeoBeans.AQIIndexChart = GeoBeans.Class({
	// 标题
	name 				: null,
	// 要展示的容器
	container  			: null,

	dbName 				: null,

	tableName 			: null,

	// 要显示字段
	chartFields 		: null,

	// 过滤字段
	filterField 		: null,

	// 过滤字段值
	filterFieldValue 	: null,

	// 时间字段
	timeField 			: null,

	// 起始时间
	startTime 			: null,

	// 终止时间
	endTime 			: null,

	map 				: null,

	features 			: null,

	featureType 		: null,

	initialize : function(name,container,dbName,tableName,chartFields,
		filterField,filterFieldValue,timeField,startTime,endTime){
		this.name = name;
		this.container = container;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartFields = chartFields;
		this.filterField = filterField;
		this.filterFieldValue = filterFieldValue;
		this.timeField = timeField;
		this.startTime = startTime;
		this.endTime = endTime;
	},

	setMap : function(map){
		this.map = map;
	},

	show : function(){
		if(this.container == null || this.dbName == null || this.tableName == null
			|| this.chartFields == null || this.filterField == null
			|| this.filterFieldValue == null || this.timeField == null
			|| this.startTime == null || this.endTime == null
			|| this.map == null){
			return;
		}
		this.getFeatures();

		var option = this.getChartOption();
		var chart = echarts.init(this.container);
		chart.setOption(option); 

	},


	getFeatures : function(){
		var filter = new GeoBeans.BinaryLogicFilter();
		filter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprAnd;

		// 过滤字段
		var fieldFilter = new GeoBeans.BinaryComparisionFilter();
		fieldFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.PropertyName();
		prop.setName(this.filterField);
		var literal = new GeoBeans.Literal();
		literal.setValue(this.filterFieldValue);
		fieldFilter.expression1 = prop;
		fieldFilter.expression2 = literal;

		filter.addFilter(fieldFilter);

		// 时间filter
		var timeFilter = new GeoBeans.BinaryLogicFilter();
		timeFilter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprAnd;;
		
		var startTimeFilter =  new GeoBeans.BinaryComparisionFilter();
		startTimeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual;
		prop = new GeoBeans.PropertyName();
		prop.setName(this.timeField);
		literal = new GeoBeans.Literal();
		literal.setValue(this.startTime);
		startTimeFilter.expression1 = prop;
		startTimeFilter.expression2 = literal;

		var endTimeFilter =  new GeoBeans.BinaryComparisionFilter();
		endTimeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprLessThanOrEqual;
		prop = new GeoBeans.PropertyName();
		prop.setName(this.timeField);
		literal = new GeoBeans.Literal();
		literal.setValue(this.endTime);
		endTimeFilter.expression1 = prop;
		endTimeFilter.expression2 = literal;

		timeFilter.addFilter(startTimeFilter);
		timeFilter.addFilter(endTimeFilter);

		filter.addFilter(timeFilter);


		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var featureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		var features = featureType.getFeaturesFilter(null,this.dbName,filter,null,null,
			[this.timeField].concat(this.chartFields),this.timeField);		

		this.featureType = featureType;
		this.features = features;
	},

	getChartOption : function(){
		if(this.features == null || this.featureType == null){
			return;
		}

		var chartFieldsIndexs = [];
		var chartFieldsValues = [];
		for(var i = 0; i < this.chartFields.length; ++i){
			var index = this.featureType.getFieldIndex(this.chartFields[i]);
			chartFieldsIndexs.push(index);
			chartFieldsValues[i] = [];
		}
		var timePoints = [];
		var timePointIndex = this.featureType.getFieldIndex(this.timeField);

		var feature = null;
		var values = null;
		var dataSeries = [];
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			values = feature.values;
			if(values == null){
				continue;
			}
			for(var j = 0; j < chartFieldsIndexs.length; ++j){
				var index = chartFieldsIndexs[j];
				var value = values[index];
				value = parseFloat(value)
				chartFieldsValues[j].push(value);
			}
			var time = values[timePointIndex];
			// time = new Date(time);
			timePoints.push(time);
		}

		var series = [];
		for(var i = 0; i < this.chartFields.length;++i){
			var serie ={
				name : this.chartFields[i],
				type : 'line',
				smooth:true,
				data : chartFieldsValues[i]
			};
			series.push(serie);
		}

	// var colors = [
	// 	new GeoBeans.Color().getHex(),
	// 	new GeoBeans.Color().getHex(),
	// 	new GeoBeans.Color().getHex()
	// ];		

		var option = {
			title :{
				text : this.name,
				x : "center",
				y : "top"
			},
			toolbox:{
				show : true,

				feature : {
					dataView : {show: true, readOnly: true},
					magicType : {show: true, type: ['line', 'bar']},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			grid :{
				x : '130px'
			},
		    tooltip : {
		        trigger: 'axis'
		    },	
		    legend :{
		    	data : this.chartFields,
		    	x : "left",
		    	y : "top"
		    },
		    calculable : true,
		    xAxis:[{
		    	type :'value',
            	boundaryGap : [0, 0.01]	
		    }],
		    yAxis:[{
		    	type :'category',
		    	// type : 'time',
		    	data : timePoints
		    }],
		    series : series
		    // color : colors

		};
		return option;
	},


});