GeoBeans.Layer.RasterDBLayer = GeoBeans.Class(GeoBeans.Layer.DBLayer,{
	
	// 影像路径
	rasterPath : null,
	
	type 		: null,
	initialize : function(name,id,dbName,typeName,queryable,visible,rasterPath){
		GeoBeans.Layer.DBLayer.prototype.initialize.apply(this, arguments);

		if(rasterPath != undefined){
			this.rasterPath = rasterPath;
		}

		this.type = GeoBeans.Layer.DBLayer.Type.Raster;
	},
});