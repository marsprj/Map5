GeoBeans.Transformation = GeoBeans.Class({
	
	// map : null,
	mapViewer : null,
	
	win_w : null,
	win_h : null,
	win_cx : null,
	win_cy : null,
	
	view_w : null,
	view_h : null,
	view_c : null,
	
	scale : null,
	
	// initialize : function(map){
	// 	this.map = map;
	// },
	
	initialize : function(mapViewer){
		// this.map = map;
		this.mapViewer = mapViewer;
	},	
	// toMapPoint : function(sx, sy){
		
	// 	var mapX = ((sx - this.win_cx) / this.scale) + this.view_c.x;
	// 	var mapY = ((this.win_cy-  sy) / this.scale) + this.view_c.y;
		
	// 	var mc = new GeoBeans.Geometry.Point(mapX, mapY); 
	// 	return mc;
	// },

	// toMapPoint : function(sx, sy){
		
	// 	var mapX = ((sx - this.win_cx) / this.scale) + this.view_c.x;
	// 	var mapY = ((this.win_cy-  sy) / this.scale) + this.view_c.y;
		
	// 	var mc = new GeoBeans.Geometry.Point(mapX, mapY); 

	// 	if(this.map.rotateAngle != null){
	// 		var angle = this.map.rotateAngle;
	// 		var x = mc.x* Math.cos(Math.PI/180*angle) - mc.y * Math.sin(Math.PI/180*angle);
	// 		var y = mc.x* Math.sin(Math.PI/180*angle) + mc.y * Math.cos(Math.PI/180*angle);
	// 		 mc = new GeoBeans.Geometry.Point(x, y); 
	// 	}
	// 	return mc;
	// },	

	toMapPoint : function(sx,sy){
		// var mapX = ((sx - this.win_cx)* Math.cos(this.map.rotateAngle * Math.PI/180) - (this.win_cy-  sy) * Math.sin(this.map.rotateAngle * Math.PI/180) )/ this.scale + this.view_c.x;
		// var mapY = ((sx - this.win_cx)* Math.sin(this.map.rotateAngle * Math.PI/180) + (this.win_cy-  sy) * Math.cos(this.map.rotateAngle * Math.PI/180) )/ this.scale + this.view_c.y;
		
		// var map = this.mapViewer.getMap();
		var rotation = this.mapViewer.getRotation();
		var mapX = ((sx - this.win_cx)* Math.cos(rotation * Math.PI/180) - (this.win_cy-  sy) * Math.sin(rotation * Math.PI/180) )/ this.scale + this.view_c.x;
		var mapY = ((sx - this.win_cx)* Math.sin(rotation * Math.PI/180) + (this.win_cy-  sy) * Math.cos(rotation * Math.PI/180) )/ this.scale + this.view_c.y;
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
	// toScreenPoint : function(mx, my){
		
	// 	var screenX = this.scale * (mx - this.view_c.x) + this.win_cx;
	// 	var screenY = this.win_cy - this.scale * (my - this.view_c.y);
		
	// 	var sc = new GeoBeans.Geometry.Point(screenX, screenY);
	// 	// console.log(sc); 

	// 	if(this.map.rotateAngle != null){
	// 		var angle = this.map.rotateAngle;
	// 		var x = sc.x* Math.cos(Math.PI/180*angle) + sc.y * Math.sin(Math.PI/180*angle);
	// 		var y = -sc.x* Math.sin(Math.PI/180*angle) + sc.y * Math.cos(Math.PI/180*angle);
	// 		sc = new GeoBeans.Geometry.Point(x, y); 
	// 	}

	// 	return sc;
	// },

	toScreenPoint : function(mx,my){
		// var screenX = this.scale *((mx - this.view_c.x)* Math.cos(this.map.rotateAngle * Math.PI/180) + (my - this.view_c.y) * Math.sin(this.map.rotateAngle * Math.PI/180)) + this.win_cx;
		// var screenY = this.scale *((mx - this.view_c.x)* Math.sin(this.map.rotateAngle * Math.PI/180) - (my - this.view_c.y) * Math.cos(this.map.rotateAngle * Math.PI/180)) + this.win_cy;
		
		// var map = this.mapViewer.getMap();
		var rotation = this.mapViewer.getRotation();
		var screenX = this.scale *((mx - this.view_c.x)* Math.cos(rotation * Math.PI/180) + (my - this.view_c.y) * Math.sin(rotation * Math.PI/180)) + this.win_cx;
		var screenY = this.scale *((mx - this.view_c.x)* Math.sin(rotation * Math.PI/180) - (my - this.view_c.y) * Math.cos(rotation * Math.PI/180)) + this.win_cy;
		return  new GeoBeans.Geometry.Point(screenX, screenY); 
	},

	
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

	update : function(){
		
		var viewer = this.mapViewer.getExtent();
		var win_width = this.mapViewer._map.width;
		var win_height= this.mapViewer._map.height;
		
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
		
		this.mapViewer._map.tolerance = this.mapViewer._map.TOLERANCE / this.scale;
	}

});