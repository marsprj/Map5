// JavaScript Document
GeoBeans.Map = GeoBeans.Class({
	
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
	
	transformation : null,
	
	initialize: function (id, options) {
		
		this.layers = [];
		
		this.canvas = document.getElementById(id);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		
		this.center = new GeoBeans.Geometry.Point(0,0);
		
		this.transformation = new GeoBeans.Transformation(this);
		
		this.renderer = new GeoBeans.Renderer(this.canvas.getContext('2d'));
		
		//this.scrollMap();
		
		this.canvas.addEventListener('mousewheel', function(e){
		//this.canvas.addEventListener('DOMMouseScroll', function(e){
			var map = mapObj;
			var pos = e.x + "," + e.y;
			
			//document.getElementById("container").innerHTML = pos;
			
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
		});
		
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
			layer.init();
			this.layers.push(layer);
		}
	},
	
	setViewer : function(extent){
		this.viewer = extent;
		//this.transformation.set(this.width, this.height, this.extent);
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
			
			//this.draw();
		}
	},
	
	setViewer : function(viewer){
		//this.center.x = (viewer.xmin + viewer.xmax) / 2;
		//this.center.y = (viewer.ymin + viewer.ymax) / 2;
		
		
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
		this.drawBackground();
		if(this.baseLayer!=null){
			this.baseLayer.draw();
		}
		for(var i=this.layers.length-1; i>=0; i--){
			this.layers[i].draw();
		}
	},
	
	drawCache : function(){
		this.drawBackground();
		if(this.baseLayer!=null){
			this.baseLayer.drawCache();
		}
	},
	
	drawBackground : function(){
		var context = this.renderer.context;
		context.fillStyle = 'rgba(255,255,255,1)';
		context.fillRect(0,0,this.width,this.height);
	},
	
	scrollMap : function(){
		var that = this;
		var isScrolling = false;
		var onMouseWheel = function(event){
			if(isScrolling = true){
				return false;
			}
			
			isScrolling = true;
			setTimeout(function(){
				isScrolling = false;
			},150);
			if(event.wheelDelta>0){
				alert("+");
			}
			else{
				alert("-");
			}
			
		};
	},
	
	dragMap : function(){
		var d_x, d_y;
		var m_x, m_y;
		var o_x, o_y;
		var map = this;
		var draging = false;
		
		var onmousedown = function(evt){
			d_x = evt.layerX;
			d_y = evt.layerY;
			draging = true;			
			var onmousemove = function(evt){
				if(draging){
					m_x = evt.layerX;
					m_y = evt.layerY;
					
					o_x = (d_x - m_x) * map.resolution;
					o_y = (m_y - d_y) * map.resolution;
					
					
					map.offset(o_x, o_y);
					map.drawCache();
												
					d_x = m_x;
					d_y = m_y;
				}
			};
			var onmouseup = function(evt){
				m_x = evt.layerX;
				m_y = evt.layerY;
				o_x = (d_x - m_x) * map.resolution;
				o_y = (m_y - d_y) * map.resolution;
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
});