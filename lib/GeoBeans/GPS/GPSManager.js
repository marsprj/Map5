GeoBeans.GPSManager = GeoBeans.Class({
	server : null,
	service : "gps",
	version : "1.0.0",

	initialize : function(server){
		this.server = server;
	},

	getCapabilities : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetCapabilities";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType: "xml",
			async 	: true,
			beforeSend : function(XMLHttpRequest){

			},
			success : function(xml,textStatus){
				var list = that.parseGetCapabilities(xml);
				if(callback != null){
					callback(list);
				}
			},

			complete : function(XMLHttpRequest,textStatus){

			},
			error : function(){

			}
		});
	},

	parseGetCapabilities : function(xml){
		var list = [];
		$(xml).find("OperationsSet").each(function(){
			var operationSetXML = $(this);
			var type = operationSetXML.attr("type");
			var description = operationSetXML.attr("description");
			var setObj = {
				type : type,
				description : description
			};
			var operList = [];
			operationSetXML.find("Operation").each(function(){
				var name = $(this).attr("name");
				var obj = {
					name : name
				}
				operList.push(obj);
			});

			setObj.operList = operList;
			list.push(setObj);
		});
		return list;
	},

	// K聚类
	clusterKmean : function(inputSourceName,inputTypeName,outputSourceName,
		outputTypeName,clusters,callback){
		if(inputSourceName == null || inputTypeName == null || outputSourceName == null
			|| outputTypeName == null || clusters == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=KMean&inputSourceName=" + inputSourceName
				+ "&inputTypeName=" + inputTypeName + "&outputSourceName="
				+ outputSourceName + "&outputTypeName=" + outputTypeName
				+ "&clusters=" + clusters;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseClusterKmean(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		// $.ajax({
		// 	type 	: "get",
		// 	url 	: this.server,
		// 	data 	: encodeURI(params),
		// 	dataType: "xml",
		// 	async 	: true,
		// 	beforeSend : function(XMLHttpRequest){

		// 	},
		// 	success : function(xml,textStatus){
		// 		var result = that.parseClusterKmean(xml);
		// 		if(callback != null){
		// 			callback(result);
		// 		}
		// 	},

		// 	complete : function(XMLHttpRequest,textStatus){

		// 	},
		// 	error : function(a,b){

		// 	}
		// });
	},

	parseClusterKmean : function(xml){
		var result = $(xml).find("KMean").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},


	featureProject : function(inputSourceName,inputTypeName,outputSourceName,
		outputTypeName,outputSrid){

	},

	featureImport : function(sourceName,typeName,shpPath,shpName,srid,geom,callback){
		if(sourceName == null || typeName == null 
			|| shpPath == null ){
			callback("params is invalid");
			return;
		}
		var params = "service=gps&vesion=1.0.0&request=FeatureImport"
			+ "&sourcename=" + sourceName + "&typeName=" + typeName
			+ "&shppath=" + shpPath + "&shpname=" + shpName;
		if(srid != null){
			params += "&srid=" + srid;
		}else{
			params += "&srid=4326";
		}

		if(geom != null){
			params += "&geom=" + geom;
		}else{
			params += "&geom=shape";
		}

		var that = this;
		$.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(params),
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseFeatureImport(xml);
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

	parseFeatureImport : function(xml){
		var text = $(xml).find("FeatureImport").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},




});