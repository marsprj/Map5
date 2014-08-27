GeoBeans.Geometry.MultiLineString = GeoBeans.Class(GeoBeans.Geometry,{
	
	lines : null,
	type : GeoBeans.Geometry.Type.MULTILINESTRING,
	
	initialize : function(lines){
		this.lines = lines;		
	},
	
	destory : function(){
		this.lines = null;
	}
});