/**
 * @classdesc
 * 拖动地图控制
 * @class
 * @extends {GeoBeans.Control}
 */
GeoBeans.Control.TouchControl = GeoBeans.Class(GeoBeans.Control, {
	
	onmousedown : null,

	initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);		
		
		this.map = map;
		this.type = "TouchControl";
		var that = this;

		var extent_s = new GeoBeans.Envelope();
		var extent_e = new GeoBeans.Envelope();

		var STATE = {
			PAN  : 1,
			ZOOM : 2,
		}
		var touch_state = 0;

		var onTouchStart = function(e){
			var viewer = that.map.getViewer();

			var touches = e.touches.length;
			touch_state = touches;
			switch(touches){
				case 2:{
					var pt0 = viewer.toMapPoint(e.touches[0].clientX, e.touches[0].clientY);
					var pt1 = viewer.toMapPoint(e.touches[1].clientX, e.touches[1].clientY);
					extent_s.xmin = Math.min(pt0.x, pt1.x);
					extent_s.xmax = Math.max(pt0.x, pt1.x);
					extent_s.ymin = Math.min(pt0.y, pt1.y);
					extent_s.ymax = Math.max(pt0.y, pt1.y);
				}
				break;
			}
		}
		
		var onTouchEnd = function(e){
			var touches = e.touches.length;
			switch(touch_state){
				case STATE.PAN:{
					console.log("PAN");
				}
				break;
				case STATE.ZOOM:{
					console.log("ZOOM");
					var cross_s = Math.pow(extent_s.getWidth(),2) + Math.pow(extent_s.getHeight(),2);
					var cross_e = Math.pow(extent_e.getWidth(),2) + Math.pow(extent_e.getHeight(),2);
					if(cross_s<cross_e){
						//zoom in
						that.map.setViewExtent(extent_e);
					}
					else{
						//zoom out
						var scale = cross_s / cross_e;
						var viewer = that.map.getViewer();
						var mapExtent = viewer.getExtent().clone();
						mapExtent.scale(scale);
						that.map.setViewExtent(mapExtent);	
					}
				}
				break;
			}
		}

		var onTouchMove = function(e){
			var viewer = that.map.getViewer();

			var touches = e.touches.length;
			touch_state = touches;
			switch(touches){
				case 2:{
					var pt0 = viewer.toMapPoint(e.touches[0].clientX, e.touches[0].clientY);
					var pt1 = viewer.toMapPoint(e.touches[1].clientX, e.touches[1].clientY);
					extent_e.xmin = Math.min(pt0.x, pt1.x);
					extent_e.xmax = Math.max(pt0.x, pt1.x);
					extent_e.ymin = Math.min(pt0.y, pt1.y);
					extent_e.ymax = Math.max(pt0.y, pt1.y);
				}
				break;
			}
		}

		var mapContainer = this.map.getContainer();
		mapContainer.addEventListener("touchstart", onTouchStart, false);
		mapContainer.addEventListener("touchend"  , onTouchEnd  , false);
		mapContainer.addEventListener("touchmove" , onTouchMove , false);

	},

	destory : function(){
		var mapContainer = this.map.getContainer();
		mapContainer.removeEventListener("mousedown", this.onmousedown);
		
		GeoBeans.Control.prototype.destory.apply(this, arguments);
	},
	
	
});