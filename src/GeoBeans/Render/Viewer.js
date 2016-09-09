GeoBeans.Viewer = GeoBeans.Class({
	
	map : null,

	extent : null,
	center : null,
	rotation : 0.0,
	resolution : 1.0,
	
	
	initialize : function(map, options){
		this.map = map;
		this.extent = options.extent;
		this.rotation = options.rotation;
		this.resolution = options.resolution;
	},
	
	get extent(){
		return this.extent;
	}

	get center(){
		return this.center;
	}

	get rotation() {
		return this.rotation;
	}

	get resolution() {
		return this.resolution;
	}

	get map() {
		return this.map;
	}

	set map(val){
		this.map = val;
	}
});

/**
 * 设置Viewer的可见地图范围
 * @param {[type]} extent [description]
 */
GeoBeans.Viewer.prototype.setExtent(val){
	this.extent = val;
}

/**
 * 设置Viewer显示的地图中心点位置
 * @param {Point} center 地图显示的中心点
 */
GeoBeans.Viewer.prototype.setCenter(val){
	this.center = val;
}

/**
 * 设置Viewer的地图显示分辨率
 * @param {[type]} val [description]
 */
GeoBeans.Viewer.prototype.setResolution(val){
	this.resolution = val;
}

/**
 * 设置地图的旋转角度
 * @param {[float]} val 地图旋转角
 */
GeoBeans.Viewer.prototype.setRotation(val){
	this.rotation = val;
}
