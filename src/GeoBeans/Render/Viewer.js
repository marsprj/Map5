GeoBeans.Viewer = GeoBeans.Class({
	
	map : null,

	extent : null,
	viewer : null,
	center : null,
	rotation : 0.0,
	resolution : 1.0,

	transformation : null,
	
	
	initialize : function(map, options){
		this.map = map;

		this.transformation = new GeoBeans.Transformation(this);

		this.extent = options.extent;
		this.viewer = options.viewer;
		if(this.viewer == null){
			this.viewer = this.extent;
		}
		this.setViewer(this.viewer);
	},
	
	setExtent : null,

	getExtent : null,

	setCenter : null,

	getCenter : null,

	setResolution : null,

	getResolution : null,

	setRotation : null,

	getRotation : null,

	setMap : null,

	getMap : null,

	setViewer : null,

	getViewer : null,

	getLevel : null,

	setLevel : null,

	_setLevel : null,

	updateMapExtent : null,

	scaleView : null,

	scaleViewWidth : null,

	scaleViewHeight : null,

	offset : null,

	toMapPoint : null,

	toScreenPoint : null,	

});

/**
 * cleanup
 * @return {} 
 */
GeoBeans.Viewer.prototype.cleanup = function(){
	this.center = null;
};

/**
 * 设置Viewer的可见地图范围
 * @param {GeoBeans.Envelope} extent  地图的范围
 */
GeoBeans.Viewer.prototype.setExtent = function(val){
	this.extent = val;
};


/**
 * [getExtent 返回地图范围]
 * @return {GeoBeans.Envelope} 地图的范围
 */
GeoBeans.Viewer.prototype.getExtent = function(){
	return this.extent;
};


/**
 * 设置Viewer显示的地图中心点位置
 * @param {GeoBeans.Geometry.Point} center 地图显示的中心点
 */
GeoBeans.Viewer.prototype.setCenter = function(val){
	if(this.viewer != null){
		var offset_x = val.x - this.center.x;
		var offset_y = val.y - this.center.y;
		this.viewer.offset(offset_x, offset_y);
		this.center = val;
		this.transformation.update();
	}else{
		this.center = val;	
	}
	
};

/**
 * 返回当前视口的中心点
 * @return {GeoBeans.Geometry.Point} 地图显示的中心点
 */
GeoBeans.Viewer.prototype.getCenter = function(){
	return this.center;
};


/**
 *  设置Viewer的地图显示分辨率
 * @param {float} val 分辨率
 */
GeoBeans.Viewer.prototype.setResolution = function(val){
	this.resolution = val;
};


/**
 * 返回Viewer地图的显示分辨率
 * @return {float} 地图的分辨率
 */
GeoBeans.Viewer.prototype.getResolution = function(){
	return this.resolution;
}

/**
 * 设置地图的旋转角度
 * @param {float} val 地图旋转角
 */
GeoBeans.Viewer.prototype.setRotation = function(val){
	this.rotation = val;
	if(this.rotation != null){
		this.rotateViewer();
	}
};


/**
 * 返回地图的旋转角度
 * @return {float} 地图旋转角
 */
GeoBeans.Viewer.prototype.getRotation = function(){
	return this.rotation;
};

/**
 * 设置地图
 * @param {[GeoBeans.Map]} map 地图 
 */
GeoBeans.Viewer.prototype.setMap = function(map){
	this.map = map;
};


/**
 * 返回地图
 * @return {GeoBeans.Map} 地图
 */
GeoBeans.Viewer.prototype.getMap = function(){
	return this.map;
};


/**
 * 设置地图的视口范围
 * @param {GeoBeans.Envelope} viewer 地图的范围
 */
GeoBeans.Viewer.prototype.setViewer = function(viewer){
	if(viewer == null){
		return;
	}

	var map = this.map;

	var baseLayer = map.baseLayer;
	if(baseLayer != null){
		var level = this.getLevel(viewer);
		this._setLevel(level);
		var center = viewer.getCenter();
		this.setCenter(center);
	}else{
		var viewer = this.scaleView(viewer);
		this.viewer = viewer;
		this.transformation.update();
	}
};


