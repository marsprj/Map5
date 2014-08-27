GeoBeans.Layer.BaiduLayer = GeoBeans.Class(GeoBeans.Layer.TileLayerLayer, {
	
	FULL_EXTENT : new max.Extent({
        xmin: -20037508.3427892,
        ymin: -20037508.3427892,
        xmax: 20037508.3427892,
        ymax: 20037508.3427892
    }),
	ORIGIN :{
        x: 0,
        y: 0
    },
    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
	
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 19,	
    
	RESOLUTIONS : [
				131072, 
				65536,
				32768, 
				16384, 
				8192, 
				4096, 
				2048, 
				1024,
				512,
				256,
				128,
				64,
				32,
				16,
				8,
				4,
				2,
				1,
				0.5],
	
	initialize : function(name){
		GeoBeans.Layer.TileLayerLayer.prototype.initialize.apply(this, arguments);
		
	},
	
	destory : function(){
		GeoBeans.Layer.TileLayerLayer.prototype.destroy.apply(this, arguments);
	}
		
});