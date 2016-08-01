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
			var d_p = map.transformation.toMapPoint(d_x, d_y);
			var draging = true;	
			if(that.beginDragHandler != null){
				var x = d_x;
				var y = d_y;
				if(that.map.transformation == null){
					return;
				}
				var mp = that.map.transformation.toMapPoint(x, y);
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
					var m_p = map.transformation.toMapPoint(e.layerX, e.layerY);
					o_x = (d_p.x - m_p.x);
					o_y = (d_p.y - m_p.y);
					map.offset(o_x, o_y);

					var infoWindow = map.infoWindow;
					if(infoWindow != null){
						var popover = map.mapDiv.find(".popover");
						if(popover.length == 1){
							var map_x = infoWindow.attr("x");
							var map_y = infoWindow.attr("y");
							var width = map.width;
							var height = map.height;
							var left = infoWindow.css("left");
							var top = infoWindow.css("top");
							left = parseInt(left.slice(0,left.indexOf("px")));
							top = parseInt(top.slice(0,top.indexOf("px")));
							left = left + (e.layerX - d_x);
							top = top + (e.layerY - d_y);
							var popoverWidth = popover.css("width");
							var popoverHeihgt = popover.css("height");
							popoverWidth = parseInt(popoverWidth.slice(0,popoverWidth.indexOf("px")));
							popoverHeihgt = parseInt(popoverHeihgt.slice(0,popoverHeihgt.indexOf("px")));

							if((left- popoverWidth/2) < 0 || (left + popoverWidth/2) > width 
								|| (top - popoverHeihgt) < 0 || (top) > height){
								infoWindow.popover('hide');
								map.queryLayer.clearFeatures();
							}else{
								infoWindow.css("left",(left) + "px");
								infoWindow.css("top",(top) + "px");
								infoWindow.popover('hide').popover("show");
								popover.find('.popover-title')
								.append('<button type="button" class="close">&times;</button>');
								popover.find('.popover-title').find(".close").click(function(){
									$(this).parents(".popover").popover('hide');
								});
							}
						}
					}

					d_x = e.layerX;
					d_y = e.layerY;		
					if(that.dragingHandler != null){
						var x = d_x;
						var y = d_y;
						if(that.map.transformation == null){
							return;
						}
						var mp = that.map.transformation.toMapPoint(x, y);
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
				
				var m_p = map.transformation.toMapPoint(e.layerX, e.layerY);
				o_x = (d_p.x - m_p.x);
				o_y = (d_p.y - m_p.y);
	
				// map.offset(o_x, o_y);
				map.draw();
				map.cleanupSnap();
				

				document.body.style.cursor = 'default';
				map.mapDiv[0].removeEventListener("mousemove", onmousemove);
				map.mapDiv[0].removeEventListener("mouseup", onmouseup);

				if(that.endDragHandler != null){
					var x = e.layerX;
					var y = e.layerY;
					if(that.map.transformation == null){
						return;
					}
					var mp = that.map.transformation.toMapPoint(x, y);
					var args = new GeoBeans.Event.MouseArgs();
					args.buttn = null;
					args.X = x;
					args.Y = y;
					args.mapX = mp.x;
					args.mapY = mp.y;
					that.endDragHandler(args);
				}				
			};
			map.mapDiv[0].addEventListener("mousemove", onmousemove);
			map.mapDiv[0].addEventListener("mouseup", onmouseup);
		}
		this.onmousedown = onmousedown;
		this.map.mapDiv[0].addEventListener("mousedown", this.onmousedown);
		 // this.map.mapDiv.find("canvas").addEventListener("mousedown", this.onmousedown);
		// this.map.mapDiv.find("canvas").each(function(){
			// this.addEventListener("mousedown", this.onmousedown);
		// });
	},

	destory : function(){
		this.map.mapDiv[0].removeEventListener("mousedown", this.onmousedown);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},
	
	
});