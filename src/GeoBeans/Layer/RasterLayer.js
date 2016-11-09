/**
 * @classdesc
 * 栅格图层
 *
 *	var layer = new GeoBeans.Layer.RasterLayer({
 * 					"name" : "layername",
 * 					"source" : 	new GeoBeans.Source.Raster.WMS({
 * 									"url" : 'http://..',
 * 									"version" : "1.1.0",
 * 									"layers"  : ["cities","rivers","country"],
 * 									"styles"  : ["point" ,"line",  "polygon"],
 * 									"format"  : "image/png",
 * 									"srs"	  : "EPSG:4326",
 * 									"transparent": true
 * 					})
 * 				});
 * 
 * @class
 * @extends {GeoBeans.Layer}
 * @param 	{object} options options
 * @api stable
 */
GeoBeans.Layer.RasterLayer = GeoBeans.Class(GeoBeans.Layer,{

	CLASS_NAME : "GeoBeans.Layer.RasterLayer",

	/**
	 * new GeoBeans.Layer.RasterLayer({
	 * 	"name" : "layername",
	 *  "source" : 	new GeoBeans.Source.Raster.WMS({
	 * 					"url" : 'http://..',
	 * 		   			"version" : "1.1.0",
	 * 		      		"layers"  : ["cities","rivers","country"],
	 * 		        	"styles"  : ["point" ,"line",  "polygon"],
	 * 		         	"format"  : "image/png",
	 * 		          	"srs"	  : "EPSG:4326",
	 * 		            "transparent": true
	 * 	})
	 * });
	 */
	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.name = options.name;
		this._source = options.source;
	},

	destroy : function(){		
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
	}
});



/**
 * 重绘图层
 * @public
 * @override
 */
GeoBeans.Layer.RasterLayer.prototype.draw = function(){

	if(!this.isVisible()){
		this.clear();
		return;
	}

	var success = {
		renderer: this.renderer,
		execute : function(raster){
			var image = raster.getImage();
			var w = raster.getWidth();
			var h = raster.getHeight();
			this.renderer.clearRect(0,0,w,h);
			this.renderer.drawImage(image, 0, 0, w, h);
		}
	}

	var failure = {
		execute : function(){
			console.log("failure");	
		}
	}

	if(isValid(this._source)){
		var viewer = this.map.getViewer();
		this._source.getRaster(viewer.getExtent(),
							   {
							   	"width"  : viewer.getWindowWidth(),
							   	"height" : viewer.getWindowHeight(),
							   },
							   success,
							   failure);
	}
}