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
				var name = $(this).find("Name").first().text();
				var alias = $(this).find("Alias").first().text();
				var obj = {
					name : name,
					alias : alias
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
			async : true,
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
		outputTypeName,outputSrid,callback){
		if(inputSourceName == null || inputTypeName == null 
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=gps&vesion=1.0.0&request=FeatureProject"
			+ "&inputSourceName=" + inputSourceName + "&inputTypeName=" + inputTypeName
			+ "&outputSourceName=" + outputSourceName + "&outputTypeName=" + outputTypeName
			+ "&outputSrid=" + outputSrid;

		var that = this;
		$.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseFeatureProject(xml);
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

	parseFeatureProject : function(xml){
		var text = $(xml).find("FeatureProject").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},

	featureImport : function(sourceName,typeName,shpPath,shpName,srid,geom,callback){
		if(sourceName == null || typeName == null 
			|| shpPath == null ){
			if(callback != null){
				callback("params is invalid");
			}
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
			async	: true,
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

	// 空间参考
	getSpatialReferenceList : function(count,offset,callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetSpatialReference";
		if(count != null){
			params += "&count=" + count;
		}
		if(offset != null){
			params += "&offset=" + offset;
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
				var srList = that.parseSpatialReferences(xml);
				if(callback != null){
					callback(srList);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseSpatialReferences : function(xml){
		var list = [];
		var that = this;
		$(xml).find("SpatialReference").each(function(){
			var spatialReference = that.parseSpatialReference(this);
			list.push(spatialReference);
		});
		return list;
	},

	parseSpatialReference : function(xml){
		var srid = $(xml).find("srid").text();
		var srtext = $(xml).find("srtext").text();
		var proj = $(xml).find("proj4").text();
		var spatialReference = null;
		if(srid != null){
			spatialReference = new GeoBeans.SpatialReference(srid,srtext,proj);
		}
		return spatialReference;
	},

	// 根据srid返回
	getSpatialReferenceBySrid : function(srid,callback){
		if(srid == null){
			if(callback != null){
				callback("srid is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetSpatialReference&srid=" + srid;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var srid = that.parseSpatialReference(xml);
				if(callback != null){
					callback(srid);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
	},

	// 返回空间参考的个数
	getSpatialReferenceCount : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetSpatialReferenceCount";

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var srid = that.parseGetSpatialReferenceCount(xml);
				if(callback != null){
					callback(srid);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});			
	},

	parseGetSpatialReferenceCount : function(xml){
		var count = $(xml).find("Count").text();
		count = parseInt(count);
		return count;
	},


	// raster oper

	// raster reverse
	rasterReverse : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterReverse&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterReverse(xml);
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

	parseRasterReverse : function(xml){
		var result = $(xml).find("RasterReverse").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// raster graylize
	rasterGraylize : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterGraylize&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterGraylize(xml);
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

	parseRasterGraylize : function(xml){
		var result = $(xml).find("RasterGraylize").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},

	// raster smooth 
	rasterSmooth : function(inputSourceName,inputRasterName,inputPath,operator,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null || operator == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterSmooth&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName + "&operator=" + operator
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterSmooth(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				callback(error);
			}
		});

	},

	parseRasterSmooth : function(xml){
		var result = $(xml).find("RasterSmooth").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;	
	},


	// raster stretch
	rasterStretch : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterStretch&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterStretch(xml);
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

	parseRasterStretch : function(xml){
		var result = $(xml).find("RasterStretch").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;			
	},

	// Raster Subtract
	rasterSubtract : function(inputSourceName_1,inputRasterName_1,inputPath_1,
		inputSourceName_2,inputRasterName_2,inputPath_2,
		outputSourceName,outPutRasterName,outputPath,callback){
		if(inputSourceName_1 == null || inputRasterName_1 == null
			|| inputSourceName_2 == null || inputRasterName_2 == null
			|| outputSourceName == null || outPutRasterName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
			+ "&request=RasterSubtract&inputSourceName_1=" + inputSourceName_1
			+ "&inputRasterName_1=" + inputRasterName_1;
		if(inputPath_1 != null){
			params += "&inputPath_1=" + inputPath_1;
		}

		params += "&inputSourceName_2=" + inputSourceName_2
			+ "&inputRasterName_2=" + inputRasterName_2;
		if(inputPath_2 != null){
			params += "&inputPath_2=" + inputPath_2;
		}

		params += "&outputSourceName=" + outputSourceName + "&outPutRasterName=" + outPutRasterName;
		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterSubtract(xml);
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

	parseRasterSubtract : function(xml){
		var result = $(xml).find("RasterSubtract").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},


	// Raster Subtract
	rasterPixelBlend : function(inputSourceName_1,inputRasterName_1,inputPath_1,
		inputSourceName_2,inputRasterName_2,inputPath_2,
		outputSourceName,outPutRasterName,outputPath,callback){
		if(inputSourceName_1 == null || inputRasterName_1 == null
			|| inputSourceName_2 == null || inputRasterName_2 == null
			|| outputSourceName == null || outPutRasterName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
			+ "&request=RasterPixelBlend&inputSourceName_1=" + inputSourceName_1
			+ "&inputRasterName_1=" + inputRasterName_1;
		if(inputPath_1 != null){
			params += "&inputPath_1=" + inputPath_1;
		}

		params += "&inputSourceName_2=" + inputSourceName_2
			+ "&inputRasterName_2=" + inputRasterName_2;
		if(inputPath_2 != null){
			params += "&inputPath_2=" + inputPath_2;
		}

		params += "&outputSourceName=" + outputSourceName + "&outPutRasterName=" + outPutRasterName;
		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterPixelBlend(xml);
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

	parseRasterPixelBlend : function(xml){
		var result = $(xml).find("RasterPixelBlend").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// raster edge detect
	rasterEdgeDetect : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterEdgeDetect&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterEdgeDetect(xml);
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

	parseRasterEdgeDetect : function(xml){
		var result = $(xml).find("RasterEdgeDetect").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},


	// raster extract by rectangle
	rasterExtractByRectangle : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,extent,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null
			|| extent == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var extentStr = extent.toString();
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterExtractByRectangle&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName
				+ "&extent=" + extentStr;

		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterExtractByRectangle(xml);
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

	parseRasterExtractByRectangle : function(xml){
		var result = $(xml).find("RasterExtractByRectangle").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// raster sepia tone
	rasterSepiaTone : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterSepiaTone&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterSepiaTone(xml);
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

	parseRasterSepiaTone : function(xml){
		var result = $(xml).find("RasterSepiaTone").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;				
	},

	// Get Area
	getArea : function(sourceName,typeName,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetArea&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseGetArea(xml);
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

	praseGetArea : function(xml){
		var result = $(xml).find("GetArea").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// Get Length
	getLength : function(inputSourceName,typeName,outputSourceName,outputTypeName,callback){
		if(inputSourceName == null || inputSourceName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetLength&inputSourceName=" + inputSourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseGetLength(xml);
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

	praseGetLength : function(xml){
		var result = $(xml).find("GetLength").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},


	// Buffer
	getBuffer : function(sourceName,typeName,distance,distanceField,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=Buffer&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;;	
		if(distance != null){
			params += "&distance=" + distance;
		}
		if(distanceField != null){
			params += "&distanceField=" + distanceField;
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
				var result = that.praseGetBuffer(xml);
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

	praseGetBuffer : function(xml){
		var result = $(xml).find("Buffer").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// centroid
	getCentroid : function(inputSourceName,typeName,outputSourceName,outputTypeName,callback){
		if(inputSourceName == null || inputSourceName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=Centroid&inputSourceName=" + inputSourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseGetCentroid(xml);
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

	praseGetCentroid : function(xml){
		var result = $(xml).find("Centroid").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// convex hull
	convexHull : function(inputSourceName,typeName,outputSourceName,outputTypeName,callback){
		if(inputSourceName == null || inputSourceName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=ConvexHull&inputSourceName=" + inputSourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseConvexHull(xml);
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

	praseConvexHull : function(xml){
		var result = $(xml).find("ConvexHull").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// build pyramid
	buildPyramid : function(mapName,sourceName,tileStore,start,end,callback){
		if(mapName == null || sourceName == null || tileStore == null 
			|| start == null || end == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=BuildPyramid&mapName=" + mapName + "&sourceName=" + sourceName
				+ "&tileStore=" + tileStore + "&start=" + start + "&end=" + end;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseBuildPyramid(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(xhr,textStatus,error){
				callback(error);
			}
		});		
	},

	praseBuildPyramid : function(xml){
		var text = $(xml).find("BuildPyramid").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;		
	},

	updateTile : function(mapName,sourceName,tileStore,level,row,col,callback){
		if(mapName == null || sourceName == null || tileStore == null || level == null
			|| row == null || col == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=updateTile&mapName=" + mapName + "&sourceName=" + sourceName
				+ "&tileStore=" + tileStore + "&level=" + level + "&row=" + row + "&col=" + col;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseUpdateTile(xml);
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

	parseUpdateTile : function(xml){
		var text = $(xml).find("UpdateTile").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;		
	},

	// Raster Histogram Equalization
	rasterHisEqual : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RasterHistogramEqualization&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterHisEqual(xml);
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

	parseRasterHisEqual : function(xml){
		var text = $(xml).find("RasterHistogramEqualization").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;		
	},

	// Dem Slope
	demSlope : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=DemSlope&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseDemSlope(xml);
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
	parseDemSlope : function(xml){
		var text = $(xml).find("DemSlope").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;	
	},

	// Dem Aspect
	demAspect : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=DemAspect&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseDemSlope(xml);
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
	parseDemAspect : function(xml){
		var text = $(xml).find("DemAspect").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;	
	},

	//DemStretch DEM灰度拉伸
	demStretch : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null 
			|| outputSourceName == null || outPustRasterName == null ){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=DemStretch&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseDemStretch(xml);
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

	parseDemStretch : function(xml){
		var text = $(xml).find("DemStretch").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;	
	},

	// DemHillshade 山体阴影
	demHillshade : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,
		azimuth,zenith,factor,callback){
		if(inputSourceName == null || inputRasterName == null 
			|| outputSourceName == null || outPustRasterName == null 
			|| azimuth == null || zenith == null || factor == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=DemHillshade&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName
				+ "&Azimuth=" + azimuth
				+ "&zenith=" + zenith
				+ "&zfactor=" + factor;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseDemHillshade(xml);
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

	parseDemHillshade : function(xml){
		var text = $(xml).find("DemHillshade").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;	
	},

	// 三角网
	delaunay : function(sourceName,typeName,inputZField,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null || inputZField == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=Delaunay&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName 
				+ "&inputZField=" + inputZField
				+ "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseDelaunay(xml);
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

	praseDelaunay : function(xml){
		var result = $(xml).find("Delaunay").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// raster Threshold
	rasterThreshold : function(inputSourceName,inputRasterName,inputPath,
		outputSourceName,outPustRasterName,outputPath,callback){
		if(inputSourceName == null || inputRasterName == null
			|| outputSourceName == null || outputPath == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=rasterThreshold&inputSourceName=" + inputSourceName
				+ "&inputRasterName=" + inputRasterName 
				+ "&outputSourceName=" + outputSourceName
				+ "&outPutRasterName=" + outPustRasterName;
		if(inputPath != null){
			params += "&inputPath=" + inputPath;
		}

		if(outputPath != null){
			params += "&outputPath=" + outputPath;
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
				var result = that.parseRasterThreshold(xml);
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
	parseRasterThreshold : function(xml){
		var text = $(xml).find("RasterThreshold").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;	
	},


	// LineToPoints
	lineToPoints : function(sourceName,typeName,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=LineToPoints&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseLineToPoints(xml);
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

	praseLineToPoints : function(xml){
		var result = $(xml).find("LineToPoints").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},	

	// MultiPointToPoints 多点转点
	multiPointToPoints : function(sourceName,typeName,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=MultiPointToPoints&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseMultiPointToPoints(xml);
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

	praseMultiPointToPoints : function(xml){
		var result = $(xml).find("MultiPointToPoints").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// PolygonToPoints 多边形转点
	polygonToPoints : function(sourceName,typeName,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=PolygonToPoints&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.prasePolygonToPoints(xml);
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

	prasePolygonToPoints : function(xml){
		var result = $(xml).find("PolygonToPoints").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// PolygonToLine 多边形转线
	polygonToLine : function(sourceName,typeName,outputSourceName,outputTypeName,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=PolygonToLine&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName;;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.prasePolygonToLine(xml);
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

	prasePolygonToLine : function(xml){
		var result = $(xml).find("PolygonToLine").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// GenerateRandomPoints 随机点生成
	generateRandomPoints : function(sourceName,typeName,extent,srid,count,callback){
		if(sourceName == null || typeName == null || extent == null
			|| srid == null || count == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GenerateRandomPoints&sourceName=" + sourceName
				+ "&typeName=" + typeName + "&extent=" + extent.toString()
				+ "&srid=" + srid + "&count=" + count; 
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseGenerateRandomPoints(xml);
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

	praseGenerateRandomPoints : function(xml){
		var result = $(xml).find("GenerateRandomPoints").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},

	// GenerateRandomPointsInPolygon 多边形内随机点
	generateRandomPointsInPolygon : function(sourceName,typeName,outputSourceName,outputTypeName,count,callback){
		if(sourceName == null || typeName == null
			|| outputSourceName == null || outputTypeName == null || count == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GenerateRandomPointsInPolygon&inputSourceName=" + sourceName
				+ "&inputTypeName=" + typeName + "&outputSourceName=" + outputSourceName
				+ "&outputTypeName=" + outputTypeName + "&count=" + count;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.praseGenerateRandomPointsInPolygon(xml);
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

	praseGenerateRandomPointsInPolygon : function(xml){
		var result = $(xml).find("GenerateRandomPointsInPolygon").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// 获取进程
	getJob : function(state,maxJobs,offset,callback){
		if(state == null){
			if(callback != null){
				callback("state is null");
			}
			return;
		}
		var that = this;
		var params =  "service=" + this.service + "&version=" + this.version
				+ "&request=GetJob&state=" + state;
		if(maxJobs != null){
			params += "&maxJobs=" + maxJobs;
		}
		if(offset != null){
			params += "&offset=" + offset;
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
				var jobs = that.praseGetJob(xml);
				if(callback != null){
					callback(jobs);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
	},

	praseGetJob : function(xml){
		var jobs = [];
		var that = this;
		$(xml).find("Job").each(function(){
			var job = that.parseJob(this);
			if(job != null){
				jobs.push(job);
			}
		});
		return jobs;
	},

	parseJob : function(xml){
		var uuid = $(xml).find("UUID").text();
		if(uuid == null){
			return null;
		}
		var oper = $(xml).find("Operation").text();
		var params =$(xml).find("Params").text();
		var client = $(xml).find("Client").text();
		var server = $(xml).find("Server").text();
		var startTime = $(xml).find("StartTime").text();
		var endTime = $(xml).find("EndTime").text();
		var job = new GeoBeans.Job(uuid,oper,params,client,server,startTime,endTime,status);
		return job;
	},

});