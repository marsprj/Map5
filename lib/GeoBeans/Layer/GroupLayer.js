GeoBeans.Layer.GroupLayer = GeoBeans.Class(GeoBeans.Layer,{
	layers : null,
	server : null,
	image : null,
	format : "image/png",
	version : "1.1.0",
	srs : "EPSG:4326",
	transparent : "true",
	updateFlag : false,

	initialize : function(server,name,format){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.server = server;
		// var index = server.lastIndexOf("/");
		// var serverIMS = server.slice(0,index) + "/ims";
		// this.server = serverIMS;
		var serverType = server.slice()
		this.name = name;
		this.layers = [];
		if(format!=undefined){
			this.format = format;
		}
		this.image = new Image();
	},

	addLayer : function(layer){
		if(layer == null){
			return;
		}
		this.layers.push(layer);
	},

	insertLayer : function(layer){
		if(layer == null){
			return;
		}
		this.layers.unshift(layer);
	},

	removeLayer : function(layer){
		var dbLayer = null;
		for(var i = 0; i < this.layers.length; ++i){
			dbLayer = this.layers[i];
			if(dbLayer == layer){
				this.layers.splice(i,1);
				layer.cleanup();
				return;
			} 
		}
	},

	getLayers : function(){
		return this.layers;
	},

	load : function(){
		var w = this.map.canvas.width;
		var h = this.map.canvas.height;
		
		var extent = this.map.viewer;
		
		// var bbox = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
		
		var bbox = extent.xmin.toFixed(6) + "," + extent.ymin.toFixed(6) + ","
						+ extent.xmax.toFixed(6) + "," + extent.ymax.toFixed(6);
		var url;
		var styleUrl = "";
		var layerUrl = "";
		for(var i = 0; i < this.layers.length;++i){
		// for(var i = this.layers.length-1; i >= 0;--i){
			var layer = this.layers[i];
			var name = layer.name;
			var styleName = layer.styleName;
			var layer = this.layers[i];
			if(name != null && layer.visible && !layer.drawLocal){
				if(styleName != null){
					styleUrl += styleName;
				}
				layerUrl += name;
				
				if(i < this.layers.length - 1 ){
					styleUrl += ",";
					layerUrl += ",";
				}
			}

			
			var heatMapLayer = layer.heatMapLayer;
			if(heatMapLayer != null){
				heatMapLayer.load();
				
			}
		}

		url = this.server +
		 	  "?service=WMS" +
			  "&version=" + this.version +
			  "&request=GetMap" +
			  "&layers=" + layerUrl +
			  "&styles=" + styleUrl +
			  "&bbox=" + bbox + 
			  "&width=" + w + 
			  "&height=" + h + 
			  "&srs=" + this.srs + 
			  "&format=" + this.format +
			  "&transparent=" + this.transparent +
			  "&mapName=" + this.map.name;

		if(this.updateFlag){
			var d = new Date();
			this.image.src = url + "&t=" + d.getTime();
			this.updateFlag = false;
		}else{
			this.image.src = url;
		}

		this.renderer.clearRect(0,0,w,h);
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
				// that.flag = GeoBeans.Layer.Flag.LOADED;
				// that.renderer.drawImage(that.image, 0, 0, w, h);
				// that.map.drawLayersAll();	
			};
		}

	},

	update : function(){
		this.updateFlag = true;
	},
});