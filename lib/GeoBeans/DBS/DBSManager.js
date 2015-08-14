GeoBeans.DBSManager = GeoBeans.Class({
	
	server : null,
	service : "dbs",
	version : "1.0.0",

	dataSources : null,

	// 当前数据库名称
	sourceName : null,

	initialize : function(server){
		this.server = server;
		this.dataSources = [];
	},

	getDataSources : function(callback,type){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetDataSource";
		if(type != null){
			params += "&type=" + type;;
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
				that.dataSources = that.parseDataSources(xml);
				if(callback != undefined){
					callback(that.dataSources);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	getDataSource : function(name,callback){
		if(name == null || name == ""){
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetDataSource&"
					+ "name=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var dataSouce = that.parseDataSource(xml);
				if(callback != undefined){
					callback(dataSouce);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		

	},

	//注销
	unRegisterDataSource : function(name,callback){
		if(name == null){
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=UnRegisterDataSource&"
					+ "name=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseUnRegisterDBS(xml);
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

	//注册
	registerDataSource : function(name,engine,constr,type,callback){
		if(name == null || constr == null || engine == null || type == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RegisterDataSource&"
					+ "name=" + name + "&engine=" + engine
					+ "&uri=" + constr + "&type=" + type;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRegisterDBS(xml);
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

	tryConnection : function(uri,callback){
		if(uri == null || uri == ""){
			return;
		}
		
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=TryConnection&engine"
					+ "=Postgres&uri=" + uri;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseTryConn(xml);
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

	// create tile store
	createTileStore : function(sourceName,storeName,type,callback){
		if(sourceName == null || storeName == null || type == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=CreateTileStore"
					+ "&sourceName=" + sourceName + "&storeName=" + storeName 
					+ "&type=" + type;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseCreateTileStore(xml);
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

	describeTileStores : function(sourceName,callback){
		if(sourceName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=DescribeTileStore"
					+ "&sourceName=" + sourceName;
		this.sourceName = sourceName;
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
				var tileStores = that.parseDescribeTileStores(xml);
				if(callback != undefined){
					callback(tileStores);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	describeTileStore : function(sourceName,storeName,callback){
		if(sourceName == null || storeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=DescribeTileStore"
					+ "&sourceName=" + sourceName + "&storeName=" + storeName;
		this.sourceName = sourceName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseDescribeTileStore(xml);
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

	removeTileStore : function(sourceName,storeName,callback){
		if(sourceName == null || storeName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveTileStore"
					+ "&sourceName=" + sourceName + "&storeName=" + storeName;
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
				var result = that.parseRemoveTileStore(xml);
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

	parseCreateTileStore : function(xml){
		var result = $(xml).find("CreateTileStore").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	parseDataSources : function(xml){
		var dataSources = [];
		var that = this;
		$(xml).find("DataSource").each(function(){
			var dataSouce = that.parseDataSource(this);
			dataSources.push(dataSouce);
		});
		return dataSources;
	},

	parseDataSource : function(xml){
		var name = $(xml).find("Name").text();
		var engine = $(xml).find("Engine").text();
		var constr = $(xml).find("ConnectionString").text();
		var dbs = new GeoBeans.DataSource(this.server,
					name,engine,constr);
		return dbs;
	},

	parseUnRegisterDBS : function(xml){
		var result = $(xml).find("UnRegisterDataSource")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	parseRegisterDBS : function(xml){
		var result = $(xml).find("RegisterDataSource")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	parseTryConn : function(xml){
		var result = $(xml).find("TryConnection")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
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


	parseDescribeTileStores : function(xml){
		var tileStores = [];
		var that = this;
		$(xml).find("TileStore").each(function(){
			var tileStore = that.parseDescribeTileStore(this);
			tileStores.push(tileStore);
		});
		return tileStores;
	},

	parseDescribeTileStore : function(xml){
		var title = $(xml).find("Title").first().text();
		var format = $(xml).find("Format").first().text();
		var tms = $(xml).find("TileMatrixSetLink>TileMatrixSet").first().text();

		var lowerCorner = $(xml).find("LowerCorner").text();
		var upperCorner = $(xml).find("UpperCorner").text();

		var index = lowerCorner.indexOf(" ");
		var index2 = lowerCorner.lastIndexOf(" ");
		var xmin = lowerCorner.slice(0, index);
		var ymin = lowerCorner.slice(index2 + 1,lowerCorner.length);


		index = upperCorner.indexOf(" ");
		index2 = upperCorner.lastIndexOf(" ");
		var xmax = upperCorner.slice(0, index);
		var ymax = upperCorner.slice(index2 + 1,upperCorner.length);
	
		var extent = new GeoBeans.Envelope(
				parseFloat(xmin),
				parseFloat(ymin),
				parseFloat(xmax),
				parseFloat(ymax));
		var sourceName = this.sourceName;
		var tileStore = new GeoBeans.TileStore(title,extent,format,tms,sourceName);
		return tileStore;
	},


	parseRemoveTileStore : function(xml){
		var text = $(xml).find("RemoveTileStore").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},
});