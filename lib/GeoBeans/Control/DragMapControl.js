GeoBeans.Control.DragMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousedown : null,
	
	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);		
		this.map = map;
		var that = this;
		var onmousedown = function(e){
			if(!that.enable){
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
				e.preventDefault();
				if(draging){
					
					mask_x += (e.layerX - d_x);
					mask_y += (e.layerY - d_y);
					map.drawBackground();
					map.putSnap(mask_x, mask_y);
												
					d_x = e.layerX;
					d_y = e.layerY;					
				}
			};
			var onmouseup = function(e){
				e.preventDefault();
				maskImg = null;
				draging = false;
				
				var m_p = map.transformation.toMapPoint(e.layerX, e.layerY);
				o_x = (d_p.x - m_p.x);
				o_y = (d_p.y - m_p.y);
	
				map.offset(o_x, o_y);
				map.draw();
				map.cleanupSnap();
				
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