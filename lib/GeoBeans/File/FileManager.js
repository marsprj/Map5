GeoBeans.FileManager = GeoBeans.Class({
	
	server : null,
	service : "ufs",
	version : "1.0.0",

	list : null,

	// 当前路径
	currentPath : null,


	initialize : function(server){
		// this.server = server;
		this.server = server + "/mgr";
		this.list = [];
	},

	// 列出文件
	getList : function(path,callback){
		if(path == null){
			if(callback != null){
				callback("path is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=List"
					+ "&path=" + path;
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
				that.list = that.parseList(xml);
				if(callback != undefined){
					// callback(that.list);
					callback(that.list.sort(that.sortFile2Folder));
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	// 新建文件夹
	createFolder : function(path,callback){
		if(path == null ){
			if(callback != null){
				callback("path is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=CreateFolder"
					+ "&path=" + path;
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

	// 删除文件夹
	removeFolder : function(path,callback){
		if(path == null ){
			if(callback != null){
				callback("path is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveFolder"
					+ "&path=" + path;
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

	// 删除文件夹
	removeFile : function(path,callback){
		if(path == null ){
			if(callback != null){
				callback("path is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveFile"
					+ "&path=" + path;
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
				var result = that.parseRemoveFile(xml);
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

	// 描述csv
	describeCsv : function(path,callback){
		if(path == null ){
			if(callback != null){
				callback("path is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=DescribeCsv"
					+ "&path=" + path;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseDescribeCsv(xml);
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

	parseCreateFolder : function(xml){
		var result = $(xml).find("CreateFolder").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	parseRemoveFolder : function(xml){
		var result = $(xml).find("RemoveFolder").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},

	parseRemoveFile : function(xml){
		var result = $(xml).find("RemoveFile").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;			
	},

	sortFile2Folder : function(a,b){
		if(a instanceof GeoBeans.File && b instanceof GeoBeans.Folder){
			return 1;
		}
		if(a instanceof GeoBeans.Folder && b instanceof GeoBeans.File){
			return -1;
		}
		if(a instanceof GeoBeans.File && b instanceof GeoBeans.File){
			return b - a;
		}
		if(a instanceof GeoBeans.Folder && b instanceof GeoBeans.Folder){
			return b - a;
		}
	},

	parseDescribeCsv : function(xml){
		var exception = $(xml).find("ExceptionText").text();
		if(exception != null && exception != ""){
			return exception;
		}

		var fields = [];
		$(xml).find("sequence").find("element").each(function(){
			var name = $(this).attr("name");
			fields.push(name);
		});
		return fields;

	}


});