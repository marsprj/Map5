GeoBeans.Viewer = GeoBeans.Class({
	
	_map : null,

	_extent : null,
	_viewer : null,
	_center : null,
	_rotation : 0.0,
	_resolution : 1.0,

	_transformation : null,
	
	
	initialize : function(map, options){
		this._map = map;

		this._extent = options.extent;
		// this._viewer = options.viewer;
		// if(this._viewer == null){
		// 	this._viewer = this._extent;
		// }
		// this.setViewer(this._viewer);
		this.setExtent(this._extent);
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

	getZoom : null,

	setZoom : null,

	_setZoom : null,

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
 * @private
 * @return {} 
 */
GeoBeans.Viewer.prototype.cleanup = function(){
	this._center = null;
};

/**
 * 设置Viewer的可见地图范围
 * @public
 * @param {GeoBeans.Envelope} extent  地图的范围
 */
GeoBeans.Viewer.prototype.setExtent = function(val){
	// this._extent = val;
	var map = this._map;
	var baseLayer = map.baseLayer;
	if(baseLayer != null){
		var zoom = this.getZoomByExtent(val);
		this._setZoom(zoom);
		var center = val.getCenter();
		this.setCenter(center);
	}else{
		var extent = this.scaleView(val);
		this._extent = val;
		this.update();
	}
};


/**
 * [getExtent 返回地图范围]
 * @public
 * @return {GeoBeans.Envelope} 地图的范围
 */
GeoBeans.Viewer.prototype.getExtent = function(){
	return this._extent;
};


/**
 * 设置Viewer显示的地图中心点位置
 * @public
 * @param {GeoBeans.Geometry.Point} center 地图显示的中心点
 */
GeoBeans.Viewer.prototype.setCenter = function(val){
	if(this._extent != null){
		var offset_x = val.x - this._center.x;
		var offset_y = val.y - this._center.y;
		this._extent.offset(offset_x, offset_y);
		this._center = val;
		this.update();
	}else{
		this._center = val;
	}
	
	this._map.refresh();
};

/**
 * 返回当前视口的中心点
 * @public
 * @return {GeoBeans.Geometry.Point} 地图显示的中心点
 */
GeoBeans.Viewer.prototype.getCenter = function(){
	return this._center;
};


/**
 * 设置Viewer的地图显示分辨率
 * @public
 * @param {float} val 分辨率
 */
GeoBeans.Viewer.prototype.setResolution = function(val){
	this._resolution = val;
};


/**
 * 返回Viewer地图的显示分辨率
 * @public
 * @return {float} 地图的分辨率
 */
GeoBeans.Viewer.prototype.getResolution = function(){
	return this._resolution;
}

/**
 * 设置地图的旋转角度
 * @public
 * @param {float} val 地图旋转角
 */
GeoBeans.Viewer.prototype.setRotation = function(val){
	this._rotation = val;
	if(this._rotation != null){
		this.rotateViewer();
	}
};


/**
 * 返回地图的旋转角度
 * @public
 * @return {float} 地图旋转角
 */
GeoBeans.Viewer.prototype.getRotation = function(){
	return this._rotation;
};

/**
 * 返回地图显示级别
 * @public
 * @param  {GeoBeans.Envelope} viewer 返回
 * @return {int}        			  地图级别
 */
GeoBeans.Viewer.prototype.getZoom = function(){
	return this._zoom;
};

/**
 * 设置地图显示级别
 * @param {int} zoom 地图的级别
 */
GeoBeans.Viewer.prototype.setZoom = function(zoom){
	var map = this._map;
	map.level = zoom;
	if(map.baseLayer != null){
		map.baseLayer.imageScale = 1.0;
		var resolution = map.baseLayer.getResolutionByLevel(zoom);
		this.setResolution(resolution);
		this.updateMapExtent(this._resolution);
		this.update();
	}

	this._map.refresh();
};

GeoBeans.Viewer.prototype.setZoomCenter = function(zoom,center){
	var map = this._map;
	map.level = zoom;

	//set zoom
	if(map.baseLayer != null){
		map.baseLayer.imageScale = 1.0;
		var resolution = map.baseLayer.getResolutionByLevel(zoom);
		this.setResolution(resolution);
		this.updateMapExtent(this._resolution);
		this.update();
	}

	// set center
	if(this._extent != null){
		var offset_x = center.x - this._center.x;
		var offset_y = center.y - this._center.y;
		this._extent.offset(offset_x, offset_y);
		this._center = center;
		this.update();
	}else{
		this._center = center;
	}

	this._map.refresh();
};


/**
 * 根据resuoltion计算Zoom
 * @public
 * @param  {GeoBeans.Envelope} viewer 返回
 * @return {int}        			  地图级别
 */
GeoBeans.Viewer.prototype.getZoomByExtent = function(extent){
	if(extent == null){
		return null;
	}	

	var map = this._map;
	var map = this._map;
	var cx = extent.getCenter().x;
	var cy = extent.getCenter().y;	

	var vw = map.width;
	var vh = map.height;

	var mw = cx - extent.xmin;
	var mh = cy - extent.ymin;

	var resolution = mw*2/vw;

	if(map.baseLayer == null){
		return null;
	}

	var zoom = map.baseLayer.getLevel(resolution);
	if(zoom == null){
		return 1;
	}
	return zoom;	
};



/**
 * 设置地图的级别，不改变缩放比例,绘制出的底图会放大或者缩小
 * @param {int} zoom 地图的级别
 */
GeoBeans.Viewer.prototype._setZoom = function(zoom){
	var map = this._map;
	map.level = zoom;
	if(map.baseLayer != null){
		var resolution = map.baseLayer.getResolution(zoom);
		this.setResolution(resolution);
		this.updateMapExtent(this._resolution);
		this.update();
	}
};



/**
 * 根据分辨率和中心点计算当前视图范围的Viewer
 * @param  {GeoBeans.Envelope} resolution 地图分辨率
 */
GeoBeans.Viewer.prototype.updateMapExtent = function(resolution){
	var cx = this._center.x;
	var cy = this._center.y;
	var vw = this._map.width;
	var vh = this._map.height;
	
	var mw = resolution * vw / 2; 
	var mh = resolution * vh / 2; 	

	var xmin = cx - mw;
	var xmax = cx + mw;
	var ymin = cy - mh;
	var ymax = cy + mh;
	
	if(this._extent!=null){
		this._extent.xmin = xmin;
		this._extent.xmax = xmax;
		this._extent.ymin = ymin;
		this._extent.ymax = ymax;
	}else{
		this._extent = new GeoBeans.Envelope(xmin, ymin, xmax, ymax);
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
	var w_scale = this._map.width / this._map.height;
	
	
	var center = extent.getCenter();
	this._center = center;

	var viewer = null;
	
	if(v_scale > w_scale){
		//strech height
		var w_2 = extent.getWidth() / 2;
		var h_2 = w_2 / w_scale;
		viewer = new GeoBeans.Envelope(	extent.xmin,											
										this._center.y - h_2,
										extent.xmax,
										this._center.y + h_2);
	}
	else{
		//strech width
		var h_2 = extent.getHeight() / 2;
		var w_2 = h_2 * w_scale;
		
		viewer = new GeoBeans.Envelope(	this._center.x - w_2,
										extent.ymin,
										this._center.x + w_2,											
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
	this._center = extent.getCenter();
	var w_scale = this._map.width / this._map.height;

	var h_2 = extent.getHeight() / 2;
	var w_2 = h_2 * w_scale;
	
	var viewer = new GeoBeans.Envelope(	this._center.x - w_2,
									extent.ymin,
									this._center.x + w_2,											
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
	this._center = extent.getCenter();
	var w_scale = this._map.width / this._map.height;

	var w_2 = extent.getWidth() / 2;
	var h_2 = w_2 / w_scale;
	var viewer = new GeoBeans.Envelope(	extent.xmin,											
									this._center.y - h_2,
									extent.xmax,
									this._center.y + h_2);
	return viewer;		
};


/**
 * 对地图的视口进行偏移
 * @param  {float} offset_x X方向上偏移量
 * @param  {float} offset_y Y方向上偏移量
 */
GeoBeans.Viewer.prototype.offset = function(offset_x,offset_y){
	if(this._extent != null){
		this._extent.offset(offset_x,offset_y);
		this._center.x += offset_x;
		this._center.y += offset_y;
		this.update();
	}else{
		this._center.x += offset_x;
		this._center.y += offset_y;
	}
};


/**
 * 屏幕坐标转换为地图坐标
 * @param  {float} sx 屏幕坐标X值
 * @param  {float} sy 屏幕坐标Y值
 * @return {GeoBeans.Geometry.Point}    转换后的地图坐标值
 */
GeoBeans.Viewer.prototype.toMapPoint = function(sx,sy){
	var rotation = this.getRotation();
	var mapX = ((sx - this.win_cx)* Math.cos(rotation * Math.PI/180) - (this.win_cy-  sy) * Math.sin(rotation * Math.PI/180) )/ this.scale + this.view_c.x;
	var mapY = ((sx - this.win_cx)* Math.sin(rotation * Math.PI/180) + (this.win_cy-  sy) * Math.cos(rotation * Math.PI/180) )/ this.scale + this.view_c.y;
	return new GeoBeans.Geometry.Point(mapX, mapY); 
};


/**
 * 地图坐标转换为屏幕坐标
 * @param  {float} mx 地图坐标X值
 * @param  {float} my 地图坐标Y值
 * @return {GeoBeans.Geometry.Point}    转换后的屏幕坐标值
 */
GeoBeans.Viewer.prototype.toScreenPoint = function(mx,my){
	var rotation = this.getRotation();
	var screenX = this.scale *((mx - this.view_c.x)* Math.cos(rotation * Math.PI/180) + (my - this.view_c.y) * Math.sin(rotation * Math.PI/180)) + this.win_cx;
	var screenY = this.scale *((mx - this.view_c.x)* Math.sin(rotation * Math.PI/180) - (my - this.view_c.y) * Math.cos(rotation * Math.PI/180)) + this.win_cy;
	return  new GeoBeans.Geometry.Point(screenX, screenY); 
};


/**
 *  旋转地图的范围
 * @return 
 */
GeoBeans.Viewer.prototype.rotateViewer = function(){
	var leftTop = this.toMapPoint(0,0);
	var leftBottom = this.toMapPoint(0,this._map.height);
	var rightTop = this.toMapPoint(this._map.width,0);
	var rightBottom = this.toMapPoint(this._map.width,this._map.height);

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

	var extent = new GeoBeans.Envelope(min_x,min_y,max_x,max_y);
	this._extent = extent;
};


// /**
//  * 设置地图
//  * @public
//  * @param {[GeoBeans.Map]} map 地图 
//  */
// GeoBeans.Viewer.prototype.setMap = function(map){
// 	this._map = map;
// };


/**
 * 返回地图
 * @public
 * @return {GeoBeans.Map} 地图
 */
GeoBeans.Viewer.prototype.getMap = function(){
	return this._map;
};


/**
 * 更新
 * @return 
 */
GeoBeans.Viewer.prototype.update = function(){
	var extent = this.getExtent();
	var win_width = this._map.width;
	var win_height = this._map.height;

	this.win_w = parseFloat(win_width);
	this.win_h = parseFloat(win_height);
	this.win_cx = win_width  / 2;
	this.win_cy = win_height / 2;


	this.view_w = extent.getWidth();
	this.view_h = extent.getHeight();
	this.view_c = extent.getCenter(); 

	var scale_x = this.win_w / this.view_w;
	var scale_y = this.win_h / this.view_h;
	this.scale = scale_x < scale_y ? scale_x : scale_y;

	this._map.tolerance = this._map.TOLERANCE / this.scale;
};