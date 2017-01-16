GeoBeans.RasterImg = GeoBeans.Class({
	// 名称
	name : null,

	// 格式
	format : null,

	// 波段
	bands : null,
	
	width : null,
	
	height : null,

	// 空间范围
	extent : null,

	initialize : function(name,format,bands,srid,width,height,extent){
		this.name = name;
		this.format = format;
		this.bands = bands;
		this.srid = srid;
		this.width = width;
		this.height = height;
		this.extent = extent;
	},
});