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
			async : false,
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
					+ "&dataSetName" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
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
		var srid = $(xml).find("Geometry>SRID").text();
		var dataSet = new GeoBeans.DataSet(name,type,
						geometryType,srid);
		return dataSet;
	},



});