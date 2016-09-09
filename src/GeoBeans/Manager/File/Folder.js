GeoBeans.Folder = GeoBeans.Class({
	name : null,
	accessTime : null,
	lastTime : null,
	// 加上名称后的路径
	path : null,
	// 当前路径
	parPath : null,

	initialize : function(parPath,path,name,accessTime,lastTime){
		this.parPath = parPath;
		this.path = path;
		this.name = name;
		this.accessTime = accessTime;
		this.lastTime = lastTime;
	}
});