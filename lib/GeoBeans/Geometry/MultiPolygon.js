GeoBeans.Geometry.MultiPolygon = GeoBeans.Class(GeoBeans.Geometry,{
	
	polygons : null,
	type : GeoBeans.Geometry.Type.MULTIPOLYGON,
	
	initialize : function(polygons){
		this.polygons = polygons;
		this.extent = this.computeExtent();
	},
	
	destory : function(){
		this.polygons = null;
	},
	
	computeExtent : function(){
		
		var extent = null;
		var len = this.polygons.length;
		
		if(len<1){
			return null;
		}
		var l = this.polygons[0];	
		extent = new GeoBeans.Envelope(l.extent.xmin,l.extent.ymin,l.extent.xmax,l.extent.ymax);
		
		var env = null;
		for(var i=1; i<len; i++){
			l = this.polygons[i];
			extent.union(l.extent);
		}
		return extent;
	}
});