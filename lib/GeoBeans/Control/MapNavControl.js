GeoBeans.Control.MapNavControl = GeoBeans.Class(GeoBeans.Control, {
	
	controlDiv : null,
	
	initialize : function(map){
		this.type = GeoBeans.Control.Type.NAV;
		this.map = map;

		var navControlHtml = "<div class=\"map-nav-wrapper\">"
							+"	<div class=\"map-nav-pan\">"
							+"	<div class=\"map-nav-pan\">"
							+"		<div class=\"map-nav-button map-nav-pan-N\"></div>"
							+"		<div class=\"map-nav-button map-nav-pan-W\"></div>"
							+"		<div class=\"map-nav-button map-nav-pan-E\"></div>"
							+"		<div class=\"map-nav-button map-nav-pan-S\"></div>"
							+"	</div>"
							+"	<div class=\"map-nav-zoom\">"
							+"		<div class=\"map-nav-button map-nav-zoom-in\"></div>"
							+"		<div class=\"map-nav-button map-nav-zoom-out\"></div>"
							+"		<div class=\"map-nav-zoom-slider\">"
							+"			<div class=\"map-nav-zoom-slider-top\"></div>"
							+"			<div class=\"map-nav-zoom-slider-bottom\"></div>"
							+"			<div class=\"map-nav-zoom-slider-bar\"></div>"
							+"		</div>"
							+"		<div class=\"map-nav-zoom-labels\">"
							+"			<div class=\"map-nav-zoom-label map-nav-zoom-label-street\"></div>"
							+"			<div class=\"map-nav-zoom-label map-nav-zoom-label-city\"></div>"
							+"			<div class=\"map-nav-zoom-label map-nav-zoom-label-province\"></div>"
							+"			<div class=\"map-nav-zoom-label map-nav-zoom-label-country\"></div>"
							+"		</div>"
							+"	</div>"
							+"</div>";
		this.map.mapDiv.append(navControlHtml);
		this.controlDiv = $(".map-nav-wrapper");


		$(".map-nav-pan-N").mouseover(function(){
			$(this).parent().css("background-position","0 -44px");
		});
		$(".map-nav-pan-W").mouseover(function(){
			$(this).parent().css("background-position","0 -176px");
		});
		$(".map-nav-pan-E").mouseover(function(){
			$(this).parent().css("background-position","0 -88px");
		});
		$(".map-nav-pan-S").mouseover(function(){
			$(this).parent().css("background-position","0 -132px");
		});	

		$(".map-nav-pan div").mouseout(function() {
			$(this).parent().css("background-position","0 0");
		});	

		var that = this;
		$(".map-nav-pan-N").click(function(){
			that.map.drawBackground();
			that.map.offset(0, -10);
			that.map.draw();
		});
		$(".map-nav-pan-S").click(function(){
			that.map.drawBackground();
			that.map.offset(0, 10);
			that.map.draw();
		});
		$(".map-nav-pan-W").click(function(){
			that.map.drawBackground();
			that.map.offset(10, 0);
			that.map.draw();
		});

		$(".map-nav-pan-E").click(function(){
			that.map.drawBackground();
			that.map.offset(-10, 0);
			that.map.draw();
		});	

		$(".map-nav-zoom-in").click(function(){
			var level = that.map.level + 1;
			if(level == null || level < 1 
				|| that.map.baseLayer == null
				|| level > that.map.baseLayer.MAX_ZOOM_LEVEL
				|| level < that.map.baseLayer.MIN_ZOOM_LEVEL){
				return;
			}
			that.map.saveSnap();
			that.map.drawBackground();
			that.map.drawBaseLayerSnap(level);			
			that.map.setLevel(level);	
			that.map.draw();
		});	
		$(".map-nav-zoom-out").click(function(){
			var level = that.map.level - 1;
			if(level == null || level < 1 
				|| that.map.baseLayer == null
				|| level > that.map.baseLayer.MAX_ZOOM_LEVEL
				|| level < that.map.baseLayer.MIN_ZOOM_LEVEL){
				return;
			}
			that.map.saveSnap();
			that.map.drawBackground();
			that.map.drawBaseLayerSnap(level);			
			that.map.setLevel(level);	
			that.map.draw();
		});
		var onMouseDown = function(evt){
			evt.preventDefault();
			var iX= evt.clientX;
			var iY = evt.clientY;
			var sliderDragging = true;

			var onMouseMove = function(evt){
				evt.preventDefault();
				if(sliderDragging){
					console.log("brefore Y :" + iY);
					console.log("current Y :" + evt.clientY);

					var offsetX = evt.clientX - iX;
					var offsetY = evt.clientY - iY;
					console.log("offsetY Y :" + offsetY);			
					var top = $(".map-nav-zoom-slider-bar").css("top");
					var topN = parseFloat(top.slice(0,top.lastIndexOf("px"))); 


					var topMove = topN + offsetY;

					iX = evt.clientX;
					iY = evt.clientY;
				
					console.log("topMove:" + topMove);	
					var sliderHeight = $(".map-nav-zoom-slider").height();
					var bottomHeight = sliderHeight - topMove  + 10;

					var section = $(".map-nav-zoom-slider").height()/18;
					var maxZoomPosition = sliderHeight - section * (that.map.baseLayer.MAX_ZOOM_LEVEL - 1);
					var minZoomPosition = sliderHeight - section * (that.map.baseLayer.MIN_ZOOM_LEVEL - 1);

					var level = 20 - Math.floor(topMove/section);

					if(topMove < maxZoomPosition){
						var maxZoomBottomHeight = section * (that.map.baseLayer.MAX_ZOOM_LEVEL - 1) + 10;
						$(".map-nav-zoom-slider-bar").css("top",maxZoomPosition + "px");	
						$(".map-nav-zoom-slider-bottom").css("top",maxZoomPosition + "px");
						$(".map-nav-zoom-slider-bottom").css("height",maxZoomBottomHeight + "px");
					}else if(topMove > minZoomPosition){
						console.log('topMove > minZoomPosition' + topMove);
						var minZoomBottomHeight = section * (that.map.baseLayer.MIN_ZOOM_LEVEL - 1) + 10;
						$(".map-nav-zoom-slider-bar").css("top",minZoomPosition + "px");	
						$(".map-nav-zoom-slider-bottom").css("top",minZoomPosition + "px");
						$(".map-nav-zoom-slider-bottom").css("height",minZoomBottomHeight + "px");
					}else{
						$(".map-nav-zoom-slider-bar").css("top",topMove + "px");	
						$(".map-nav-zoom-slider-bottom").css("top",topMove + "px");
						$(".map-nav-zoom-slider-bottom").css("height",bottomHeight + "px");
					}
				}
			};

			var onMouseUp = function(evt){
				evt.preventDefault();
				$(".map-nav-zoom-slider-bar")[0].removeEventListener("mousemove",onMouseMove);
				$(".map-nav-zoom-slider-bar")[0].removeEventListener("mouseup",onMouseUp);	
				sliderDragging = false;	

				var topMove = $(".map-nav-zoom-slider-bar").css("top");
				var topMoveN = parseFloat(topMove.slice(0,topMove.lastIndexOf("px")));	
				var section = $(".map-nav-zoom-slider").height()/18;
				// var level = 20 - Math.floor(topMoveN/section);
				var level = 19 - Math.ceil(topMoveN/section);

				if(mapObj.level != level){
					that.map.drawBackground();		
					that.map.setLevel(level);	
					that.map.draw();
				}
			};

			var onMouseOut = function(evt){
				evt.preventDefault();
				$(".map-nav-zoom-slider-bar")[0].removeEventListener("mousemove",onMouseMove);
				$(".map-nav-zoom-slider-bar")[0].removeEventListener("mouseup",onMouseUp);	
				sliderDragging = false;		
			};
			
			$(".map-nav-zoom-slider-bar")[0].addEventListener("mousemove",onMouseMove);
			$(".map-nav-zoom-slider-bar")[0].addEventListener("mouseup",onMouseUp);
			$(".map-nav-zoom-slider-bar")[0].addEventListener("mouseout",onMouseOut);
		};

		$(".map-nav-zoom-slider-bar")[0].addEventListener("mousedown",onMouseDown);


		$(".map-nav-zoom").mouseover(function(){
			$(".map-nav-zoom-labels").css("display","block");
		});

		$(".map-nav-zoom").mouseout(function(){
			$(".map-nav-zoom-labels").css("display","none");
		});

		$(".map-nav-zoom-label-street").click(function(){
			if(18 > that.map.baseLayer.MIN_ZOOM_LEVEL && 18 < that.map.baseLayer.MAX_ZOOM_LEVEL){
				that.map.drawBackground();	
				that.map.setLevel(18);
				that.map.draw();				
			}
		});
		$(".map-nav-zoom-label-city").click(function(){
			if(12 > that.map.baseLayer.MIN_ZOOM_LEVEL && 12 < that.map.baseLayer.MAX_ZOOM_LEVEL){
				that.map.drawBackground();	
				that.map.setLevel(12);
				that.map.draw();
			}
		});
		$(".map-nav-zoom-label-province").click(function(){
			if(8 > that.map.baseLayer.MIN_ZOOM_LEVEL && 8 < that.map.baseLayer.MAX_ZOOM_LEVEL){
				that.map.drawBackground();	
				that.map.setLevel(8);
				that.map.draw();
			}
		});	
		$(".map-nav-zoom-label-country").click(function(){
			if(4 > that.map.baseLayer.MIN_ZOOM_LEVEL && 4 < that.map.baseLayer.MAX_ZOOM_LEVEL){
				that.map.drawBackground();	
				that.map.setLevel(4);
				that.map.draw();
			}

		});
	},


	setZoomSlider : function(level){
		if(level == null || level < 1 
			|| this.map.baseLayer == null
			|| level > this.map.baseLayer.MAX_ZOOM_LEVEL
			|| level < this.map.baseLayer.MIN_ZOOM_LEVEL){
			return;
		}
		var sliderheight = $(".map-nav-zoom-slider").height();
		var section = sliderheight/18;
		var sliderPosition = section * (level - 1);
		$(".map-nav-zoom-slider-bar").css("top",sliderheight - sliderPosition);
		$(".map-nav-zoom-slider-bottom").css("height",sliderPosition + 10);
		$(".map-nav-zoom-slider-bottom").css("top",sliderheight - sliderPosition);

	},

	setEnable:function(flag){
		if(flag){
			if(this.controlDiv.length != 0){
				this.controlDiv.css("display","block");
			}
		}else{
			if(this.controlDiv.length != 0){
				this.controlDiv.css("display","none");
			}
		}
	}


});