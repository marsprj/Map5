GeoBeans.PoiManager = GeoBeans.Class({
	server : null,

	service : "poi",

	version : "1.0.0",

	// // 定时器
	// poiInt : null,

	// // 时间间隔,单位是秒
	// timeTick :  60,

	// // 订阅主题名称
	// names : null,

	// // 用户的回调函数
	// user_callback : null,

	// // aqi
	// aqiSourceName : "base",

	// aqiLayer : "gc_aqi",

	// aqiTimeField : "time_point",

	// // aqi订阅的结果
	// aqiFeatures : null,

	// // poi订阅的结果
	// poiFeatures : null,

	initialize : function(server){
		this.server = server + "/mgr";
		// var workspace = new GeoBeans.WFSWorkspace("tmp",this.server,"1.0.0");
	},

	getPoi : function(keyword,limit,offset,extent,callback){
		if(keyword == null){
			if(callback != null){
				callback("keyword is null");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetPoi";
		if($.isArray(keyword)){
			var keywordStr = "";
			for(var i = 0; i < keyword.length; ++i){
				keywordStr += keyword[i];
				if(i < keyword.length - 1){
					keywordStr += ",";
				}
			}
			params += "&name=" + keywordStr;
		}else{
			params += "&name=" + keyword;
		}

		if(limit != null){
			params += "&limit=" + limit;
		}
		if(offset != null){
			params += "&offset=" + offset;
		}
		if(extent != null && extent  instanceof GeoBeans.Envelope){
			params += "&extent=" + extent.toString();
		}
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
				if(callback != null){
					callback(pois);
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

});