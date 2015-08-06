GeoBeans.Control.SrollMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousewheel : null,
	count : 0,
	
	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);
		
		this.map = map;
		var that = this;
		var mousewheelEvent = function(e,count){	
			e.preventDefault();
			if(map.baseLayer!=null){
				var level = map.level;
				if(e.wheelDelta>0){
					level = level + count;
					// level++;
					if(level > map.baseLayer.MAX_ZOOM_LEVEL){
						level = map.baseLayer.MAX_ZOOM_LEVEL;
					}
					// if(level<=map.baseLayer.MAX_ZOOM_LEVEL){
						// level = map.baseLayer.MAX_ZOOM_LEVEL;
						map.saveSnap();
						map.drawBackground();
						map.drawBaseLayerSnap(level);
						map.setLevel(level);
						map.draw();
					// }
				}
				else{
					level = level - count;
					// level--;
					if(level < map.baseLayer.MIN_ZOOM_LEVEL){
						level = map.baseLayer.MIN_ZOOM_LEVEL;
					}
					// if(level>=map.baseLayer.MIN_ZOOM_LEVEL){
						// level = map.baseLayer.MIN_ZOOM_LEVEL;
						map.saveSnap();
						map.drawBackground();
						map.drawBaseLayerSnap(level);
						map.setLevel(level);
						map.draw();
					// }
				}
			}
			else{
				if(e.wheelDelta>0){
					var zoom = 1/(1 + count *0.2);
					// map.viewer.scale(1/1.2);\
					map.viewer.scale(zoom);
					map.transformation.update();
					map.draw();
				}
				else{
					// map.viewer.scale(1.2);
					var zoom = 1 + 0.2*count;
					map.viewer.scale(zoom);
					map.transformation.update();
					map.draw();
				}
			}
		};

		this.mousewheel = function(e){
			that.count = that.count + 1;
			var countLo = that.count;
			// console.log("mousewheel:" + that.count);
			setTimeout(function(){
				// console.log("setTimeout:that:" + that.count + " ,this:"+ countLo);
				if(that.count == countLo){
					// console.log("draw:" + that.count);
					mousewheelEvent(e,that.count);
					that.count = 0;
				}
				
			}, 200);
		};


		map.canvas.addEventListener('mousewheel', this.mousewheel);
	},

	destory : function(){
		this.map.canvas.removeEventListener('mousewheel', this.mousewheel);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},
	
	
});