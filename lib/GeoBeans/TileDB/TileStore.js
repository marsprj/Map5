GeoBeans.TileStore = GeoBeans.Class({
	
	// 名称
	name 		: null,
	
	// 范围
	extent 		: null,
	
	// 样式
	format 		: null,
	
	// 切图方式
	tms 		: null,

	// 数据库
	sourceName 	: null,

	// 起始级别
	startLevel : null,

	// 终止级别
	endLevel : null,

	srid : null,

	initialize : function(name,extent,format,tms,sourceName,startLevel,endLevel,srid){
		this.name = name;
		this.extent = extent;
		this.format = format;
		this.tms = tms;
		this.sourceName = sourceName;
		this.startLevel = startLevel;
		this.endLevel = endLevel;
		this.srid = srid;
	}
});