GeoBeans.Layer.BarChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{

	// 最大最小值
	minMax 			: null,


	chartOption 	: null,


	initialize : function(name,baseLayerName,baseLayerField,
		dbName,tableName,tableField,chartFields,chartOption){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
		this.chartOption = chartOption;
		this.type = GeoBeans.Layer.ChartLayer.Type.BAR;
	},



	load : function(){
		if(this.visible){
			this.removeLegend();
			this.addLegend();
			this.showLegend();
		}else{
			this.removeLegend();
			this.hideLegend();
		}

		this.minMax = this.getMinMaxValue();
		var that  = this;
		this.flag = GeoBeans.Layer.Flag.READY;

		that.setTransformation(that.map.transformation);
		that.drawLayerSnap();
		that.renderer.clearRect();

		this.drawLayer();
		that.flag = GeoBeans.Layer.Flag.LOADED;

	},

	drawLayer : function(){

		if(this.chartFeatures == null){
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

		// echarts元素
		var option = null;
		this.renderer.save();
		this.renderer.setGlobalAlpha(this.chartOption.opacity);
		for(var i = 0; i < this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i]
			if(chartFeature == null){
				continue;
			}
			

			geometry = chartFeature.geometry;
			if(geometry == null || geometry.type != GeoBeans.Geometry.Type.POINT){
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
			var length = this.chartFields.length;
			for(var j = 0; j < length; ++j){
				chartField = this.chartFields[j];
				if(chartField == null){
					continue;
				}
				var chartFieldIndex = this.chartFeatureType.getFieldIndex(chartField);
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
								show : this.chartOption.showLabel,
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
			if(maxLabelWidth > this.chartOption.width){
				left = maxLabelWidth - this.chartOption.width/length/2 ;
				right = maxLabelWidth - this.chartOption.width/length/2;
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
					            width : this.chartOption.width + 'px',				
				              	borderWidth : 0
				        },   
						xAxis : [{
							type : 'category',
							data : [""],
							splitLine	: {show : this.chartOption.x_splitLine},
							axisLabel	: {show : false},
							axisTick	: {show : false},
							axisLine	: {show : this.chartOption.x_axisLine}
						}],
						yAxis :[{
							min : this.minMax.min,
							// max : this.minMax.max,
							max : featureValueMax,
							splitLine	: {show : this.chartOption.y_splitLine},
							axisLabel	: {show : false},
							axisTick	: {show : false},
							axisLine	: {show : this.chartOption.y_axisLine}
						}],
						color : this.chartOption.colors,
						series: series,
						animation:false,
						calculable:false
			};
            
            var chartHeight = this.chartOption.height;
            var chartWidth = this.chartOption.width;
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

			var x = geometry.x;
			var y = geometry.y;
			var sp = this.map.transformation.toScreenPoint(x,y);
			var spx = sp.x - width/2 + this.chartOption.offsetX;
			var spy = sp.y - h + padding.bottom - this.chartOption.offsetY;

			this.renderer.drawImage(canvas[0],spx,spy,width,height);
			chart.dispose();
		}
		var preName = "bar_chart_" + this.name;
		$("*[id*='" + preName + "']").remove();
		this.renderer.restore();
	},

	getMinMaxValue : function(){
		var max = null;
		var min = null;
		var chartField = null;
		var feature = null;
		var values = null;
		var value = null;
		var fieldIndex = null;
		for(var i = 0; i < this.chartFields.length; ++i){
			chartField = this.chartFields[i];
			if(chartField == null){
				continue;
			}

			fieldIndex = this.chartFeatureType.getFieldIndex(chartField);
			if(fieldIndex == -1){
				continue;
			}
			var fieldMax = null;
			var fieldMin = null;
			for(var j = 0; j < this.chartFeatures.length; ++j){
				feature = this.chartFeatures[j];
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

	addLegend : function(){
		if(this.chartOption == null){
			return;
		}
		var html = "<div class='chart-legend' id='" +this.name + "'>";
		html += "<div class='chart-legend-title'>"
		+	"<h5>" + this.name + "</h5>"
		+	"</div>";
		var field = null;
		var color = null;
		var colors = this.chartOption.colors;
		for(var i = 0; i < this.chartFields.length;++i){
			field = this.chartFields[i];
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