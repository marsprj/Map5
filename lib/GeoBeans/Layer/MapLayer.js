GeoBeans.Layer.MapLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	style_name : null,
	
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		
		this.style_name= null;
		
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
	},
	
	draw : function(){
/*		var w = this.map.canvas.width;
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
*/
	}

});