GeoBeans.TileDBManager = GeoBeans.Class({
	name : null,

	// 用户的server
	userServer : null,
	server : null,

	service 	: "wmts",

	version 	: "1.0.0",

	initialize : function(server){
		this.userServer = server;
	},

	setName : function(name){
		if(name == null){
			return;
		}
		this.name = name;
		this.server = this.userServer + "/" + this.name + "/wmts";
	},

	getCapabilities : function(){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetCapabilities";

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.layers = that.parseGetCapabilities(xml);
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
		return that.layers;			
	},


	parseGetCapabilities : function(xml){
		var layers = [];
		var that = this;
		$(xml).find("Layer").each(function(){
			var layer = that.parseLayer(this);
			layers.push(layer);
		});
		return layers;
	},

	parseLayer : function(xml){
		var name = $(xml).find("Identifier:first").text();
		var format = $(xml).find("Format:first").text();
		var tms = $(xml).find("TileMatrixSetLink>TileMatrixSet").text();

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

		var wmtsLayer = new GeoBeans.Layer.WMTSLayer(name,this.server,name,
			extent,tms,format);

		return wmtsLayer;
	},





});