GeoBeans.PoiManager = GeoBeans.Class({
	server : null,

	service : "poi",

	version : "1.0.0",

	// 定时器
	poiInt : null,

	// 时间间隔,单位是秒
	timeTick :  30,

	// 订阅主题名称
	names : null,

	// 用户的回调函数
	user_callback : null,

	// aqi
	aqiSourceName : "base",

	aqiLayer : "gc_aqi",

	aqiTimeField : "time_point",

	// aqi订阅的结果
	aqiFeatures : null,

	// poi订阅的结果
	poiFeatures : null,

	initialize : function(server){
		this.server = server + "/mgr";
		var workspace = new GeoBeans.WFSWorkspace("tmp",this.server,"1.0.0");
		this.aqiFeatureType = new GeoBeans.FeatureType(workspace, this.aqiLayer);
	},

	setPoiNames : function(names){
		if(!$.isArray(names)){
			return;
		}
		this.names = names;
	},

	// 获取poi更新信息
	getPoi : function(poiManager,names,time,callback){
		if(names == null){
			if(callback != null){
				callback("poi name is null");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetPoi";
		if(time != null){
			params += "&time=" + time;
		}
		var nameStr = "";
		for(var i = 0; i < names.length; ++i){
			var name = names[i];
			if(name == null){
				continue;
			}
			nameStr += name;
			if(i + 1 < names.length){
				nameStr += ",";
			}
		}	
		params += "&name=" + nameStr;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var pois = that.parsGetPoi(xml);
				var url = this.url;
				var index = url.indexOf("name=");
				var name = url.slice(index+5,url.length);
				name = decodeURI(name);
				if(callback != null){
					callback(name,pois,poiManager,time);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},


	parsGetPoi : function(xml){
		var pois = [];
		$(xml).find("Pois>Poi").each(function(){
			var name = $(this).find("name").text();
			var x = $(this).find("lon").text();
			var y = $(this).find("lat").text();
			var address = $(this).find("address").text();
			var type = $(this).find("type").text();
			var poi = {
				name 	: name,
				x 		: x,
				y		: y,
				address	: address,
				type 	: type
			};
			pois.push(poi);
		});
		return pois;
	},

	// names 
	// ["aqi",["hotel","饭店"]];
	// 开始订阅
	beginSubscribe : function(names,time,callback){
		var that = this;
		if(names == null || time == null){
			if(callback != null){
				callback("params is invaild");
			}
			return;
		}
		if(this.poiInt != null){
			if(callback != null){
				callback("已经开始订阅了");
			}
			return;
		}
		this.time = time;
		this.setPoiNames(names);
		this.user_callback = callback;
		that.getPois();
		this.poiInt = setInterval(function(){
			// 增加时间
			var time = that.dateAdd(that.time,"second",that.timeTick);
			that.time = time;
			that.poiFeatures = null;
			that.aqiFeatures = null;
			that.getPois();
		},this.timeTick*1000);
		callback(null,"订阅成功");
	},

	endSubscribe : function(){
		if(this.poiInt != null){
			clearInterval(this.poiInt);
		}
		this.poiInt = null;
	},

	getPois : function(){
		if(this.names == null){
			return;
		}
		var name = null;
		for(var i = 0; i < this.names.length; ++i){
			name = this.names[i];
			if(name == null){
				continue;
			}
			if(name == "aqi"){
				this.getAqi(this,this.time,this.getFeatures_callback);
			}else{
				if($.isArray(name)){
					this.getPoi(this,name,this.time,this.getFeatures_callback);
				}
			}
		}
	},

	// getPoi_callback : function(name,pois,poiManager){
	// 	poiManager.user_callback(pois);
	// },

	// 获取aqi数据
	getAqi : function(poiManager,time,callback){
		var filter = new GeoBeans.BinaryComparisionFilter();
		filter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThan;
		var prop = new GeoBeans.PropertyName();
		prop.setName(this.aqiTimeField);
		var literal = new GeoBeans.Literal();
		var timeStr = this.getTimeFormat(time);
		literal.setValue(timeStr);
		filter.expression1 = prop;
		filter.expression2 = literal;

		// this.aqiFeatureType.getFeaturesFilterAsync(null,this.aqiSourceName,filter,null,
		// 	null,null,null,callback);
		this.aqiFeatureType.fields = this.aqiFeatureType.getFields(null,this.aqiSourceName);
		var xml = this.aqiFeatureType.buildGetFeatureFilterXML(null,this.aqiSourceName,
			filter,null,null,null);
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
					// callback(features);
					callback("aqi",features,poiManager,time);
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


	getFeatures_callback : function(name,features,poiManager,time){
		if(features == null){
			return;
		}

		// 如果不是当前时间则不返回
		if(poiManager.time != time){
			return;
		}

		// 分别赋值
		if(name == "aqi"){
			poiManager.aqiFeatures = features;
		}else{
			poiManager.poiFeatures = features;
		}
		if(poiManager.aqiFeatures != null && poiManager.poiFeatures != null){
			poiManager.user_callback(poiManager.time,null,poiManager.aqiFeatures,poiManager.poiFeatures);
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
});