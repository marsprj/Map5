GeoBeans.Layer.WMSLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	server: null,
	url : null,
	image : null,
	layers : [],
	mapLayers : [],
	styles : [],
	format : "image/png",
	version : "1.1.0",
	srs : "EPSG:4326",
	transparent : "true",
	workspace : null,//添加WMSWorkspace
	updateFlag : false,
	
	
	initialize : function(name, server, layers, styles, format){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.workspace = new GeoBeans.WMSWorkspace(name,server,"1.3.0");
		this.name = name;
		this.server = server;
		this.layers = layers;
		this.mapLayers = [];
		for(var i = 0; i < this.layers.length;++i){
			var layerName = this.layers[i];
			var mapLayer = this.workspace.getMapLayer(layerName);
			this.mapLayers.push(mapLayer);
		}
		if(styles!=undefined){
			this.styles = styles;
		}
		if(format!=undefined){
			this.format = format;
		}
		this.image = new Image();

		var extent = this.workspace.extent;
		this.extent = extent;
		
	},
	
	destory : function(){
		
		this.server= null;
		this.name = null;
		this.server = null;
		this.layers = null;
		this.styles = null;
		this.format = null;
		this.image = null;
		this.mapLayers = null;
		
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
	},

	load : function(){
		var w = this.map.canvas.width;
		var h = this.map.canvas.height;
		
		var extent = this.map.getViewer();
		
		var bbox = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
		
		var url;
		var styleUrl = "";
		var layerUrl = "";
		for(var i = 0; i < this.mapLayers.length; ++i){
			var mapLayer = this.mapLayers[i];
			if(mapLayer == null){
				continue;
			}
			var mapLayerName = mapLayer.name;
			var name = this.styles[i];
			if(name == null){
				name = mapLayer.style_name;
			}
			// var name = mapLayer.style_name;
			if(name != null && mapLayer.visible){
				styleUrl += name;
				layerUrl += mapLayerName;
			}
			
			if(i < this.mapLayers.length -1){
				if(styleUrl != "" && styleUrl.substr(styleUrl.length-1,1) != ","){
					styleUrl += ",";
				}
				if(layerUrl != "" && layerUrl.substr(layerUrl.length-1,1) != ","){
					layerUrl += ",";
				}
			}
		}

		if(styleUrl.substr(styleUrl.length-1,1) == ","){
			styleUrl = styleUrl.substr(0,styleUrl.length-1);
		}
		if(layerUrl.substr(layerUrl.length-1,1) == ","){
			layerUrl = layerUrl.substr(0,layerUrl.length-1);
		}		
		url = this.server +
		 	  "service=WMS" +
			  "&version=" + this.version +
			  "&request=GetMap" +
			  "&layers=" + layerUrl +
			  "&styles=" + styleUrl +
			  "&bbox=" + bbox + 
			  "&width=" + w + 
			  "&height=" + h + 
			  "&srs=" + this.srs + 
			  "&format=" + this.format +
			  "&transparent=" + this.transparent;
		
		this.renderer.clearRect(0,0,w,h);
		if(layerUrl == ""){
			this.flag =  GeoBeans.Layer.Flag.LOADED;
			return;
		}
		if(this.updateFlag){
			var d = new Date();
			this.image.src = url + "&t=" + d.getTime();
			this.updateFlag = false;
		}else{
			this.image.src = url;
		}
		
		if(this.image.complete){
			this.updateFlag = false;
			this.flag = GeoBeans.Layer.Flag.LOADED;
			this.renderer.drawImage(this.image, 0, 0, w, h);	
			var index = this.image.src.lastIndexOf("&t=");
			if(index != -1){
				this.image.src = this.image.src.slice(0,index);
			}
		}else{
			var that = this;
			that.flag = GeoBeans.Layer.Flag.READY;
			this.image.onload = function(){
				if(that.flag != GeoBeans.Layer.Flag.LOADED){
					that.flag = GeoBeans.Layer.Flag.LOADED;
					that.renderer.drawImage(that.image, 0, 0, w, h);
					that.map.drawLayersAll();	
				}
			};
		}


	},
	
	// draw : function(){
	// 	var w = this.map.canvas.width;
	// 	var h = this.map.canvas.height;
	// 	var extent = this.map.viewer;
		
	// 	var bbox = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
		
	// 	var url;
	// 	url = this.server +
	// 	 	  "&service=WMS" +
	// 		  "&version=" + this.version +
	// 		  "&request=GetMap" +
	// 		  "&layers=" + this.layers +
	// 		  "&styles=" + this.styles +
	// 		  "&bbox=" + bbox + 
	// 		  "&width=" + w + 
	// 		  "&height=" + h + 
	// 		  "&srs=" + this.srs + 
	// 		  "&format=" + this.format +
	// 		  "&transparent=" + this.transparent;
		
	// 	this.image.src = url;
		
	// 	var renderer = this.map.renderer;
	// 	if(this.image.complete){
	// 		renderer.drawImage(this.image, 0, 0, w, h);	
	// 	}
	// 	else{
	// 		var tile = this;
	// 		this.image.onload = function(){
	// 			renderer.drawImage(tile.image, 0, 0, w, h);
	// 		};
	// 	}
	// },

	getMapLayer : function(name){
		var mapLayer,mapLayerName;
		for(var i = 0; i < this.mapLayers.length; ++i){
			mapLayer = this.mapLayers[i];
			mapLayerName = mapLayer.name;
			if(mapLayerName == name){
				return mapLayer;
			}
		}
		return null;
	},

	update : function(){
		this.updateFlag = true;
	},

	//更新mapLayer的样式
	// setMapLayerStyle : function(mapLayer,styleName,callback){
	// 	if(mapLayer == null || styleName == null){
	// 		return;
	// 	}
	// 	var that = this;
	// 	var name = mapLayer.name;
	// 	var params = "service=wms&version=1.0.0&request=SetStyle&"
	// 			+ "&layer=" + name + "&style=" + styleName; 
	// 	$.ajax({
	// 		type 	: "get",
	// 		url 	: this.server,
	// 		data 	: encodeURI(params),
	// 		dataType:"xml",
	// 		async : false,
	// 		beforeSend: function(XMLHttpRequest){
	// 		},
	// 		success	: function(xml, textStatus){
	// 			var result = that.parseSetMapLayerStyle(xml);
	// 			if(result == "success"){
	// 				mapLayer.style_name = styleName;
	// 			}
	// 			if(callback != undefined){
	// 				callback(result);
	// 			}
				
	// 		},			 
	// 		complete: function(XMLHttpRequest, textStatus){
	// 		},
	// 		error	: function(){
	// 		}
	// 	});		
	// },

	// parseSetMapLayerStyle : function(xml){
	// 	var result = "";
		
	// 	var text = $(xml).find("SetStyle").text();
	// 	if(text.toUpperCase() == "SUCCESS"){
	// 		result = "success";
	// 	}else if($(xml).find("ExceptionText").text() != ""){
	// 		result = $(xml).find("ExceptionText").text();
	// 	}
	// 	return result;
	// }

});