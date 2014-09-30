GeoBeans.Control.SrollMapControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousewheel : null,
	
	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);
		
		this.map = map;
		var that = this;
		this.mousewheel = function(e){	
			e.preventDefault();
			if(map.baseLayer!=null){
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
		};
		map.canvas.addEventListener('mousewheel', this.mousewheel);
	},

	destory : function(){
		this.map.canvas.removeEventListener('mousewheel', this.mousewheel);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},
	
	
});