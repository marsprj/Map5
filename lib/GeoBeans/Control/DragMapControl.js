GeoBeans.Control.DragMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousedown : null,
	
	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);		
		this.map = map;
		this.type = "DragMapControl";
		var that = this;
		var onmousedown = function(e){
			// console.log('DragMap:mousedown');
			if(!that.enabled){
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
			var onmousemove = function(e){
				// console.log('DragMap:mousemove');
				e.preventDefault();
				if(draging){
					document.body.style.cursor = 'pointer';
					mask_x += (e.layerX - d_x);
					mask_y += (e.layerY - d_y);
					map.drawBackground();
					map.putSnap(mask_x, mask_y);

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

					// var info = map.mapDiv.find(".info");
					// if(info.length == 1){
					// 	var popover = map.mapDiv.find(".popover");
					// 	if(popover.length == 1){
					// 		var map_x = info.attr("x");
					// 		var map_y = info.attr("y");
					// 		// if(!map.viewer.contain(map_x,map_y)){
					// 		// 	map.mapDiv.find(".popover").popover('hide');
					// 		// 	map.queryLayer.clearFeatures();
					// 		// 	console.log('map_x:' + map_x + ", map_y:" + map_y);
					// 		// }else{
					// 			var width = map.width;
					// 			var height = map.height;

					// 			var left = info.css("left");
					// 			var top = info.css("top");
					// 			left = parseInt(left.slice(0,left.indexOf("px")));
					// 			top = parseInt(top.slice(0,top.indexOf("px")));
					// 			// console.log("left: " + left + ", top: " + top);
					// 			left = left + (e.layerX - d_x);
					// 			top = top + (e.layerY - d_y);
					// 			var popoverWidth = popover.css("width");
					// 			var popoverHeihgt = popover.css("height");
					// 			popoverWidth = parseInt(popoverWidth.slice(0,popoverWidth.indexOf("px")));
					// 			popoverHeihgt = parseInt(popoverHeihgt.slice(0,popoverHeihgt.indexOf("px")));
					// 			if(left < 0 || (left + popoverWidth) > width 
					// 				|| top < 0 || (top + popoverHeihgt) > height){
					// 				map.mapDiv.find(".popover").popover('hide');
					// 				map.queryLayer.clearFeatures();
					// 			}else{
					// 				info.css("left",(left) + "px");
					// 				info.css("top",(top) + "px");
					// 				info.popover('hide').popover("show");
					// 				popover.find('.popover-title')
					// 				.append('<button type="button" class="close">&times;</button>');
					// 				popover.find('.popover-title').find(".close").click(function(){
					// 					$(this).parents(".popover").popover('hide');
					// 				});
					// 			}
								
					// 		// }					
							
					// 	}
					// }
												
					d_x = e.layerX;
					d_y = e.layerY;					
				}
			};
			var onmouseup = function(e){
				// console.log('DragMap:mousemove');
				e.preventDefault();
				maskImg = null;
				draging = false;
				
				var m_p = map.transformation.toMapPoint(e.layerX, e.layerY);
				o_x = (d_p.x - m_p.x);
				o_y = (d_p.y - m_p.y);
	
				map.offset(o_x, o_y);
				map.draw(true);
				map.cleanupSnap();
				

				document.body.style.cursor = 'default';
				map.canvas.removeEventListener("mousemove", onmousemove);
				map.canvas.removeEventListener("mouseup", onmouseup);				
			};
			map.canvas.addEventListener("mousemove", onmousemove);
			map.canvas.addEventListener("mouseup", onmouseup);
		}
		this.onmousedown = onmousedown;
		this.map.canvas.addEventListener("mousedown", this.onmousedown);
	},

	destory : function(){
		this.map.canvas.removeEventListener("mousedown", this.onmousedown);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},
	
	
});