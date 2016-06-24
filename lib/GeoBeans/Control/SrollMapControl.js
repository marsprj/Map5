GeoBeans.Control.SrollMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousewheel : null,
	count : 0,

	// 用户返回事件	
	userHandler : null,
	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);
		
		this.map = map;
		var that = this;
		this.type = GeoBeans.Control.Type.SCROLL_MAP;
		var mousewheelEvent = function(e,count){	
			e.preventDefault();
			if(map.baseLayer!=null){
				var level = map.level;
				if(e.wheelDelta>0){
					var time = new Date();
					console.profile("scroll");
					if(map.baseLayer.imageScale != 1.0){
						var zoom = 1/(1 + count *0.2);
						map.viewer.scale(zoom);
						level = map.getLevel(viewer);
						map.saveSnap();
						map.drawBackground();
						map.drawLayersSnap(zoom);
						map._setLevel(level);
						map.draw();
					}else{
						level = level + count;
						if(level > map.baseLayer.MAX_ZOOM_LEVEL){
							level = map.baseLayer.MAX_ZOOM_LEVEL;
						}
						map.saveSnap();
						map.drawBackground();
						map.drawBaseLayerSnap(level);
						map.setLevel(level);
						map.draw();
					}
					console.log(new Date() - time);
				}else{
					if(map.baseLayer.imageScale != 1.0){
						var zoom = 1 + 0.2*count;
						map.viewer.scale(zoom);
						level = map.getLevel(viewer);
						map.saveSnap();
						map.drawBackground();
						map.drawLayersSnap(zoom);
						map._setLevel(level);
						map.draw();
					}else{
						level = level - count;
						if(level < map.baseLayer.MIN_ZOOM_LEVEL){
							level = map.baseLayer.MIN_ZOOM_LEVEL;
						}
						map.saveSnap();
						map.drawBackground();
						map.drawBaseLayerSnap(level);
						map.setLevel(level);
						map.draw();						
					}
				}
			}
			else{
				if(e.wheelDelta>0){
					var zoom = 1/(1 + count *0.2);
					map.saveSnap();
					map.drawBackground();
					map.drawLayersSnap(zoom);
					map.viewer.scale(zoom);
					map.transformation.update();
					map.draw();
				}
				else{
					var zoom = 1 + 0.2*count;
					map.saveSnap();
					map.drawBackground();
					map.drawLayersSnap(zoom);
					map.viewer.scale(zoom);
					map.transformation.update();

					map.draw();
				}
			}
		};

		this.mousewheel = function(e){
			that.count = that.count + 1;
			var countLo = that.count;
			setTimeout(function(){
				// console.log("setTimeout:that:" + that.count + " ,this:"+ countLo);
				if(that.count == countLo){
					// console.log("draw:" + that.count);
					mousewheelEvent(e,that.count);
					that.count = 0;
					if(that.userHandler != null){
						that.userHandler({
							level : map.level
						});
					}
				}
			}, 200);
		};


		// map.canvas.addEventListener('mousewheel', this.mousewheel);
		map.mapDiv[0].addEventListener('mousewheel', this.mousewheel);


	},

	destory : function(){
		this.map.mapDiv[0].removeEventListener('mousewheel', this.mousewheel);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},
	
	
});