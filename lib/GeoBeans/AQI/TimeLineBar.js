GeoBeans.TimeLineBar = GeoBeans.Class({
	
	slider : null,
	wrapper : null,
	broadcastIntervalId : null,
	initialized : false,
	boardcast : null, 

	layer : null,

	map : null,

	// 时间点
	timePoints : null,

	initialize : function(layer){
		// add timelinebar
		if(layer == null){
			return;
		}
		this.layer = layer;
		var map = this.layer.map;
		if(map == null){
			return;
		}
		this.map = map;

		this.map.mapDiv.find("#slider").remove();
		var sliderHtml = '<div class="slider-wrap" id="slider">'
		+ '	<button class="timeline-play" id="slider_player">'
		+ '		<img src="images/timeline-play.png">'
		+ '	</button>'
	    + '   <div class="timeline"></div>'
	    + '	  <div class="label-div"></div>'
	    + '</div>';
	    this.map.mapDiv.append(sliderHtml);

	    var timePoints = layer.getTimePoints();
		this.timePoints = timePoints;

	    
		
		var that = this;
		
		if(!this.initialized){
			this.wrapper = this.map.mapDiv.find("#slider");
			this.slider = this.wrapper.find(".timeline");
			this.slider.noUiSlider({
                start: 0,
                range: {
                    'min': 0,
                    'max': timePoints.length - 1
                },
                step:1
            });
            var first = 1;
            for(var i=1;i<(timePoints.length-1);i++) {
                var persition = i/(timePoints.length-1)*100;
                var seg = $('<span class="ui-slider-segment"></span>');
                seg.attr('data-content',first+i).css('left',persition+"%");
                this.slider.append(seg);
            }
            this.boardcast = this.wrapper.find(".timeline-play");
            this.boardcast.click(function(event) {
            	var $img = $(this).find('img');
                var src = $img.attr('src');
                if (/play/.test(src)) {
                    $img.attr('src',src.replace('play','pause'));
                } else {
                    $img.attr('src',src.replace('pause','play'));
                }
                that.broadcast();
            });

            this.slider.on('set',function(){
            	var id = parseInt($(this).val());
            	that.layer.currentLayerID = id;
            	that.layer.map.drawLayersAll();
            });

            this.addLabels();
            this.initialized = true;
		}

	},

	show : function(){
		this.wrapper.css("display","block");
	},

	hide : function(){
		this.wrapper.css("display","none");
	},

	broadcast : function(){
		var that = this;
		if(this.broadcastIntervalId != null){
			clearInterval(this.broadcastIntervalId);
            this.broadcastIntervalId = null;
		}else{
			this.broadcastIntervalId = setInterval(function() {
                var curVal = that.slider.val();
                curVal = parseInt(curVal);
                if (curVal === that.timePoints.length - 1) {
                    that.slider.val(0);
                } else {
                    that.slider.val(curVal+1);
                }
            },this.layer.interval);
		}
	},

	cleanup : function(){
		this.map.mapDiv.find("#slider").remove();
		clearInterval(this.broadcastIntervalId);
		this.broadcastIntervalId = null;
		this.slider = null;
		this.wrapper = null;
		this.initialized = false;
		this.boardcast = null;
	},


	addLabels : function(){
		if(this.timePoints == null || this.timePoints.length < 2){
			return;
		}
		var count = this.timePoints.length;
		var timePoint = this.timePoints[0];

		var fontCanvas = document.createElement("canvas");
		var ctx=fontCanvas.getContext('2d');
		ctx.font = "12px Arial, Verdana, sans-seri";
		var labelWidth = ctx.measureText(timePoint).width;

		var sliderWidth = this.slider.width();
		var segment = sliderWidth/(count - 1);
		var html = "";
		if(segment > labelWidth){
			var padding_label_div = labelWidth/2 * (-1);

			this.wrapper.find(".label-div").css("margin-left",padding_label_div)
			.css("width",'calc(100% + '+ labelWidth + 'px)');
			for(var i = 0; i < count; ++i){
				// var padding = i*segment - labelWidth;
				var padding = 0;
				if(i == 0){
					padding = 0;
				}else{
					padding = segment - labelWidth;
				}
				html += "<div class='time-label' style='padding-left:" +padding + "px'>"
					+ this.timePoints[i]
					+ "</div>"
			}	
			this.wrapper.find(".label-div").html(html);
		}else{
			var n = Math.ceil(labelWidth/segment);
			for(var i = 0; i < count ,i+n <count ; i=i+n){
				var padding = 0;
				if(i == 0){
					padding = 0;
				}else{
					padding = n*segment - labelWidth;
				}
				html += "<div class='time-label' style='padding-left:" +padding + "px'>"
					+ this.timePoints[i]
					+ "</div>";
			}

			padding = padding +(count - 1 - i) * segment;
			html += "<div class='time-label' style='padding-left:" +padding + "px'>"
					+ this.timePoints[count-1]
					+ "</div>";
			var padding_label_div = labelWidth/2 * (-1);

			this.wrapper.find(".label-div").css("margin-left",padding_label_div)
			.css("width",'calc(100% + '+ labelWidth + 'px)');
			this.wrapper.find(".label-div").html(html);
		}

	},


});