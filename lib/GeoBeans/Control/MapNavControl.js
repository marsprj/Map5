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
							+"			<div class=\"map-nav-zoom-label map-nav-zoom-level\"></div>"
							+"		</div>"
							+"	</div>"
							+"</div>";
		this.map.mapDiv.append(navControlHtml);
		this.controlDiv = $(".map-nav-wrapper");


		this.map.mapDiv.find(".map-nav-pan-N").mouseover(function(){
			$(this).parent().css("background-position","0 -44px");
		});
		this.map.mapDiv.find(".map-nav-pan-W").mouseover(function(){
			$(this).parent().css("background-position","0 -176px");
		});
		this.map.mapDiv.find(".map-nav-pan-E").mouseover(function(){
			$(this).parent().css("background-position","0 -88px");
		});
		this.map.mapDiv.find(".map-nav-pan-S").mouseover(function(){
			$(this).parent().css("background-position","0 -132px");
		});	

		this.map.mapDiv.find(".map-nav-pan div").mouseout(function() {
			$(this).parent().css("background-position","0 0");
		});	

		var that = this;
		this.map.mapDiv.find(".map-nav-pan-N").click(function(){
			var center = that.map.center;
			var t_p = that.map.transformation.toMapPoint(that.map.width/2,0);
			that.map.saveSnap();
			that.map.putSnap(0,-that.map.height/2);
			that.map.offset(0,center.y - t_p.y);
			that.map.draw();
		});
		this.map.mapDiv.find(".map-nav-pan-S").click(function(){
			// that.map.drawBackground();
			var center = that.map.center;
			var t_p = that.map.transformation.toMapPoint(that.map.width/2,0);
			that.map.saveSnap();
			that.map.drawBackground();
			that.map.putSnap(0,that.map.height/2);
			that.map.offset(0,t_p.y - center.y);
			that.map.draw();
		});
		this.map.mapDiv.find(".map-nav-pan-W").click(function(){
			var center = that.map.center;
			var r_p = that.map.transformation.toMapPoint(that.map.width, that.map.height/2);
			that.map.saveSnap();
			that.map.drawBackground();
			that.map.putSnap(-that.map.width/2, 0);
			that.map.offset(r_p.x - center.x,0);
			that.map.draw();
		});

		this.map.mapDiv.find(".map-nav-pan-E").click(function(){
			// that.map.drawBackground();
			var center = that.map.center;
			var r_p = that.map.transformation.toMapPoint(that.map.width, that.map.height/2);
			that.map.saveSnap();
			that.map.drawBackground();
			that.map.putSnap(that.map.width/2,0);
			that.map.offset(center.x - r_p.x,0);
			// that.map.offset(-10, 0);
			that.map.draw();
		});	

		this.map.mapDiv.find(".map-nav-zoom-in").click(function(){
			var level = that.map.level + 1;
			var maxLevel = that.map.getMaxLevel();
			var minLevel = that.map.getMinLevel();
			if(level == null || level < 1 
				|| that.map.baseLayer == null
				|| level > maxLevel
				|| level < minLevel){
				return;
			}
			that.map.saveSnap();
			that.map.drawBackground();
			that.map.drawBaseLayerSnap(level);			
			that.map.setLevel(level);	
			that.map.draw();
		});	
		this.map.mapDiv.find(".map-nav-zoom-out").click(function(){
			var level = that.map.level - 1;
			var maxLevel = that.map.getMaxLevel();
			var minLevel = that.map.getMinLevel();
			if(level == null || level < 1 
				|| that.map.baseLayer == null
				|| level > maxLevel
				|| level < minLevel){
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

					var maxLevel = 17;
					var minLevel = 2;

					var section = $(".map-nav-zoom-slider").height()/18;
					var maxZoomPosition = sliderHeight - section * (maxLevel - 1);
					var minZoomPosition = sliderHeight - section * (minLevel - 1);

					var level = 20 - Math.floor(topMove/section);

					if(topMove < maxZoomPosition){
						var maxZoomBottomHeight = section * (maxLevel - 1) + 10;
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
			// that.setLevelPosition();
			$(".map-nav-zoom-label").css("display","block");

		});

		$(".map-nav-zoom").mouseout(function(){
			$(".map-nav-zoom-labels").css("display","none");
		});

		$(".map-nav-zoom-label-street").click(function(){
			if(17 > that.map.getMinLevel() && 17 <= that.map.getMaxLevel()){
				that.map.drawBackground();	
				that.map.setLevel(17);
				that.map.draw();				
			}
		});
		$(".map-nav-zoom-label-city").click(function(){
			if(12 > that.map.getMinLevel() && 12 < that.map.getMaxLevel()){
				that.map.drawBackground();	
				that.map.setLevel(12);
				that.map.draw();
			}
		});
		$(".map-nav-zoom-label-province").click(function(){
			if(8 > that.map.getMinLevel() && 8 < that.map.getMaxLevel()){
				that.map.drawBackground();	
				that.map.setLevel(8);
				that.map.draw();
			}
		});	
		$(".map-nav-zoom-label-country").click(function(){
			if(4 > that.map.getMinLevel() && 4 < that.map.getMaxLevel()){
				that.map.drawBackground();	
				that.map.setLevel(4);
				that.map.draw();
			}

		});
	},


	setZoomSlider : function(level){
		if(level == null || level < 1 
			|| this.map.baseLayer == null
			|| level > this.map.getMaxLevel()
			|| level < this.map.getMinLevel()){
			return;
		}
		var sliderheight = $(".map-nav-zoom-slider").height();
		var section = sliderheight/18;
		var sliderPosition = section * (level - 1);
		$(".map-nav-zoom-slider-bar").css("top",sliderheight - sliderPosition);
		$(".map-nav-zoom-slider-bottom").css("height",sliderPosition + 10);
		$(".map-nav-zoom-slider-bottom").css("top",sliderheight - sliderPosition);
		this.setLevelPosition();
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
	},

	setLevelPosition : function(){
		var levelDiv = this.controlDiv.find(".map-nav-zoom-level");
		var slideBar = this.controlDiv.find(".map-nav-zoom-slider-bar");
		var top = slideBar.css("top");
		top = top.slice(0,top.length - 2);
		top = parseFloat(top);
		var levelDivTop = top + 21 - levelDiv.height()/2;
		levelDiv.css("top",levelDivTop + "px");
		var level = this.map.level;
		levelDiv.html(level);
	},


	// 设置位置
	setPosition : function(left,top){
		if(left >= 0){
			this.controlDiv.css("left",left + "px");
		}else{
			this.controlDiv.css("right",left + "px");
		}

		if(top >= 0){
			this.controlDiv.css("top", top + "px");
		}else{
			this.controlDiv.css("bottom",top + "px");
		}
	},
});