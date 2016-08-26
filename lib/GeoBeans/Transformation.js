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
	
	// toMapPoint : function(sx, sy){
		
	// 	var mapX = ((sx - this.win_cx) / this.scale) + this.view_c.x;
	// 	var mapY = ((this.win_cy-  sy) / this.scale) + this.view_c.y;
		
	// 	var mc = new GeoBeans.Geometry.Point(mapX, mapY); 
	// 	return mc;
	// },

	toMapPoint : function(sx, sy){
		
		var mapX = ((sx - this.win_cx) / this.scale) + this.view_c.x;
		var mapY = ((this.win_cy-  sy) / this.scale) + this.view_c.y;
		
		var mc = new GeoBeans.Geometry.Point(mapX, mapY); 

		if(this.map.rotateAngle != null){
			var angle = this.map.rotateAngle;
			var x = mc.x* Math.cos(Math.PI/180*angle) - mc.y * Math.sin(Math.PI/180*angle);
			var y = mc.x* Math.sin(Math.PI/180*angle) + mc.y * Math.cos(Math.PI/180*angle);
			 mc = new GeoBeans.Geometry.Point(x, y); 
		}
		return mc;
	},	

	toMapPoint : function(sx,sy){
		var mapX = ((sx - this.win_cx)* Math.cos(this.map.rotateAngle * Math.PI/180) - (this.win_cy-  sy) * Math.sin(this.map.rotateAngle * Math.PI/180) )/ this.scale + this.view_c.x;
		var mapY = ((sx - this.win_cx)* Math.sin(this.map.rotateAngle * Math.PI/180) + (this.win_cy-  sy) * Math.cos(this.map.rotateAngle * Math.PI/180) )/ this.scale + this.view_c.y;
		return new GeoBeans.Geometry.Point(mapX, mapY); 
	},


	// toMapPoint : function(sx,sy){
	// 	var point_screen_center = new GeoBeans.Geometry.Point(this.win_cx,this.win_cy);
	// 	var distance = GeoBeans.Utility.getDistance(point_screen_center.x,point_screen_center.y,sx,sy);

	// 	// var mapX = distance* Math.sin(this.map.rotateAngle * Math.PI/180) /this.scale + this.view_c.x;
	// 	// var mapY = -distance* Math.cos(this.map.rotateAngle * Math.PI/180) /this.scale + this.view_c.y;
	// 	var mapX = distance* Math.sin(this.map.rotateAngle * Math.PI/180) /this.scale + this.view_c.x;
	// 	var mapY = -distance* Math.cos(this.map.rotateAngle * Math.PI/180) /this.scale + this.view_c.y;
	// 	return new GeoBeans.Geometry.Point(mapX, mapY); 
	// },
	toScreenPoint : function(mx, my){
		
		var screenX = this.scale * (mx - this.view_c.x) + this.win_cx;
		var screenY = this.win_cy - this.scale * (my - this.view_c.y);
		
		var sc = new GeoBeans.Geometry.Point(screenX, screenY);
		// console.log(sc); 

		if(this.map.rotateAngle != null){
			var angle = this.map.rotateAngle;
			var x = sc.x* Math.cos(Math.PI/180*angle) + sc.y * Math.sin(Math.PI/180*angle);
			var y = -sc.x* Math.sin(Math.PI/180*angle) + sc.y * Math.cos(Math.PI/180*angle);
			// var x = sc.x* Math.sin(Math.PI/180*angle) + sc.y * Math.cos(Math.PI/180*angle);
			// var y = -sc.x* Math.cos(Math.PI/180*angle) + sc.y * Math.sin(Math.PI/180*angle);
			// var x = sc.x* 3 - sc.y *3;
			// var y = sc.x* 2/5 + sc.y *2/5;
			sc = new GeoBeans.Geometry.Point(x, y); 
		}

		return sc;
	},

	toScreenPoint : function(mx,my){
		var screenX = this.scale *((mx - this.view_c.x)* Math.cos(this.map.rotateAngle * Math.PI/180) + (my - this.view_c.y) * Math.sin(this.map.rotateAngle * Math.PI/180)) + this.win_cx;
		var screenY = this.scale *((mx - this.view_c.x)* Math.sin(this.map.rotateAngle * Math.PI/180) - (my - this.view_c.y) * Math.cos(this.map.rotateAngle * Math.PI/180)) + this.win_cy;
		return  new GeoBeans.Geometry.Point(screenX, screenY); 
	},



	// toScreenPoint : function(){

	// },
	
	/**
	 * Method: 更新transformation参数
	 *
	 * Parameters:
	 *
	 **/
	// update : function(){
		
	// 	var viewer = this.map.viewer;
	// 	var win_width = this.map.width;
	// 	var win_height= this.map.height;
		
	// 	this.win_w = parseFloat(win_width);
	// 	this.win_h = parseFloat(win_height);
	// 	this.win_cx = win_width  / 2;
	// 	this.win_cy = win_height / 2;
		
	// 	this.view_w = viewer.getWidth();
	// 	this.view_h = viewer.getHeight();
	// 	this.view_c = viewer.getCenter(); 
		
	// 	var sacle_x = this.win_w / this.view_w;
	// 	var sacle_y = this.win_h / this.view_h;
	// 	this.scale = sacle_x < sacle_y ? sacle_x : sacle_y;
		
	// 	this.map.tolerance = this.map.TOLERANCE / this.scale;
	// }

// 加载角度 test
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

		// this.view_w = this.view_w * Math.cos(this.map.rotateAngle* Math.PI/180);
		// this.view_h = this.view_h * Math.sin(this.map.rotateAngle* Math.PI/180);
		
		this.view_c = viewer.getCenter(); 
		
		var sacle_x = this.win_w / this.view_w;
		var sacle_y = this.win_h / this.view_h;
		this.scale = sacle_x < sacle_y ? sacle_x : sacle_y;
		
		this.map.tolerance = this.map.TOLERANCE / this.scale;
	},


	getParms : function(){
		var viewer = this.map.viewer;
		var viewer_minmax = viewer.rotateMaxMin(this.rotateAngle);

		var screen_h = this.map.height;
		var screen_w = this.map.width;

		var center = viewer.getCenter();

		// 旋转后，左下角点的坐标
		var viewer_min = viewer_minmax.min;
		// 左下角点的屏幕坐标
		var screen_min = new GeoBeans.Geometry.Point(0,screen_h);

		// 旋转后，右上角点的坐标
		var viewer_max = viewer_minmax.max;

		var screen_max = new GeoBeans.Geometry.Point(screen_w,0);




	},
});