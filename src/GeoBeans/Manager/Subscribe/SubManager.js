GeoBeans.SubManager = GeoBeans.Class({

	server : null,

	service : "ims",

	version : "1.0.0",

	// poi 主题
	poinames : null,

	aqiCitys : null,

	// AQI图层
	aqiLayer : null,

	// AQI数据库
	aqiSourceName : null,

	// AQI时间点
	aqiTimeField : null,

	// AQI城市
	aqiCityField : null,


	// AQI更新时间图层
	aqiUptimeLayer : null,

	// AQI更新字段
	aqiUptimeField : null,

	// AQI下载字段
	aqiDowntimeField : null,

	aqiFeatureType : null,

	// 每次的时刻
	time : null,

	// 时间定时器
	subInt : null,

	// 时间间隔 单位秒
	timeTick : 10*60,
	// timeTick : 15,

	// 用户回调函数
	user_callback : null,

	// poi信息
	poiFeatures : null,

	// aqi信息
	aqiFeatures : null,

	initialize : function(server){
		this.server = server + "/mgr";
		
		// 第一次的时刻
		this.time = new Date();
		// this.time = new Date("2015-11-26 08:42:23");

		if(this.poinames == null || this.aqiCitys == null){
			this.getSubscription(this.getSubscription_callback);
		}


	},

	// 设置订阅参数
	setSubParams : function(source,layer,timeField,cityField,aqiUptimeLayer,aqiUptimeField,aqiDowntimeField,callback){
		this.aqiSourceName = source;
		this.aqiLayer = layer;
		this.aqiTimeField = timeField;
		this.aqiCityField = cityField;

		this.aqiUptimeLayer = aqiUptimeLayer;
		this.aqiUptimeField = aqiUptimeField;
		this.aqiDowntimeField = aqiDowntimeField;

		this.user_callback = callback;

		var workspace = new GeoBeans.WFSWorkspace("tmp",this.server,"1.0.0");
		this.aqiFeatureType = new GeoBeans.FeatureType(workspace, this.aqiLayer);
		this.aqiUptimeFeatureType = new GeoBeans.FeatureType(workspace, this.aqiUptimeLayer);
	},


	// 得到订阅的关键字
	getSubscription : function(callback){
		var that = this;

		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetSubscription";

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var obj = that.parseGetSubscription(xml);
				if(callback != null){
					callback(that,obj);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});

	},

	parseGetSubscription : function(xml){
		var exception = $(xml).find("ExceptionText");
		if(exception.length != 0){
			return exception.text();
		}
		
		var obj = new Object();
		$(xml).find("Theme").each(function(){
			var type = $(this).attr("name");
			var aqiCitys = [];
			var poiArray = [];
			if(type == "poi"){
				$(this).find("Keyword").each(function(){
					var text = $(this).text();
					poiArray.push(text);
				});
			}else if(type == "aqi"){
				$(this).find("Keyword").each(function(){
					var text = $(this).text();
					aqiCitys.push(text);
				});
			}
			obj.poi = poiArray;
			obj.aqi = aqiCitys;
		});
		return obj;
	},


	getSubscription_callback : function(subManager,obj){
		if(subManager == null || obj == null){
			return;
		}
		var poiArray = obj.poi;
		var aqiCitys = obj.aqi;
		subManager.poinames = poiArray;
		subManager.aqiCitys = aqiCitys;

		subManager.beginSubscribe();
	},

	// 开始订阅
	beginSubscribe : function(){
		if(this.subInt != null || this.aqiFeatureType == null){
			return;
		}

		var that = this;

		this.subInt =  setInterval(function(){
			that.getSubscription(that.subscribe_callback);
			// that.getDownloadTime(that.time,that.getDownloadTime_callback);
			// // that.getSubFeatures(time);
			// // 增加时间
			// var time = that.dateAdd(that.time,"second",that.timeTick);
			// that.time = time;
		},this.timeTick*1000);
	},

	// 查询订阅关键词，然后进行查询
	subscribe_callback : function(subManager,obj){
		if(subManager == null || obj == null){
			return;
		}
		var poiArray = obj.poi;
		var aqiCitys = obj.aqi;
		subManager.poinames = poiArray;
		subManager.aqiCitys = aqiCitys;

		if(aqiCitys != null && aqiCitys.length != 0){
			subManager.getDownloadTime(subManager.time,subManager.getDownloadTime_callback);
		}
		var time = subManager.dateAdd(subManager.time,"second",subManager.timeTick);
		subManager.time = time;
	},

	// 获取下载时间
	getDownloadTime : function(time,callback){
		if(time == null || this.aqiUptimeFeatureType == null){
			return;
		}

		// 保险起见，时间先减去一分钟
		var time2 = this.dateAdd(time,"minute",-1);
		var timeFilter = new GeoBeans.BinaryComparisionFilter();
		timeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThan;
		var prop = new GeoBeans.PropertyName();
		prop.setName(this.aqiDowntimeField);
		var literal = new GeoBeans.Literal();
		var timeStr = this.getTimeFormat(time2);
		literal.setValue(timeStr);
		timeFilter.expression1 = prop;
		timeFilter.expression2 = literal;


		this.aqiUptimeFeatureType.fields = this.aqiUptimeFeatureType.getFields(null,this.aqiSourceName);
		var xml = this.aqiUptimeFeatureType.buildGetFeatureFilterXML(null,this.aqiSourceName,
			timeFilter,null,null,null);

		var url = this.server;
		var that = this;
		$.ajax({
			type : "post",
			url	 : url,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.aqiUptimeFeatureType.parseFeatures(xml);
				if(callback != undefined){
					// callback(that,time,"aqi",features);
					callback(that,features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				console.log("textStatus:" + textStatus);
				console.log("error:" + error);
			}
		});
	},

	// 获取下载时间
	getDownloadTime_callback : function(subManager,features){
		if(subManager == null || features == null){
			return ;
		}
		// 如果没有更新
		if(features.length == 0){
			return ;
		}

		var uptimeArray = [];
		var fields = subManager.aqiUptimeFeatureType.getFields();
		var index = subManager.aqiUptimeFeatureType.getFieldIndex(subManager.aqiUptimeField);
		var values = null,feature = null, uptime = null;
		for(var i = 0; i < features.length;++i){
			feature = features[i];
			if(feature == null){
				continue;
			}
			values = feature.values;
			uptime = values[index];
			if(uptime != null){
				uptimeArray.push(uptime);
			}
		}
		subManager.getAqisByUptime(subManager.aqiCitys,uptimeArray,subManager.getAqisByUptime_callback);
	},	

	// 按照更新时间寻求
	getAqisByUptime : function(citys,uptimeArray,callback){
		if(citys == null || uptimeArray == null || !$.isArray(citys) || !$.isArray(uptimeArray)){
			return;
		}

		var areaFilter = new GeoBeans.BinaryLogicFilter();
		areaFilter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprOr;
		var city = null;
		for(var i = 0; i < citys.length; ++i){
			city = citys[i];
			var cityFilter = new GeoBeans.BinaryComparisionFilter();
			cityFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprEqual;
			var prop = new GeoBeans.PropertyName();
			prop.setName(this.aqiCityField);
			var literal = new GeoBeans.Literal();
			literal.setValue(city);
			cityFilter.expression1 = prop;
			cityFilter.expression2 = literal;
			areaFilter.addFilter(cityFilter);
		}

		var uptime = null;
		var uptimeListFilter = new GeoBeans.BinaryLogicFilter();
		uptimeListFilter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprOr;
		for(var i = 0; i < uptimeArray.length; ++i){
			uptime = uptimeArray[i];
			var uptimeFilter = new GeoBeans.BinaryComparisionFilter();
			uptimeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprEqual;
			var prop = new GeoBeans.PropertyName();
			prop.setName(this.aqiTimeField);
			var literal = new GeoBeans.Literal();
			literal.setValue(uptime);
			uptimeFilter.expression1 = prop;
			uptimeFilter.expression2 = literal;
			uptimeListFilter.addFilter(uptimeFilter);
		}

		var filter = new GeoBeans.BinaryLogicFilter();
		filter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprAnd;
		filter.addFilter(areaFilter);
		filter.addFilter(uptimeListFilter);

		this.aqiFeatureType.fields = this.aqiFeatureType.getFields(null,this.aqiSourceName);
		var xml = this.aqiFeatureType.buildGetFeatureFilterXML(null,this.aqiSourceName,
			filter,200,null,null);

		var url = this.server;
		var that = this;
		$.ajax({
			type : "post",
			url	 : url,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.aqiFeatureType.parseFeatures(xml);
				if(callback != undefined){
					var time = that.time;
					callback(that,time,"aqi",features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				console.log("textStatus:" + textStatus);
				console.log("error:" + error);
			}
		});

	},

	// 返回AQI的数据
	getAqisByUptime_callback : function(subManager,time,type,features){
		
		// 当前时间需要减去一个时间间隔
		var time2 = subManager.dateAdd(time,"second",-subManager.timeTick);
		if(type == "aqi"){
			subManager.aqiFeatures = features;
		}else if(type == "poi"){
			subManager.poiFeatures = features;
		}

		if(subManager.user_callback != null){
			subManager.poiFeatures = [];
			subManager.user_callback(time2,subManager.poiFeatures,subManager.aqiFeatures);
		}
	},

	// 发送订阅请求
	getSubFeatures : function(time){
		if(this.poinames == null || this.aqiCitys == null || this.aqiFeatureType == null){
			return;
		}

		this.aqiFeatures = null;
		this.poiFeatures = null;

		this.getPois(this.poinames,time,this.getSubFeatures_callback);

		this.getAqis(this.aqiCitys,time,this.getSubFeatures_callback);
	},

	// 获取POI
	getPois : function(poinames,time,callback){
		this.poiFeatures = [];
	},

	// 获取AQI
	getAqis : function(aqiCitys,time,callback){
		if(aqiCitys == null){
			return;
		}
		if(aqiCitys.length == 0){
			this.aqiFeatures = [];
		}
		var timeFilter = new GeoBeans.BinaryComparisionFilter();
		timeFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThan;
		var prop = new GeoBeans.PropertyName();
		prop.setName(this.aqiTimeField);
		var literal = new GeoBeans.Literal();
		
		var timeStr = this.getTimeFormat(time);
		literal.setValue(timeStr);
		timeFilter.expression1 = prop;
		timeFilter.expression2 = literal;

		var areaFilter = new GeoBeans.BinaryLogicFilter();
		areaFilter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprOr;
		var city = null;
		for(var i = 0; i < aqiCitys.length; ++i){
			city = aqiCitys[i];
			var cityFilter = new GeoBeans.BinaryComparisionFilter();
			cityFilter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprEqual;
			var prop = new GeoBeans.PropertyName();
			prop.setName(this.aqiCityField);
			var literal = new GeoBeans.Literal();
			literal.setValue(city);
			cityFilter.expression1 = prop;
			cityFilter.expression2 = literal;
			areaFilter.addFilter(cityFilter);
		}


		var filter = new GeoBeans.BinaryLogicFilter();
		filter.operator = GeoBeans.LogicFilter.OperatorType.LogicOprAnd;
		filter.addFilter(timeFilter);
		filter.addFilter(areaFilter);

		this.aqiFeatureType.fields = this.aqiFeatureType.getFields(null,this.aqiSourceName);
		var xml = this.aqiFeatureType.buildGetFeatureFilterXML(null,this.aqiSourceName,
			filter,200,null,null);

		var url = this.server;
		var that = this;
		$.ajax({
			type : "post",
			url	 : url,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.aqiFeatureType.parseFeatures(xml);
				if(callback != undefined){
					callback(that,time,"aqi",features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				console.log("textStatus:" + textStatus);
				console.log("error:" + error);
			}
		});

	},

	// 获取订阅信息内容返回给用户
	getSubFeatures_callback : function(subManager,time,type,features){
		if(subManager == null || type == null || features == null){
			return;
		}
		// if(subManager.getTimeFormat(subManager.time) != subManager.getTimeFormat(time)){
		// 	return;
		// }
		// 判断时间是否正确
		// if(subManager.time - time != subManager.timeTick * 1000){
		// 	return;
		// }
		if(type == "aqi"){
			subManager.aqiFeatures = features;
		}else if(type == "poi"){
			subManager.poiFeatures = features;
		}
		if(subManager.user_callback != null){
			subManager.user_callback(time,subManager.poiFeatures,subManager.aqiFeatures);
		}
	},


	// 日期相加
	dateAdd : function(date,interval,units){
		var ret = new Date(date); //don't change original date
		switch(interval.toLowerCase()) {
			case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
			case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
			case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
			case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
			case 'day'    :  ret.setDate(ret.getDate() + units);  break;
			case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
			case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
			case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
			default       :  ret = undefined;  break;
		}
		return ret;
	},


	getTimeFormat : function(date){
		if(date == null){
			return null;
		}
		var fmt = this.dateFormat(date,"yyyy-MM-dd hh:mm:ss");
		return fmt;
	},

	// 日期格式化
	dateFormat : function(date,fmt){ //author: meizz   
		var o = {   
			"M+" : date.getMonth()+1,                 //月份   
			"d+" : date.getDate(),                    //日   
			"h+" : date.getHours(),                   //小时   
			"m+" : date.getMinutes(),                 //分   
			"s+" : date.getSeconds(),                 //秒   
			"q+" : Math.floor((date.getMonth()+3)/3), //季度   
			"S"  : date.getMilliseconds()             //毫秒   
		};   
		if(/(y+)/.test(fmt))   
			fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
		for(var k in o)   
			if(new RegExp("("+ k +")").test(fmt))   
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
		return fmt;   
	}, 


	// 订阅
	subscribe : function(theme,keywords,callback){
		if(theme == null || keywords == null ||!$.isArray(keywords)){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var keywordsStr = "";
		for(var i = 0; i < keywords.length; ++i){
			var keyword = keywords[i];
			if(keyword == null){
				continue;
			}
			keywordsStr += keyword;
			if(i + 1 < keywords.length){
				keywordsStr += ",";
			}
		}
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=subscribe"
					+ "&theme=" + theme + "&keywords=" + keywordsStr;
		var that = this;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseSubscribe(xml);
				if(callback != null){
					callback(result);
				}
				// 如果成功，重新读取订阅关键词
				if(result == "SUCCESS"){
					that.getSubscription(that.getSubscription_callback);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	parseSubscribe : function(xml){

		var result = $(xml).find("Subscribe").text();
		if(result.toLowerCase() == "success"){
			return "SUCCESS";
		}
		var exception = $(xml).find("ExceptionText");
		if(exception.length != 0){
			return exception.text();
		}
	},

	// 停止订阅
	endSubSribe : function(){
		if(this.subInt != null){
			clearInterval(this.subInt);
		}
		this.subInt = null;
	},


	// 取消订阅
	Unsubscribe : function(theme,keyword,callback){
		if(theme == null || keyword == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var params = "service=" + this.service + "&version="
					+ this.version + "&request=Unsubscribe"
					+ "&theme=" + theme + "&keywords=" + keyword;
		var that = this;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseUnsubscribe(xml);
				if(callback != null){
					callback(result);
				}
				// 如果成功，重新读取订阅关键词
				if(result == "SUCCESS"){
					that.getSubscription(that.getSubscription_callback);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	parseUnsubscribe : function(xml){
		var result = $(xml).find("Unsubscribe").text();
		if(result.toLowerCase() == "success"){
			return "SUCCESS";
		}
		var exception = $(xml).find("ExceptionText");
		if(exception.length != 0){
			return exception.text();
		}
	},
});