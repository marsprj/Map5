GeoBeans.DataSource = GeoBeans.Class({
	server 		: null,
	service 	: "dbs",
	version 	: "1.0.0",
	name 		: null,
	engine		: null,
	constr 		: null,
	dataSets 	: null,


	initialize : function(server,name,engine,constr){
		this.server = server;
		this.name = name;
		this.engine = engine;
		this.constr = constr;
		this.dataSets = [];
	},

	getDataSets : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetDataSet&"
					+ "sourceName=" + this.name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.dataSets = that.parseDataSets(xml);
				if(callback != undefined){
					callback(that.dataSets);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	getDataSet : function(name,callback){
		if(name == null || name == ""){
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetDataSet&"
					+ "sourceName=" + this.name 
					+ "&dataSetName=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var dataSet = that.parseDataSet(xml);
				if(callback != undefined){
					callback(dataSet);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseDataSets : function(xml){
		var that = this;
		var dataSets = [];
		$(xml).find("DataSet").each(function(){
			var dataSet = that.parseDataSet(this);
			dataSets.push(dataSet);
		});
		return dataSets;
	},

	parseDataSet : function(xml){
		var name = $(xml).find("Name").text();
		var type = $(xml).find("Type:first").text();
		var geometryType = $(xml).find("Geometry>Type").text();
		var geomType = null;
		switch(geometryType.toUpperCase()){
			case "POINT":{
				geomType = GeoBeans.Geometry.Type.POINT;
				break;
			}
			case "LINESTRING":{
				geomType = GeoBeans.Geometry.Type.LINESTRING;
				break;
			}
			case "POLYGON":{
				geomType = GeoBeans.Geometry.Type.POLYGON;
				break;
			}
			case "MULTIPOINT":{
				geomType = GeoBeans.Geometry.Type.MULTIPOINT;
				break;
			}
			case "MULTILINESTRING":{
				geomType = GeoBeans.Geometry.Type.MULTILINESTRING;
				break;
			}
			case "MULTIPOLYGON":{
				geomType = GeoBeans.Geometry.Type.MULTIPOLYGON;
				break;
			}
			default:
				break;
		}


		var srid = $(xml).find("Geometry>SRID").text();
		if(srid == ""){
			srid = null;
		}
		var thumbnail = $(xml).find("Thumbnail").attr("xlink");
		if(thumbnail == ""){
			thumbnail = null;
		}
		var count = $(xml).find("Count").text();
		if(count != null){
			count = parseInt(count);
		}
		var xmin = $(xml).find("BoundingBox").attr("minx");
		var ymin = $(xml).find("BoundingBox").attr("minx");
		var xmax = $(xml).find("BoundingBox").attr("maxx");
		var ymax = $(xml).find("BoundingBox").attr("maxy");
		var extent = null;
		if(xmin != null && ymin != null && xmax != null && ymax != null){
			extent = new GeoBeans.Envelope(parseFloat(xmin),
				parseFloat(ymin),
				parseFloat(xmax),
				parseFloat(ymax));
		}
		var dataSet = new GeoBeans.DataSet(this,name,type,
						geomType,srid,thumbnail,count,extent);
		return dataSet;
	},

	removeDataSet : function(name,callback){
		if(name == null){
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveDataSet&"
					+ "sourceName=" + this.name 
					+ "&dataSetName=" + name;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRemoveDataSet(xml);
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

	parseRemoveDataSet : function(xml){
		var result = $(xml).find("RemoveDataSet")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},

	refresh : function(name,callback){
		if(name == null){
			if(callback != null){
				callback("refresh name is null")
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=Refresh&"
					+ "sourceName=" + this.name 
					+ "&dataSetName=" + name;	
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRefreshDataSet(xml);
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

	parseRefreshDataSet : function(xml){
		var result = $(xml).find("Refresh").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;	
	}
});