GeoBeans.Layer.BarChartLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
		
	// 显示字段
	fields : null,

	height : null,

	width : null,

	colors : null,

	offsetX : null,
	offsetY : null,

	showLabel : null,

	opacity : null,

	// x坐标轴
	x_axisLine : null,

	y_axisLine : null,

	CLASS_NAME : "GeoBeans.Layer.BarChartLayer",

	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		if(isValid(options)){
			if(isValid(options.name)){
				this.name = options.name;
			}
			if(isValid(options.source)){
				this._source = options.source;
			}

			if(isValid(options.showGeometry)){
				this.showGeometry = options.showGeometry;
			}else{
				this.showGeometry = false;
			}

			if(isValid(options.style)){
				this.style = options.style;
			}

			if(isValid(options.fields)){
				this.fields = options.fields;
			}

			if(isValid(options.height)){
				this.height = options.height;
			}

			if(isValid(options.width)){
				this.width = options.width;
			}

			if(isValid(options.colors)){
				this.colors = options.colors;
			}

			if(isValid(options.offsetX)){
				this.offsetX = options.offsetX;
			}else{
				this.offsetX = 0;
			}

			if(isValid(options.offsetY)){
				this.offsetY = options.offsetY;
			}else{
				this.offsetY = 0;
			}

			if(isValid(options.showLabel)){
				this.showLabel = options.showLabel;
			}else{
				this.showLabel = false;
			}

			if(isValid(options.opacity)){
				this.opacity = options.opacity;
			}else{
				this.opacity = 1;
			}

			if(isValid(options.x_axisLine)){
				this.x_axisLine = options.x_axisLine;
			}else{
				this.x_axisLine = false;
			}

			if(isValid(options.y_axisLine)){
				this.y_axisLine = options.y_axisLine;
			}else{
				this.y_axisLine = false;
			}
		}
		
	},
	destroy : function(){
		var legendWidget = this.map.getWidget(GeoBeans.Widget.Type.LEGEND_WIDGET);
		if(isValid(legendWidget)){
			legendWidget.removeLegend(this.name);
		}

		GeoBeans.Layer.FeatureLayer.prototype.destroy.apply(this, arguments);
	},	

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);	

		var legendWidget = this.map.getWidget(GeoBeans.Widget.Type.LEGEND_WIDGET);
		if(isValid(legendWidget)){
			legendWidget.addLegend(this.name);
		}
	},


});

/**
 * 绘制
 * @public
 */
GeoBeans.Layer.BarChartLayer.prototype.draw = function(){
	if(!this.isVisible()){
		this.clear();
		return;
	}

	var success = {
		target : this,
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			var layer = this.target;
			layer.clear();


			if(layer.showGeometry){
				layer.drawLayerFeatures(features);
			}

			layer.drawBarFeatures(features);
		}
	};
	this._source.getFeatures(null,success,null);
};

/**
 * 绘制柱状要素
 * @private
 */
GeoBeans.Layer.BarChartLayer.prototype.drawBarFeatures = function(features){
	if(!isValid(features)){
		return;
	}

	var fields = this.fields;
	if(!isValid(fields)){
		return;
	}


	var minMax = {};
	var source = this.getSource();
	for(var i = 0; i < fields.length;++i){
		field = fields[i];
		minMax_f = source.getMinMaxValue(field);
		if(isValid(minMax_f)){
			minMax.max = minMax.max > minMax_f.max ? minMax.max : minMax_f.max;
			minMax.min = minMax.min < minMax_f.min ? minMax.min : minMax_f.min;
		}
	}
	// console.log(minMax);

	var field = null,value = null,feature = null,geometry = null,chartValue = null;


	var mapContainer = this.map.getContainer();

		// echarts元素
	var option = null;
	this.renderer.save();
	this.renderer.setGlobalAlpha(this.opacity);

	for(var i = 0; i < features.length;++i){
		feature = features[i];
		if(!isValid(feature)){
			continue;
		}
		geometry = feature.geometry;
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

		var series = [];
		var featureValueMax = null;
		var maxLabelWidth = null;
		var fontCanvas = document.createElement("canvas");
		var ctx=fontCanvas.getContext('2d');
		ctx.font = "12px Arial, Verdana, sans-seri";
		var length = this.fields.length;
		for(var j = 0; j < length; ++j){
			field = this.fields[j];
			if(field == null){
				continue;
			}

			var v = feature.getValue(field);
			if(isValid(v)){

				chartValue = parseFloat(v);
				var serieObj = new Object();
				serieObj.name = field;
				serieObj.type = "bar";
				serieObj.data = [chartValue];
				var labelWidth = ctx.measureText(v).width;
				if(maxLabelWidth == null){
					maxLabelWidth = labelWidth;
				}else{
					maxLabelWidth = (maxLabelWidth>labelWidth)?maxLabelWidth:labelWidth;
				}
				serieObj.itemStyle = {
					normal : {
						label :{
							show : this.showLabel,
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
		if(maxLabelWidth > this.width){
			left = maxLabelWidth - this.width/length/2 ;
			right = maxLabelWidth - this.width/length/2;
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
		            width : this.width + 'px',				
	              	borderWidth : 0
	        },   
			xAxis : [{
				type : 'category',
				data : [""],
				splitLine	: {show : this.x_splitLine},
				axisLabel	: {show : false},
				axisTick	: {show : false},
				axisLine	: {show : this.x_axisLine}
			}],
			yAxis :[{
				min : minMax.min,
				max : featureValueMax,
				splitLine	: {show : this.y_splitLine},
				axisLabel	: {show : false},
				axisTick	: {show : false},
				axisLine	: {show : this.y_axisLine}
			}],
			color : this.colors,
			series: series,
			animation:false,
			calculable:false
		};

		var chartHeight = this.height;
        var chartWidth = this.width;
        var heightPadding = parseFloat(padding.top) + parseFloat(padding.bottom);
        var h = featureValueMax/minMax.max * (chartHeight) + heightPadding;     

        var widthPadding = padding.left + padding.right;
        var w = chartWidth + widthPadding;

		var chartId = "bar_chart_" + this.name + i;

		var div = "<div class='chart-div' style='height: " + h +  "px; width:" + w 
		+ "px' id='" + chartId +　"'></div>";
		$(mapContainer).append(div);
		var chart = echarts.init(document.getElementById(chartId));
		chart.setOption(option); 

		var canvas = $("#" + chartId).find("canvas").first();
		var width = canvas.width();
		var height = canvas.height();

		var x = center.x;
		var y = center.y;
		var sp = this.map.getViewer().toScreenPoint(x,y);
		var spx = sp.x - width/2 + this.offsetX;
		var spy = sp.y - h + padding.bottom - this.offsetY;

		this.renderer.drawImage(canvas[0],spx,spy,width,height);
		chart.dispose();
	}

	var preName = "bar_chart_" + this.name;
	$("*[id*='" + preName + "']").remove();
	this.renderer.restore();
};


/**
 * 获取图例内容
 * @private
 */
GeoBeans.Layer.BarChartLayer.prototype.getLegendHtml = function(){
	var html = "<div class='chart-legend' id='" +this.name 
	+ "_legend'>";
	html += "<div class='chart-legend-title'>"
	+	"<h5>" + this.name + "</h5>"
	+	"</div>";
	var field = null;
	var color = null;
	var colors = this.colors;
	for(var i = 0; i < this.fields.length;++i){
		field = this.fields[i];
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
	return html;
};