/**
 * 返回地图的视口范围
 * @return {GeoBeans.Envelope} 地图的范围
 */
GeoBeans.Viewer.prototype.getViewer = function(){
	return this.viewer;
};


/**
 * 按照范围反算地图级别
 * @param  {GeoBeans.Envelope} viewer 返回
 * @return {int}        			  地图级别
 */
GeoBeans.Viewer.prototype.getLevel = function(viewer){
	if(viewer == null){
		return null;
	}

	var map = this.map;
	var cx = viewer.getCenter().x;
	var cy = viewer.getCenter().y;	

	var vw = map.width;
	var vh = map.height;

	var mw = cx - viewer.xmin;
	var mh = cy - viewer.ymin;

	var resolution = mw*2/vw;

	if(map.baseLayer == null){
		return null;
	}

	var level = map.baseLayer.getLevel(resolution);
	if(level == null){
		return 1;
	}
	return level;
};



/**
 * 设置地图的级别
 * @param {int} level 地图的级别
 */
GeoBeans.Viewer.prototype.setLevel = function(level){
	var map = this.map;
	map.level = level;
	if(map.baseLayer != null){
		map.baseLayer.imageScale = 1.0;
		var resolution = map.baseLayer.getResolutionByLevel(level);
		this.setResolution(resolution);
		this.updateMapExtent(this.resolution);
		this.transformation.update();
	}
};


/**
 * 设置地图的级别，不改变缩放比例,绘制出的底图会放大或者缩小
 * @param {int} level 地图的级别
 */
GeoBeans.Viewer.prototype._setLevel = function(level){
	var map = this.map;
	map.level = level;
	if(map.baseLayer != null){
		var resolution = map.baseLayer.getResolution(level);
		this.setResolution(resolution);
		this.updateMapExtent(this.resolution);
		this.transformation.update();
	}
};


/**
 * 根据resolution和中心点计算当前视图范围的地图viewer
 */

/**
 * 根据分辨率和中心点计算当前视图范围的Viewer
 * @param  {GeoBeans.Envelope} resolution 地图分辨率
 */
GeoBeans.Viewer.prototype.updateMapExtent = function(resolution){
	var cx = this.center.x;
	var cy = this.center.y;
	var vw = this.map.width;
	var vh = this.map.height;
	
	var mw = resolution * vw / 2; 
	var mh = resolution * vh / 2; 	

	var xmin = cx - mw;
	var xmax = cx + mw;
	var ymin = cy - mh;
	var ymax = cy + mh;
	
	if(this.viewer!=null){
		this.viewer.xmin = xmin;
		this.viewer.xmax = xmax;
		this.viewer.ymin = ymin;
		this.viewer.ymax = ymax;
	}else{
		this.viewer = new GeoBeans.Envelope(xmin, ymin, xmax, ymax);
	}	
};


/**
 * 根据长宽比例调整范围
 * @param  {GeoBeans.Envelope} extent 范围
 * @return {GeoBeans.Envelope}        调整后的范围
 */
GeoBeans.Viewer.prototype.scaleView = function(extent){
	if(extent == null){
		return  null;
	}
	var v_scale = extent.getWidth() / extent.getHeight();
	var w_scale = this.map.width / this.map.height;
	
	
	var center = extent.getCenter();
	this.center = center;

	var viewer = null;
	
	if(v_scale > w_scale){
		//strech height
		var w_2 = extent.getWidth() / 2;
		var h_2 = w_2 / w_scale;
		viewer = new GeoBeans.Envelope(	extent.xmin,											
										this.center.y - h_2,
										extent.xmax,
										this.center.y + h_2);
	}
	else{
		//strech width
		var h_2 = extent.getHeight() / 2;
		var w_2 = h_2 * w_scale;
		
		viewer = new GeoBeans.Envelope(	this.center.x - w_2,
										extent.ymin,
										this.center.x + w_2,											
										extent.ymax);
	}
	return viewer;
};


/**
 * 固定高度，拉伸宽度，调整范围
 * @param  {GeoBeans.Envelope} extent 范围
 * @return {GeoBeans.Envelope}        调整后的范围
 */
