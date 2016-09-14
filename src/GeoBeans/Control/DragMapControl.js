GeoBeans.Control.DragMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousedown : null,

	beginDragHandler : null,

	dragingHandler : null,

	endDragHandler : null,
	
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
			e.preventDefault();
			
			var d_x, d_y;
			var m_x, m_y;
			var o_x, o_y;
			var map = that.map;
		
			var maskImg = map.saveSnap();
			var mask_x = 0;
			var mask_y = 0;
			var mask_w = map.width;
			var mask_h = map.height;
			
			d_x = e.layerX;
			d_y = e.layerY;
			var d_p = map.getViewer().toMapPoint(d_x, d_y);
			var draging = true;	
			if(that.beginDragHandler != null){
				var x = d_x;
				var y = d_y;
				if(that.map.getViewer() == null){
					return;
				}
				var mp = that.map.getViewer().toMapPoint(x, y);
				var args = new GeoBeans.Event.MouseArgs();
				args.buttn = null;
				args.X = x;
				args.Y = y;
				args.mapX = mp.x;
				args.mapY = mp.y;
				that.beginDragHandler(args);
			}		
			var onmousemove = function(e){
				e.preventDefault();
				if(draging){
					that.map.closeTooltip();
					that.draging = true;
					document.body.style.cursor = 'pointer';
					mask_x += (e.layerX - d_x);
					mask_y += (e.layerY - d_y);
					map.drawBackground();
					map.putSnap(mask_x, mask_y);

					// 新增
					var m_p = map.getViewer().toMapPoint(e.layerX, e.layerY);
					o_x = (d_p.x - m_p.x);
					o_y = (d_p.y - m_p.y);
					map.getViewer().offset(o_x, o_y);

					var infoWindow = map.getInfoWindow();
					infoWindow.refresh();

					d_x = e.layerX;
					d_y = e.layerY;		
					if(that.dragingHandler != null){
						var x = d_x;
						var y = d_y;
						if(that.map.getViewer() == null){
							return;
						}
						var mp = that.map.getViewer().toMapPoint(x, y);
						var args = new GeoBeans.Event.MouseArgs();
						args.buttn = null;
						args.X = x;
						args.Y = y;
						args.mapX = mp.x;
						args.mapY = mp.y;
						that.dragingHandler(args);
					}					
				}
			};
			var onmouseup = function(e){
				console.log("drag up");
				e.preventDefault();
				maskImg = null;
				draging = false;
				that.draging = false;
				
				var m_p = map.getViewer().toMapPoint(e.layerX, e.layerY);
				o_x = (d_p.x - m_p.x);
				o_y = (d_p.y - m_p.y);
	
				// map.offset(o_x, o_y);
				map.draw();
				map.cleanupSnap();
				

				document.body.style.cursor = 'default';
				mapContainer.removeEventListener("mousemove", onmousemove);
				mapContainer.removeEventListener("mouseup", onmouseup);

				if(that.endDragHandler != null){
					var x = e.layerX;
					var y = e.layerY;
					if(that.map.getViewer() == null){
						return;
					}
					var mp = that.map.getViewer().toMapPoint(x, y);
					var args = new GeoBeans.Event.MouseArgs();
					args.buttn = null;
					args.X = x;
					args.Y = y;
					args.mapX = mp.x;
					args.mapY = mp.y;
					that.endDragHandler(args);
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
	
	
});