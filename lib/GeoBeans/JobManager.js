GeoBeans.JobManager = GeoBeans.Class({
	service : "ims",
	version : "1.0.0",
	server : null,


	initialize : function(server){
		this.server = server + "/mgr";
	},


	getJobStatistics : function(field,client,startTime,endTime,callback){
		if(field == null || startTime == null || endTime == null){
			if(callback != null){
				callback("params is valid");
			}
			return;
		}
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=JobStatistics"
					+ "&field=" + field 
					+ "&startTime=" + startTime + "&endTime=" + endTime;
		if(client != null){
			params += "&client=" + client;
		}
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
				var result = that.parseStatistics(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseStatistics : function(xml){
		if(xml == null){
			return;
		}
		var array = [];
		$(xml).find("Item").each(function(){
			var key = $(this).attr("key");
			var count = $(this).attr("count");
			array.push({
				key : key,
				count : count
			});
		});
		return array;
	},	

	getJob : function(maxJobs,offset,callback){
		if(maxJobs == null || offset == null){
			if(callback != null){
				callback("params is not valid");
			}
			return;
		}
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetJob"
					+ "&maxJobs=" + maxJobs + "&offset=" + offset;
		
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
				var result = that.parseJob(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
	},

	parseJob : function(xml){
		if(xml == null){
			return null;
		}
		var list = [];
		$(xml).find("Job").each(function(){
			var operation = $(this).find("Operation").text();
			var params = $(this).find("Params").text();
			var client = $(this).find("Client").text();
			var server = $(this).find("Server").text();
			var startTime = $(this).find("StartTime").text();
			var endTime = $(this).find("EndTime").text();
			var state = $(this).find("State").text();
			list.push({
				operation 	: operation,
				params 		: params,
				client 		: client,
				server 		: server,
				startTime 	: startTime,
				endTime 	: endTime,
				state 		: state,
			});
		});
		return list;
	}
});

