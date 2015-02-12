GeoBeans.WMSWorkspace = GeoBeans.Class(GeoBeans.Workspace, {
	server : null,
	service: "wms",
	version: "1.3.0",
	layers : null,
	extent : null,
	format : "image/png",
	srs : "EPSG:4326",
	transparent : "true",
	
	initialize : function(name,server,version){
		GeoBeans.Workspace.prototype.initialize.apply(this, arguments);
		
		this.server = server;
		this.version = version;
		this.layers = null;
		this.extent = null;
	},
	
	destory : function(){
		this.server = null;
		this.version = null;
		this.layers = null;
		this.extent = null;
		
		GeoBeans.Workspace.prototype.destory.apply(this, arguments);
	},
	
	getLayers : function(callback){

		if(callback==undefined){
			return this.getLayers_sync();
		}
		else{
			this.getLayers_aync(callback);
		}
	},

	getLayers_sync : function(){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version + "&request=getCapabilities";
		
		$.ajax({
			type	:"get",
			url		: this.server,
			data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.parseCapabilities(xml);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return this.layers;
	},

	getLayers_aync : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version + "&request=getCapabilities";
		
		$.ajax({
			type	:"get",
			url	: this.server,
			data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.parseCapabilities(xml);
				callback(that.layers);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	getMap : function(layers, extent, width, height, format, styles){		
		var that = this;
		var params  = this.getMapURL(layers, extent, width, height, format,styles);
		
		$.ajax({
			type	:"get",
			url	: this.server,
			data	: encodeURI(params),
			dataType: "xmllayers, styles, width, height, format",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.parseCapabilities(xml);
				callback(that.layers);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	parseCapabilities : function(xml){

		this.extent = this.parseExent($(xml).find('Layer>BoundingBox').first());
		this.layers = this.parseLayers($(xml).find('Layer>Layer'));
	},

	parseExent : function(xml){
		if(xml==undefined){
			return null;
		}

		var xmin = parseFloat($(xml).attr('minx'));
		var ymin = parseFloat($(xml).attr('miny'));
		var xmax = parseFloat($(xml).attr('maxx'));
		var ymax = parseFloat($(xml).attr('maxy'));

		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
	},

	parseLayers : function(xml){
		var that = this;
		var layers = [];
		$(xml).each(function(){
			var layer = that.parseLayer(this);
			if(layer!=null){
				layers.push(layer);
			}
		});
		return layers;
	},

	parseLayer : function(xml){
		
		var name = $(xml).find('Name').first().text();
		var srs  = $(xml).find('CRS').first().text();
		var extent = this.parseExent($(xml).find('BoundingBox').first());
		var style_name =  $(xml).find('Style>Name').first().text();

		var layer = new GeoBeans.Layer.MapLayer(name);
		layer.srs = srs;
		layer.extent = extent;
		layer.style_name = style_name;

		return layer;
	},

	getMapURL : function(layers, extent, width, height, format, styles){
		var bbox = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
		var params  = "service=wms";
		params  += "&version=" + this.version;
		params  += "&request=getMap";
		params  += "&layers="  + this.layers;
		params  += "&width="  + width;
		params  += "&height=" + height;
		params  += "&format=" + format;
		params  += "&bbox=" + bbox;
		if(styles==null)
			params  += "&styles=";
		else
			params  += "&styles=" + styles;
		return params;
	},
});
