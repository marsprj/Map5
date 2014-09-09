GeoBeans.Geometry.Polygon = GeoBeans.Class(GeoBeans.Geometry,{

	rings : null,
	type : GeoBeans.Geometry.Type.POLYGON,
	
	initialize : function(rings){
		this.rings = rings;
	},
	
	computeExtent : function(){
		
		var extent = null;
		var len = this.rings.length;
		
		if(len<1){
			return null;
		}
		var l = this.rings[0];	
		extent = new GeoBeans.Envelope(l.extent.xmin,l.extent.ymin,l.extent.xmax,l.extent.ymax);
		
		var env = null;
		for(var i=1; i<len; i++){
			l = this.rings[i];
			extent.union(l.extent);
		}
		return extent;
	}
});