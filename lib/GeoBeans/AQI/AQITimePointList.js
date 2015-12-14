GeoBeans.AQITimePointList = GeoBeans.Class({
	map : null,

	name : null,

	// 数据库
	dbName : null,

	// 表格
	tableName : null,

	// 时间字段
	timeField : null,

	// 开始时间
	startTime : null,

	// 结束时间
	endTime : null,




	initialize : function(name,dbName,tableName,timeField,startTime,endTime){
		this.name = name;
		this.dbName = dbName;
		this.tableName = tableName;
		this.timeField = timeField;
		this.startTime = startTime;
		this.endTime = endTime;
	},

	setMap : function(map){
		this.map = map;


		// var tableFields = featureType.getFields(null,this.dbName);
	},


	getTimeList : function(){
		if(this.map == null){
			return null;
		}
		var filter = new GeoBeans.BinaryLogicFilter();
		filter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprAnd;

		var startTimeFilter =  new GeoBeans.BinaryComparisionFilter();
		startTimeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual;
		prop = new GeoBeans.PropertyName();
		prop.setName(this.timeField);
		literal = new GeoBeans.Literal();
		literal.setValue(this.startTime);
		startTimeFilter.expression1 = prop;
		startTimeFilter.expression2 = literal;

		var endTimeFilter =  new GeoBeans.BinaryComparisionFilter();
		endTimeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprLessThan;
		prop = new GeoBeans.PropertyName();
		prop.setName(this.timeField);
		literal = new GeoBeans.Literal();
		literal.setValue(this.endTime);
		endTimeFilter.expression1 = prop;
		endTimeFilter.expression2 = literal;

		filter.addFilter(startTimeFilter);
		filter.addFilter(endTimeFilter);

		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var featureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		var orderby = new GeoBeans.OrderBy();
		orderby.addField(this.timeField);
		orderby.setOrder(GeoBeans.OrderBy.OrderType.OrderAsc);
		var features =  featureType.getFeaturesFilter(null,this.dbName,filter,null,null,
			[this.timeField],orderby);
		if(features == null){
			return null;
		}
		var timePoints = [];
		var feature = null;
		var values = null;
		var timePoint = null;
		var timeFieldIndex = featureType.getFieldIndex(this.timeField);
		for(var i = 0; i < features.length; ++i){
			feature = features[i];
			if(feature == null){
				continue;
			}
			values = feature.values;
			if(values == null){
				continue;
			}
			timePoint = values[timeFieldIndex];
			timePoints.push(timePoint);
		}	
		return timePoints;
	},
});