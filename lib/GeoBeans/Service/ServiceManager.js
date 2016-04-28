GeoBeans.ServiceManager = GeoBeans.Class({
	service : "ims",
	version : "1.0.0",

	server : null,

	// 服务列表
	services : null,

	initialize : function(server){
		this.server = server + "/mgr";
	},


	describeServices : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=DescribeService";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.services = that.parseServices(xml);
				if(callback != undefined){
					callback(that.services);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	describeService : function(name,callback){
		if(name == null){
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=DescribeService&name=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var service = that.parseService(xml);
				if(callback != undefined){
					callback(service);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});

	},


	createService : function(name,mapName,url,callback){
		if(name == null || mapName == null || url == null){
			if(callback != null){
				callback("params is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=createService&name=" + name
					+ "&mapName=" + mapName + "&uri=" + url;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseCreateService(xml);
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


	removeService : function(name,callback){
		if(name == null){
			if(callback != null){
				callback("name is null");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveService&name=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRemoveService(xml);
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
	parseServices : function(xml){
		if(xml == null){
			return null;
		}

		var exception = $(xml).find("ExceptionText").text();
		if(exception != ""){
			console.log(exception);
			return null;
		}

		var services = [];
		var that = this;
		$(xml).find("Service").each(function(){
			var service = that.parseService(this);
			if(service != null){
				services.push(service);
			}
		});
		return services;
	},

	parseService : function(xml){
		if(xml == null){
			return null;
		}

		var exception = $(xml).find("ExceptionText").text();
		if(exception != ""){
			console.log(exception);
			return null;
		}

		var name = $(xml).find("Name").first().text();
		var mapName = $(xml).find("Map").first().text();
		var envelopeXML = $(xml).find("BoundingBox");
		var extent = this.parseBoundingBox(envelopeXML);
		var srid = $(xml).find("SRID").first().text();
		var thumb = $(this).find("Thumbnail").first().text();


		var layers = [];
		var that = this;
		$(xml).find("Layers>Layer").each(function(){
			var queryable = $(this).attr("queryable");
			var visible = $(this).attr("visible");
			var id = $(this).attr("id");
			var name = $(this).find("Name").text();
			var srid = $(this).find("CRS").text();
			var type = $(this).find("Type").text();
			var envelopeXML = $(this).find("BoundingBox");
			var extent = that.parseBoundingBox(envelopeXML);
			var layer = {
				name : name,
				id : id,
				srid : srid,
				visible : visible,
				type : type,
				extent : extent
			};
			layers.push(layer);
		});

		var service = new GeoBeans.Service(name,mapName,null,layers,srid,extent,thumb);
		return service;
	},


	parseBoundingBox : function(xml){
		if(xml == null){
			return null;
		}
		var xmin = parseFloat($(xml).attr("minx"));
		var ymin = parseFloat($(xml).attr("miny"));
		var xmax = parseFloat($(xml).attr("maxx"));
		var ymax = parseFloat($(xml).attr("maxy"));

		if(!$.isNumeric(xmin) || !$.isNumeric(xmax) || !$.isNumeric(ymin) || !$.isNumeric(ymax)){
			return null;
		}
		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
	},

	parseRemoveService : function(xml){
		var result = "";
		var text = $(xml).find("RemoveService").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},

	parseCreateService : function(xml){
		var result = "";
		var text = $(xml).find("CreateService").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},
});