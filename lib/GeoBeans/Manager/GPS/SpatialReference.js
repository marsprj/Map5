// 空间参考
GeoBeans.SpatialReference = GeoBeans.Class({
	
	srid : null,

	srtext : null,

	proj : null,

	initialize : function(srid,srtext,proj){
		this.srid = srid;
		this.srtext = srtext;
		this.proj = proj;
	}
});