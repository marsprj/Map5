GeoBeans.MapWorkspace = GeoBeans.Class({
	server : null,
	service : "ims",
	version : "1.0.0",
	mapName : null,
	registerLayer_callback_m : null,
	registerLayer_callback_u : null,

	initialize : function(server,mapName){
		this.server = server;
		this.mapName = mapName;
	},

	registerLayer : function(layer,callback,callback_u){
		if(layer == null){
			return;
		}
		var name = layer.name;
		var dbName = layer.dbName;
		var typeName = layer.typeName;
		if(name == null || dbName == null
			|| typeName == null){
			return;
		}
		this.registerLayer_callback_m = callback;
		this.registerLayer_callback_u = callback_u;
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RegisterLayer"
					+ "&mapName=" + this.mapName 
					+ "&datasource=" + dbName
					+ "&layerName=" + name
					+ "&tableName=" + typeName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRegisterLayer(xml);
				// that.registerLayer_callback(result);
				if(that.registerLayer_callback_m != null){
					that.registerLayer_callback_m(result,
						that.registerLayer_callback_u);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});

	},

	parseRegisterLayer : function(xml){
		var result = $(xml).find("RegisterLayer")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},


});