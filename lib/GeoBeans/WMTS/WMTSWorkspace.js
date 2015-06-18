GeoBeans.WMTSWorkspace = GeoBeans.Class(GeoBeans.Workspace,{
	name 	: null,
	server 	: null,
	layers 	: null,

	initialize : function(name,server){
		this.name = name;
		this.server = server;
	},

	getLayer : function(typeName,name){
		var layers = this.getLayers();
		var layer = null;
		for(var i = 0; i < layers.length; ++i){
			layer = layers[i];
			if(layer.typeName == typeName){
				layer.setName(name);
				return layer;
			}
		}
		return null;
	},

	getLayers : function(){
		if(this.server == null){
			return;
		}
		var that = this;

		$.ajax({
			type	:"get",
			url		: this.server,
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.layers = that.parseLayers(xml);
				
				//callback(fts);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.layers;
	},

	parseLayers : function(xml){
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
	}
});