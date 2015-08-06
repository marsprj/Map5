GeoBeans.RasterDBManager = GeoBeans.Class({
	server : null,
	service : "rds",
	version : "1.0.0",

	initialize : function(server){
		this.server = server;
	},

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

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				// that.dataSources = that.parseDataSources(xml);
				that.parseLisrt(xml);
				if(callback != undefined){
					// callback(that.dataSources);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});					
	},

	parseLisrt : function(xml){

	},


	addRaster : function(rasterName,path,sourceName){

	},

	removeRaster : function(){

	},

	getRaster : function(){

	},

	describeRaster : function(){

	},

	createFolder : function(){

	},
	removeFolder : function(){

	}


});