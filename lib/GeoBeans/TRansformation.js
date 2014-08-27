GeoBeans.Transformation = GeoBeans.Class({
	
	map : null,
	
	win_w : null,
	win_h : null,
	win_cx : null,
	win_cy : null,
	
	view_w : null,
	view_h : null,
	view_c : null,
	
	scale : null,
	
	initialize : function(map){
		this.map = map;
	},
	
//	set : function(win_width, win_height, viewer){
//		
//		this.win_w = parseFloat(win_width);
//		this.win_h = parseFloat(win_height);
//		this.win_cx = win_width  / 2;
//		this.win_cy = win_height / 2;
//		
//		this.view_w = viewer.getWidth();
//		this.view_h = viewer.getHeight();
//		this.view_c = viewer.getCenter(); 
//		
//		var sacle_x = this.win_w / this.view_w;
//		var sacle_y = this.win_h / this.view_h;
//		this.scale = sacle_x < sacle_y ? sacle_x : sacle_y;
//	},
	
	toMapPoint : function(sx, sy){
		
		var mapX = ((sx - this.win_cx) / this.scale) + this.view_c.x;
		var mapY = ((this.win_cy-  sy) / this.scale) + this.view_c.y;
		
		var mc = new GeoBeans.Geometry.Point(mapX, mapY); 
		return mc;
	},
	
	toScreenPoint : function(mx, my){
		
		var screenX = this.scale * (mx - this.view_c.x) + this.win_cx;
		var screenY = this.win_cy - this.scale * (my - this.view_c.y);
		
		var sc = new GeoBeans.Geometry.Point(screenX, screenY); 
		return sc;
	},
	
	/**
	 * 更新transformation参数
	 **/
	update : function(){
		
		var viewer = this.map.viewer;
		var win_width = this.map.width;
		var win_height= this.map.height;
		
		this.win_w = parseFloat(win_width);
		this.win_h = parseFloat(win_height);
		this.win_cx = win_width  / 2;
		this.win_cy = win_height / 2;
		
		this.view_w = viewer.getWidth();
		this.view_h = viewer.getHeight();
		this.view_c = viewer.getCenter(); 
		
		var sacle_x = this.win_w / this.view_w;
		var sacle_y = this.win_h / this.view_h;
		this.scale = sacle_x < sacle_y ? sacle_x : sacle_y;
	}
});