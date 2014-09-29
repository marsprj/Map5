// JavaScript Document
GeoBeans.Map = GeoBeans.Class({
	
	TOLERANCE : 10,
	
	/*
	 * HTML 5 canvas
	 */
	canvas : null,
	
	events : null,
	
	/**
	 * 地图当前视口
	 **/
	viewer : null,
	
	/**
	 * center有默认值(0,0)
	 **/
	center : null,
	
	/**
	 * level有默认值null
	 **/
	level  : null,
	
	resolution : null,
	
	layers : null,
	
	baseLayer : null,
	
	srid : "EPGS : 4326",
	
	minScale : null,
	
	maxScale : null,
	
	width : null,
	
	height : null,
	
	renderer : null,
	
	bgColor : 'rgba(255,255,255,1)',
	
	tolerance : 5,
	
	transformation : null,
	
	/* set whether the map can be drag */
	dragable : true,
	
	snap : null,
	
	initialize: function (id, options) {
		
		this.layers = [];
		
		this.canvas = document.getElementById(id);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		this.center = new GeoBeans.Geometry.Point(0,0);
		
		this.transformation = new GeoBeans.Transformation(this);
		
		this.renderer = new GeoBeans.Renderer(this.canvas.getContext('2d'));

		this.scrollMap();
		this.dragMap();
	},
	
	destroy : function(){
		this.canvas = null;
		this.renderer = null;
		this.layers = null;
		this.transformation = null;
	},
	
	addLayer : function(layer){
		if(layer!=null){
			layer.setMap(this);
			//layer.init();
			this.layers.push(layer);
		}
	},
	
	setViewer : function(extent){		
		this.viewer = this.scaleView(extent);
		this.transformation.update();
	},
	
	getViewer : function(){		
		return this.viewer;
	},
	
	/**
	 * 更新center点后，需要更新map的视口
	 * 触发draw事件
	 **/
	setCenter : function(center){
		
		if(this.viewer!=null){
			var offset_x = center.x - this.center.x;
			var offset_y = center.y - this.center.y;
			this.viewer.offset(offset_x, offset_y);
			this.center = center;
			
			this.transformation.update();
			
			//this.draw();
		}
		else{
			this.center = center;
		}
	},
	
	offset : function(offset_x, offset_y){
		
		if(this.viewer!=null){
			this.viewer.offset(offset_x, offset_y);
			this.center.x += offset_x;
			this.center.y += offset_y;
			this.transformation.update();			
		}
		else{
			this.center.x += offset_x;
			this.center.y += offset_y;
		}
	},
	
	/**
	 * 可以根据Level确定map的
	 * 1. resolution
	 * 2. viewer(center有默认值)
	 */	
	setLevel : function(level){
		this.level = level;
		if(this.baseLayer!=null){
			
			this.baseLayer.scale = 1.0;
			this.resolution = this.baseLayer.getResolution(level);
			this.updateMapExtent(this.resolution);
			
			this.transformation.update();
		}
	},
	
	
	/**
	 * 根据map的width和height的比例，重新计算extent的范围
	 * 1. extent的center保持不变
	 * 2. extent的长宽比和map一致
	 **/
	formulateExtent : function(extent){
		
	},
	
	setResolution : function(resolution){
		this.resolution = resolution;
	},
	
	setBaseLayer : function(layer){
		this.baseLayer = layer;
		if(this.baseLayer!=null){
			this.baseLayer.setMap(this);
		}
	},
	
	/**
     * 根据resolution和中心点计算当前视图范围的地图viewer
     */
	updateMapExtent : function(resolution){
		var cx = this.center.x;
		var cy = this.center.y;
		var vw = this.width;
		var vh = this.height;
		
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
	},
	
	draw : function(){
		this.renderer.save();
		this.drawBackground();
		if(this.baseLayer!=null){
			this.baseLayer.draw();
		}
		//for(var i=this.layers.length-1; i>=0; i--){
		for(var i=0; i<this.layers.length; i++){
			this.layers[i].draw();
		}
		this.renderer.restore();
	},
	
	drawCache : function(){
		this.drawBackground();
		if(this.baseLayer!=null){
			this.baseLayer.drawCache();
		}
	},
	
	drawBackground : function(){
		var context = this.renderer.context;
		context.fillStyle = this.bgColor;
		context.fillRect(0,0,this.width,this.height);
	},
	
//	scrollMap : function(){
//		var that = this;
//		var isScrolling = false;
//		var onMouseWheel = function(event){
//			if(isScrolling = true){
//				return false;
//			}
//			
//			isScrolling = true;
//			setTimeout(function(){
//				isScrolling = false;
//			},150);
//			if(event.wheelDelta>0){
//				alert("+");
//			}
//			else{
//				alert("-");
//			}
//			
//		};
//	},

	scrollMap : function(){
		this.canvas.addEventListener('mousewheel', function(e){
			var map = mapObj;
			var pos = e.x + "," + e.y;
			
			if(this.baseLayer!=null){
				var level = map.level;
				if(e.wheelDelta>0){
					level++;
					if(level<=map.baseLayer.MAX_ZOOM_LEVEL){
						map.setLevel(level);
						map.draw();
					}
				}
				else{
					level--;
					if(level>=map.baseLayer.MIN_ZOOM_LEVEL){
						map.setLevel(level);
						map.draw();
					}
				}
			}
			else{
				if(e.wheelDelta>0){
					map.viewer.scale(1/1.2);
					map.transformation.update();
					map.draw();
				}
				else{
					map.viewer.scale(1.2);
					map.transformation.update();
					map.draw();
				}
			}
		});
	},
	
	enableDrag : function(dragable){
		this.dragable = dragable;
	},
	
	dragMap : function(){
		
		var d_x, d_y;
		var m_x, m_y;
		var o_x, o_y;
		
		var map = this;
		var draging = false;
				
		var onmousedown = function(evt){
			
			if(!map.dragable){
				return;
			}
			
			var maskImg = map.screenCopy();
			var mask_x = 0;
			var mask_y = 0;
			var mask_w = map.width;
			var mask_h = map.height;
			
			d_x = evt.layerX;
			d_y = evt.layerY;
			var d_p = map.transformation.toMapPoint(d_x, d_y);
			draging = true;			
			var onmousemove = function(evt){
				if(draging){
					
					mask_x += (evt.layerX - d_x);
					mask_y += (evt.layerY - d_y);
					
					map.drawBackground();
					//map.renderer.drawImage(maskImg, mask_x, mask_y, mask_w, mask_h);
					map.renderer.context.putImageData(maskImg, mask_x, mask_y);
												
					d_x = evt.layerX;
					d_y = evt.layerY;					
				}
			};
			var onmouseup = function(evt){
		
				maskImg = null;
				
				var m_p = map.transformation.toMapPoint(evt.layerX, evt.layerY);
				o_x = (d_p.x - m_p.x);
				o_y = (d_p.y - m_p.y);

				map.offset(o_x, o_y);
				map.draw();
			
				pos = null;
				draging = false;
				
				map.canvas.removeEventListener("mousemove", onmousemove);
				map.canvas.removeEventListener("mouseup", onmouseup);				
			};
			map.canvas.addEventListener("mousemove", onmousemove);
			map.canvas.addEventListener("mouseup", onmouseup);
		};
		this.canvas.addEventListener("mousedown", onmousedown);
		
	},
	
	addEventListener : function(event, handler){
		var map = this;
		this.canvas.addEventListener(event, function(evt){
			var x = evt.layerX;
			var y = evt.layerY;
			
			var mp = map.transformation.toMapPoint(x, y);
			var args = new GeoBeans.Event.MouseArgs();
			args.buttn = null;
			args.X = x;
			args.Y = y;
			args.mapX = mp.x;
			args.mapY = mp.y;
			handler(args);
		});
	},
	
	scaleView : function(extent){
		var v_scale = extent.getWidth() / extent.getHeight();
		var w_scale = this.width / this.height;
		
		this.center = extent.getCenter();
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
	},
	
	screenCopy : function(){
//		var img = new Image();
//		img.src = this.canvas.toDataURL("image/png");
//		return img;

		var imgData = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		return imgData;
	},
	
	
	saveSnap : function(){
		this.snap = this.renderer.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	},
	
	restoreSnap : function(){
		if(this.snap!=null){
			this.renderer.context.putImageData(this.snap, 0, 0);
		}
	},
	
	cleanSnap : function(){
		this.snap = null;
	}
});