GeoBeans.File = GeoBeans.Class({
	
	name : null,
	accessTime : null,
	lastTime : null,
	size : null,
	
	// 加上名称后的路径
	path : null,
	// 当前路径
	parPath : null,

	initialize : function(parPath,path,name,accessTime,lastTime,size){
		this.parPath = parPath;
		this.path = path;
		this.name = name;
		this.accessTime = accessTime;
		this.lastTime = lastTime;
		this.size = size;
	}
});