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

	loadTotal : function(){
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
			if(heatMapLayer != null && heatMapLayer.visible){
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

		this.renderer.clearRect(0,0,w,h);
		if(layerUrl == ""){
			this.flag =  GeoBeans.Layer.Flag.LOADED;
			return;
		}

		if(this.image.src == url && this.flag == GeoBeans.Layer.Flag.ERROR){
			console.log("ERROR");
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
				// that.flag = GeoBeans.Layer.Flag.LOADED;
				// that.renderer.drawImage(that.image, 0, 0, w, h);
				// that.map.drawLayersAll();	
			};
			this.image.onerror = function(){
				that.flag = GeoBeans.Layer.Flag.ERROR;
				that.map.drawLayersAll();
			};
		}

	},


	load : function(){
		this.flag = GeoBeans.Layer.Flag.READY;
		var layer = null;
		var name = null;
		for(var i = 0; i < this.layers.length; ++i){
			layer = this.layers[i];
			if(layer == null){
				continue;
			}
			if(layer.visible){
				layer.load();
			}
			
		}

		var flag = null;
		for(var i = 0; i < this.layers.length; ++i){
			layer = this.layers[i];
			if(layer == null){
				continue;
			}
			if(layer.visible){
				flag = layer.flag;
				if(flag == GeoBeans.Layer.Flag.READY){
					return;
				}
			}
		}

		var canvas = null;
		console.log('draw grouplayer');
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		// for(var i = 0; i < this.layers.length; ++i){
		for(var i = this.layers.length-1; i >= 0;--i){
			layer = this.layers[i];
			if(layer == null || !layer.visible){
				continue;
			}
			canvas = layer.canvas;
			if(canvas == null){
				continue;
			}
			if(layer.flag == GeoBeans.Layer.Flag.LOADED){
				this.renderer.drawImage(canvas,0,0,canvas.width,canvas.height);
			}
		}
		this.flag = GeoBeans.Layer.Flag.LOADED;
		// this.map.drawLayersAll();

	},

	update : function(){
		this.updateFlag = true;
	},


	hasLayer : function(layerName){
		if(layerName == null){
			return false;
		}
		var layer = null;
		for(var i = 0; i < this.layers.length; ++i){
			layer = this.layers[i];
			if(layer != null && layer.name == layerName){
				return true;
			}
		}
		return false;
	}
});