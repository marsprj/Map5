/**
 * @classdesc
 * 拖动地图控制
 * @class
 * @extends {GeoBeans.Control}
 */
GeoBeans.Control.DragMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousedown : null,

	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);		
		this.map = map;
		this.type = "DragMapControl";
		var that = this;

		var mapContainer = this.map.getContainer();

		var onmousedown = function(e){
			if(!that.enabled){
				return;
			}

			if(!(e.target.tagName.toUpperCase() == "CANVAS")){
				return;
			}

			// 是否在rotate交互
			var interaction = that.map.getInteraction(GeoBeans.Interaction.Type.ROTATE);
			if(isValid(interaction) && interaction.getRotateStatus()){
				return;
			}
			e.preventDefault();
			
			var d_x, d_y;
			var m_x, m_y;
			var o_x, o_y;
			var f_x, f_y;
			var map = that.map;
		
			var maskImg = map.saveSnap();
			var mask_x = 0;
			var mask_y = 0;
			var mask_w = map.width;
			var mask_h = map.height;
			
			d_x = e.layerX;
			d_y = e.layerY;
			f_x = e.layerX;
			f_y = e.layerY;
			var d_p = map.getViewer().toMapPoint(d_x, d_y);
			var draging = true;	
			var moving = false;

			var dragBeginHandler = null;
			var dragBeginEvent = that.map.events.getEvent(GeoBeans.Event.DRAG_BEGIN);
			if(dragBeginEvent != null){
				dragBeginHandler = dragBeginEvent.handler;
			}
			if(dragBeginHandler != null){
				var x = d_x;
				var y = d_y;
				if(map.getViewer() == null){
					return;
				}
				var mp = map.getViewer().toMapPoint(x, y);
				var args = new GeoBeans.Event.MouseArgs();
				args.buttn = null;
				args.X = x;
				args.Y = y;
				args.mapX = mp.x;
				args.mapY = mp.y;
				args.zoom = map.getViewer().getZoom();
				dragBeginHandler(args);
			}		
			var onmousemove = function(e){
				if(isValid(interaction) && interaction.getRotateStatus()){
					return;
				}
				e.preventDefault();
				moving = true;
				if(draging){
					// 先判断是否拖动距离过短
					var s_x = (e.layerX - f_x);
					var s_y = (e.layerY - f_y);
					if(Math.abs(s_x) <= 1 && Math.abs(s_y) <= 1){
						document.body.style.cursor = 'default';
						moving = false;
						that.draging = false;
						return;
					}


					that.draging = true;
					document.body.style.cursor = 'pointer';
					mask_x += (e.layerX - d_x);
					mask_y += (e.layerY - d_y);
					map.clear();
					map.putSnap(mask_x, mask_y);

					// 新增
					var m_p = map.getViewer().toMapPoint(e.layerX, e.layerY);
					o_x = (d_p.x - m_p.x);
					o_y = (d_p.y - m_p.y);

					// 不实时绘图，但是更改viewer的视口信息
					map.getViewer().un(GeoBeans.Event.CHANGE);
					map.getViewer().offset(o_x, o_y);


					// var infoWindow = map.getInfoWindow();
					// infoWindow.refresh();

					d_x = e.layerX;
					d_y = e.layerY;	

					var dragingHandler = null;
					var dragingEvent = that.map.events.getEvent(GeoBeans.Event.DRAGING);
					if(dragingEvent != null){
						dragingHandler = dragingEvent.handler;
					}
					if(dragingHandler != null){
						var x = d_x;
						var y = d_y;
						if(map.getViewer() == null){
							return;
						}
						var mp = map.getViewer().toMapPoint(x, y);
						var args = new GeoBeans.Event.MouseArgs();
						args.buttn = null;
						args.X = x;
						args.Y = y;
						args.mapX = mp.x;
						args.mapY = mp.y;
						args.zoom = map.getViewer().getZoom();
						dragingHandler(args);
					}					
				}
			};
			var onmouseup = function(e){
				// console.log("drag up");
				if(!moving){
					document.body.style.cursor = 'default';
					mapContainer.removeEventListener("mousemove", onmousemove);
					mapContainer.removeEventListener("mouseup", onmouseup);

					return;
				}
				moving = false;
				map.registerViewerEvent();
				if(isValid(interaction) && interaction.getRotateStatus()){
					return;
				}
				e.preventDefault();
				maskImg = null;
				draging = false;
				that.draging = false;
				
				var m_p = map.getViewer().toMapPoint(e.layerX, e.layerY);
				o_x = (d_p.x - m_p.x);
				o_y = (d_p.y - m_p.y);

				map.refresh();
				map.cleanupSnap();
				

				document.body.style.cursor = 'default';
				mapContainer.removeEventListener("mousemove", onmousemove);
				mapContainer.removeEventListener("mouseup", onmouseup);

				var dragEndHandler = null;
				var dragEndEvent = that.map.events.getEvent(GeoBeans.Event.DRAG_END);
				if(dragEndEvent != null){
					dragEndHandler = dragEndEvent.handler;
				}
				if(dragEndHandler != null){
					var x = e.layerX;
					var y = e.layerY;
					if(map.getViewer() == null){
						return;
					}
					var mp = map.getViewer().toMapPoint(x, y);
					var args = new GeoBeans.Event.MouseArgs();
					args.buttn = null;
					args.X = x;
					args.Y = y;
					args.mapX = mp.x;
					args.mapY = mp.y;
					args.zoom = map.getViewer().getZoom();
					dragEndHandler(args);
				}				
			};
			mapContainer.addEventListener("mousemove", onmousemove);
			mapContainer.addEventListener("mouseup", onmouseup);
		}
		this.onmousedown = onmousedown;
		mapContainer.addEventListener("mousedown", this.onmousedown);
	},

	destory : function(){
		var mapContainer = this.map.getContainer();
		mapContainer.removeEventListener("mousedown", this.onmousedown);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},


	isDragging : function(){
		return this.draging;
	}
	
	
});