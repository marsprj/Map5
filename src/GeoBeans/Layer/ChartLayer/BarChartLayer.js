GeoBeans.Layer.BarChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要展示的字段数组
	baseLayerFields : null,

	initialize : function(name,baseLayerName,baseLayerFields,option){
		// GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
		this.name = name;
		this.baseLayerName = baseLayerName;
		this.baseLayerFields = baseLayerFields;
		this.option = option;
	},

	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);
		map._addLegend(this);
		this.minMax = this.getMinMaxValue();
	},

	load : function(){
		this.removeLegend();
		this.addLegend();
		if(this.visible){
			this.showLegend();
		}else{
			this.hideLegend();
		}
		this.setTransformation(this.map.transformation);
		this.renderer.clearRect();
		this.drawLayer();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},
	registerClickEvent : function(){

	},

	unRegisterClickEvent : function(){

	},

	getMinMaxValue : function(){
		var max = null;
		var min = null;
		var chartField = null;
		var feature = null;
		var values = null;
		var value = null;
		var fieldIndex = null;
		for(var i = 0; i < this.baseLayerFields.length; ++i){
			chartField = this.baseLayerFields[i];
			if(chartField == null){
				continue;
			}

			fieldIndex = this.featureType.getFieldIndex(chartField);
			if(fieldIndex == -1){
				continue;
			}
			var fieldMax = null;
			var fieldMin = null;
			for(var j = 0; j < this.features.length; ++j){
				feature = this.features[j];
				if(feature == null){
					continue;
				}
				values = feature.values;
				if(values == null){
					continue;
				}
				value = parseFloat(values[fieldIndex]);
				if(fieldMax == null){
					fieldMax = value;
				}else{
					fieldMax = (value>fieldMax) ? value : fieldMax;
				}
				if(fieldMin == null){
					fieldMin = value;
				}else{
					fieldMin = (value<fieldMin) ? value : fieldMin;
				}
			}
			if(max == null){
				max = fieldMax;
			}else{
				max = (fieldMax>max) ? fieldMax : max;
			}
			if(min == null){
				min = fieldMin;
			}else{
				min = (fieldMin<min) ? fieldMin : min;
			}
		}
		return {
			min : min,
			max : max
		};
	},

	drawLayer : function(){

		if(this.features == null){
			return;
		}
		// 图表元素
		var chartFeature = null;
		var chartValues = null;
		var chartValue = null;
		var chartField = null;

		// 空间元素
		var feature = null; 
		var values = null;
		var gid = null;
		var geomtry = null;
		var center = null;

		// echarts元素
		var option = null;
		this.renderer.save();
		this.renderer.setGlobalAlpha(this.option.opacity);
		for(var i = 0; i < this.features.length; ++i){
			chartFeature = this.features[i]
			if(chartFeature == null){
				continue;
			}
			

			geometry = chartFeature.geometry;
			if(geometry == null ){
				continue;
			}

			if(geometry.type == GeoBeans.Geometry.Type.POINT){
				center = geometry;
			}else if(geometry.type == GeoBeans.Geometry.Type.POLYGON 
				|| geometry.type == GeoBeans.Geometry.Type.MULTIPOLYGON){
				center = geometry.getCentroid();
			}
			if(center == null){
				continue;
			}

			chartValues = chartFeature.values;
			if(chartValues == null){
				continue;
			}
			var series = [];
			var featureValueMax = null;
			var maxLabelWidth = null;
			var fontCanvas = document.createElement("canvas");
			var ctx=fontCanvas.getContext('2d');
			ctx.font = "12px Arial, Verdana, sans-seri";
			var length = this.baseLayerFields.length;
			for(var j = 0; j < length; ++j){
				chartField = this.baseLayerFields[j];
				if(chartField == null){
					continue;
				}
				var chartFieldIndex = this.featureType.getFieldIndex(chartField);
				if(chartFieldIndex != -1){
					chartValue = parseFloat(chartValues[chartFieldIndex]);
					var serieObj = new Object();
					serieObj.name = chartField;
					serieObj.type = "bar";
					serieObj.data = [chartValue];
					var labelWidth = ctx.measureText(chartValues[chartFieldIndex]).width;
					if(maxLabelWidth == null){
						maxLabelWidth = labelWidth;
					}else{
						maxLabelWidth = (maxLabelWidth>labelWidth)?maxLabelWidth:labelWidth;
					}
					serieObj.itemStyle = {
						normal : {
							label :{
								show : this.option.showLabel,
								position : "top",
							}
						}
					};
					series.push(serieObj);
					if(featureValueMax == null){
						featureValueMax = chartValue;
					}else{
						featureValueMax = (chartValue>featureValueMax)?chartValue:featureValueMax;
					}	
				}
			}
			var left = 10;
			var right = 10;
			if(maxLabelWidth > this.option.width){
				left = maxLabelWidth - this.option.width/length/2 ;
				right = maxLabelWidth - this.option.width/length/2;
			}
			var padding = {
				top 	: 26,
				bottom  : 12,
				left 	: left,
				right 	: right
			};
			option = {
						grid:{
					            x 	: padding.left + 'px',
					            y 	: padding.top + 'px',
					            x2  : padding.right + 'px',
					            y2 	: padding.bottom + 'px',
					            width : this.option.width + 'px',				
				              	borderWidth : 0
				        },   
						xAxis : [{
							type : 'category',
							data : [""],
							splitLine	: {show : this.option.x_splitLine},
							axisLabel	: {show : false},
							axisTick	: {show : false},
							axisLine	: {show : this.option.x_axisLine}
						}],
						yAxis :[{
							min : this.minMax.min,
							// max : this.minMax.max,
							max : featureValueMax,
							splitLine	: {show : this.option.y_splitLine},
							axisLabel	: {show : false},
							axisTick	: {show : false},
							axisLine	: {show : this.option.y_axisLine}
						}],
						color : this.option.colors,
						series: series,
						animation:false,
						calculable:false
			};
            
            var chartHeight = this.option.height;
            var chartWidth = this.option.width;
            var heightPadding = parseFloat(padding.top) + parseFloat(padding.bottom);
            var h = featureValueMax/this.minMax.max * (chartHeight) + heightPadding;     

            var widthPadding = padding.left + padding.right;
            var w = chartWidth + widthPadding;

			var chartId = "bar_chart_" + this.name + i;

			var div = "<div class='chart-div' style='height: " + h +  "px; width:" + w 
			+ "px' id='" + chartId +　"'></div>";
			this.map.mapDiv.append(div);
			var chart = echarts.init(document.getElementById(chartId));
			chart.setOption(option); 
			

			var canvas = $("#" + chartId).find("canvas").first();
			var width = canvas.width();
			var height = canvas.height();

			var x = center.x;
			var y = center.y;
			var sp = this.map.getMapViewer().toScreenPoint(x,y);
			var spx = sp.x - width/2 + this.option.offsetX;
			var spy = sp.y - h + padding.bottom - this.option.offsetY;

			this.renderer.drawImage(canvas[0],spx,spy,width,height);
			chart.dispose();
		}
		var preName = "bar_chart_" + this.name;
		$("*[id*='" + preName + "']").remove();
		this.renderer.restore();
	},


	addLegend : function(){
		if(this.option == null){
			return;
		}
		var left = 0;
		if(this.legendIndex == 0){
			left = 10;
		}else{
			var lastIndex = this.legendIndex - 1;
			var last = this.map.mapDiv.find(".chart-legend[lindex='" +  lastIndex + "']");
			if(last.length != 0){
				var l = last.css("left");
				var w = last.css("width");
				l = parseInt(l.replace("px",""));
				w = parseInt(w.replace("px",""));
				left = l  + w + 5;	
			}
		}	
		var html = "<div class='chart-legend' id='" +this.name 
		+ "' style='left:" + left + "px' lindex='" + this.legendIndex + "'>";
		html += "<div class='chart-legend-title'>"
		+	"<h5>" + this.name + "</h5>"
		+	"</div>";
		var field = null;
		var color = null;
		var colors = this.option.colors;
		for(var i = 0; i < this.baseLayerFields.length;++i){
			field = this.baseLayerFields[i];
			if(field == null){
				continue;
			}
			color = colors[i];
			html += "<div>"
				+ 	"	<span class='chart-legend-symbol' style='background-color:" + color + "'></span>"
				+	"	<span class='chart-legend-label'>" + field + "</span>"
				+	"</div>";
		}
		html += "</div>";
		this.map.mapDiv.append(html);
	},

});