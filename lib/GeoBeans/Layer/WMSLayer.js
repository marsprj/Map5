GeoBeans.Layer.WMSLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	server: null,
	url : null,
	image : null,
	layers : [],
	styles : [],
	format : "image/png",
	version : "1.1.0",
	srs : "EPSG:4326",
	transparent : "true",
	
	
	initialize : function(name, server, layers, styles, format){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.name = name;
		this.server = server;
		this.layers = layers;
		if(styles!=undefined){
			this.styles = styles;
		}
		if(format!=undefined){
			this.format = format;
		}
		this.image = new Image();
		
	},
	
	destory : function(){
		
		this.server= null;
		this.name = null;
		this.server = null;
		this.layers = null;
		this.styles = null;
		this.format = null;
		this.image = null;
		
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
	},
	
	draw : function(){
		var w = this.map.canvas.width;
		var h = this.map.canvas.height;
			
//		if(this.image.src.length==0){
			//http://127.0.0.1:8080/geoserver/radi/wms?service=WMS&version=1.1.0&request=GetMap&layers=radi:cities&styles=&bbox=-255,-255,255,255&width=860&height=330&srs=EPSG:4326&format=image%2Fpng
			
			var extent = this.map.viewer;
			
			var bbox = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
			
			var url;
			url = this.server +
			 	  "&service=WMS" +
				  "&version=" + this.version +
				  "&request=GetMap" +
				  "&layers=" + this.layers +
				  "&styles=" + this.styles +
				  "&bbox=" + bbox + 
				  "&width=" + w + 
				  "&height=" + h + 
				  "&srs=" + this.srs + 
				  "&format=" + this.format +
				  "&transparent=" + this.transparent;
			
			this.image.src = url;
//		}
		
		var renderer = this.map.renderer;
		if(this.image.complete){
			renderer.drawImage(this.image, 0, 0, w, h);	
		}
		else{
			var tile = this;
			this.image.onload = function(){
				renderer.drawImage(tile.image, 0, 0, w, h);
			};
		}
	}

});