GeoBeans.Viewer.prototype.scaleViewWidth = function(extent){
	if(extent == null){
		return null;
	}
	this.center = extent.getCenter();
	var w_scale = this.map.width / this.map.height;

	var h_2 = extent.getHeight() / 2;
	var w_2 = h_2 * w_scale;
	
	var viewer = new GeoBeans.Envelope(	this.center.x - w_2,
									extent.ymin,
									this.center.x + w_2,											
									extent.ymax);
	return viewer;
};


/**
 * 固定宽度，拉伸高度，调整范围
 * @param  {GeoBeans.Envelope} extent 范围
 * @return {GeoBeans.Envelope}        调整后的范围
 */
GeoBeans.Viewer.prototype.scaleViewHeight = function(extent){
	if(extent == null){
		return null;
	}
	this.center = extent.getCenter();
	var w_scale = this.map.width / this.map.height;

	var w_2 = extent.getWidth() / 2;
	var h_2 = w_2 / w_scale;
	var viewer = new GeoBeans.Envelope(	extent.xmin,											
									this.center.y - h_2,
									extent.xmax,
									this.center.y + h_2);
	return viewer;		
};


/**
 * 对地图的视口进行偏移
 * @param  {float} offset_x X方向上偏移量
 * @param  {float} offset_y Y方向上偏移量
 */
GeoBeans.Viewer.prototype.offset = function(offset_x,offset_y){
	if(this.viewer != null){
		this.viewer.offset(offset_x,offset_y);
		this.center.x += offset_x;
		this.center.y += offset_y;
		this.transformation.update();
	}else{
		this.center.x += offset_x;
		this.center.y += offset_y;
	}
};


/**
 * 屏幕坐标转换为地图坐标
 * @param  {float} sx 屏幕坐标X值
 * @param  {float} sy 屏幕坐标Y值
 * @return {GeoBeans.Geometry.Point}    转换后的地图坐标值
 */
GeoBeans.Viewer.prototype.toMapPoint = function(sx,sy){
	return this.transformation.toMapPoint(sx,sy);
};


/**
 * 地图坐标转换为屏幕坐标
 * @param  {float} mx 地图坐标X值
 * @param  {float} my 地图坐标Y值
 * @return {GeoBeans.Geometry.Point}    转换后的屏幕坐标值
 */
GeoBeans.Viewer.prototype.toScreenPoint = function(mx,my){
	return this.transformation.toScreenPoint(mx,my);
};


/**
 *  旋转地图的范围
 * @return 
 */
GeoBeans.Viewer.prototype.rotateViewer = function(){
	var leftTop = this.toMapPoint(0,0);
	var leftBottom = this.toMapPoint(0,this.map.height);
	var rightTop = this.toMapPoint(this.map.width,0);
	var rightBottom = this.toMapPoint(this.map.width,this.map.height);

	var min_x = leftTop.x;
	var min_y = leftTop.y;
	var max_x = leftTop.x;
	var max_y = leftTop.y;

	min_x = (leftBottom.x  < min_x) ? leftBottom.x 	: min_x;
	min_x = (rightTop.x    < min_x) ? rightTop.x   	: min_x;
	min_x = (rightBottom.x < min_x) ? rightBottom.x : min_x;

	min_y = (leftBottom.y  < min_y) ? leftBottom.y 	: min_y;
	min_y = (rightTop.y    < min_y) ? rightTop.y   	: min_y;
	min_y = (rightBottom.y < min_y) ? rightBottom.y : min_y;

	max_x = (leftBottom.x  > max_x) ? leftBottom.x 	: max_x;
	max_x = (rightTop.x    > max_x) ? rightTop.x   	: max_x;
	max_x = (rightBottom.x > max_x) ? rightBottom.x : max_x;

	max_y = (leftBottom.y  > max_y) ? leftBottom.y 	: max_y;
	max_y = (rightTop.y    > max_y) ? rightTop.y   	: max_y;
	max_y = (rightBottom.y > max_y) ? rightBottom.y : max_y;

	var viewer = new GeoBeans.Envelope(min_x,min_y,max_x,max_y);
	this.viewer = viewer;
};

