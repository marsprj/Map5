GeoBeans.RasterDBManager = GeoBeans.Class({
	server : null,
	service : "rds",
	version : "1.0.0",


	// 当前路径
	currentPath : null,

	initialize : function(server){
		this.server = server + "/mgr";
	},

	//获取列表
	getList : function(sourceName,path,callback){
		if(sourceName == null || path == null){
			if(callback != null){
				callback("invalid params");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=List&path=" + path
					+ "&sourceName=" + sourceName;

		that.currentPath = path;
					
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var list = that.parseList(xml);
				if(callback != undefined){
					callback(list);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});					
	},

	parseList : function(xml){
		var that = this;
		var list = [];
		var files = $(xml).find("Files");
		files.children().each(function(){
			if(this.tagName == "File"){
				var file = that.parseFile(this);
				list.push(file);
			}else if(this.tagName == "Folder"){
				var folder = that.parseFolder(this);
				list.push(folder);
			}
		});
		return list;
	},

	parseFile : function(xml){
		var name = $(xml).attr("name");
		var accessTime  = $(xml).attr("access_time");
		var lastTime = $(xml).attr("last_modified_time");
		var size = $(xml).attr("size");
		var path = null;
		if(this.currentPath == "/"){
			path = this.currentPath + name;
		}else{
			path = this.currentPath + "/" + name;
		}
		var file = new GeoBeans.File(this.currentPath,path,name,accessTime,
			lastTime,size);
		return file;
	},

	parseFolder : function(xml){
		var name = $(xml).attr("name");
		var accessTime  = $(xml).attr("access_time");
		var lastTime = $(xml).attr("last_modified_time");
		var path = null;
		if(this.currentPath == "/"){
			path = this.currentPath + name;
		}else{
			path = this.currentPath + "/" + name;
		}

		var file = new GeoBeans.Folder(this.currentPath,path,name,accessTime,
			lastTime);
		return file;
	},

	// 导入影像
	addRaster : function(sourceName,rasterName,rasterPath,filePath,callback){
		if(sourceName == null || rasterName == null
			|| rasterPath == null || filePath == null){
			if(callback != null){
				callback("invalid params");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=AddRaster"
					+ "&sourceName=" + sourceName + "&rasterName=" + rasterName 
					+ "&rasterPath=" + rasterPath + "&filePath=" + filePath;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var list = that.parseAddRaster(xml);
				if(callback != undefined){
					callback(list);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});			

	},

	parseAddRaster : function(xml){
		var result = $(xml).find("AddRaster").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},

	// 删除影像
	removeRaster : function(sourceName,rasterName,rasterPath,callback){
		if(sourceName == null || rasterName == null
			|| rasterPath == null ){
			if(callback != null){
				callback("invalid params");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveRaster"
					+ "&sourceName=" + sourceName + "&rasterName=" + rasterName 
					+ "&path=" + rasterPath;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var list = that.parseRemoveRaster(xml);
				if(callback != undefined){
					callback(list);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});			
	},

	parseRemoveRaster : function(xml){
		var result = $(xml).find("RemoveRaster").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;			
	},

	// 获取影像
	getRaster : function(sourceName,rasterName,rasterPath,callback){
		if(sourceName == null || rasterName == null
			|| rasterPath == null ){
			if(callback != null){
				callback("invalid params");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetRaster"
					+ "&sourceName=" + sourceName + "&rasterName=" + rasterName 
					+ "&Path=" + rasterPath;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(data, textStatus){
				if(callback != null){
					callback(data);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(data){
			}
		});
	},


	getRasterUrl : function(sourceName,rasterName,rasterPath){
		if(sourceName == null || rasterName == null
			|| rasterPath == null ){
			return null;
		}
		var url = this.server + "?"
					+ "service=" + this.service + "&version="
					+ this.version + "&request=GetRaster"
					+ "&sourceName=" + sourceName + "&rasterName=" + rasterName 
					+ "&Path=" + rasterPath;
		return url;
	},

	// 展示具体信息
	describeRaster : function(sourceName,rasterName,rasterPath,callback){
		if(sourceName == null || rasterName == null || rasterPath == null){
			if(callback != null){
				callback("invalid params");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=DescribeRaster"
					+ "&sourceName=" + sourceName + "&rasterName=" + rasterName 
					+ "&Path=" + rasterPath;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var raster = that.parseDescribeRaster(xml);
				if(callback != null){
					callback(raster);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseDescribeRaster : function(xml){
		var name = $(xml).find("Raster>Name").text();
		var format = $(xml).find("Raster>Format").text();
		var bands = $(xml).find("Raster>Bands").text();
		var srid = $(xml).find("Raster>SRID").text();
		var width = $(xml).find("Raster>Width").text();
		var height = $(xml).find("Raster>Height").text();


		var xmin = null, ymin = null, xmax = null, ymax = null;
		var lowerLeft = $(xml).find("Raster>Boundingbox>LowerLeft").text();
		if(lowerLeft != null){
			var array = lowerLeft.split(" ");
			xmin = parseFloat(array[0]);
			ymin = parseFloat(array[1]);
		}
		var upperRight = $(xml).find("Raster>Boundingbox>UpperRight").text();
		if(upperRight != null){
			var array = upperRight.split(" ");
			xmax = parseFloat(array[0]);
			ymax = parseFloat(array[1]);
		}

		var extent = null;
		if(xmin != null && ymin != null && xmax != null && ymax != null){
			extent = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		}

		var raster = null;
		if(name != null){
			raster = new GeoBeans.Raster(name,format,bands,srid,width,height,extent);
		}
		return raster;

	},

	// 新建文件夹
	createFolder : function(sourceName,path,callback){
		if(path == null || sourceName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=CreateFolder"
					+ "&sourceName="+ sourceName + "&path=" + path;
		that.currentPath = path;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseCreateFolder(xml);
				if(callback != undefined){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseCreateFolder : function(xml){
		var result = $(xml).find("CreateFolder").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	// 删除文件夹
	removeFolder : function(sourceName,path,callback){
		if(path == null || sourceName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveFolder"
					+ "&sourceName="+ sourceName + "&path=" + path;
		that.currentPath = path;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRemoveFolder(xml);
				if(callback != undefined){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
	},

	parseRemoveFolder : function(xml){
		var result = $(xml).find("RemoveFolder").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},
});