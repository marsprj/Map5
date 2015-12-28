GeoBeans.Layer.PieChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{

	chartOption 	 : null,

	initialize : function(name,baseLayerName,baseLayerField,
		dbName,tableName,tableField,chartFields,chartOption){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
		this.chartOption = chartOption;
		this.type = GeoBeans.Layer.ChartLayer.Type.PIE;
	},

	setChartOption : function(chartOption){
		this.chartOption = chartOption;
		this.chartFeatures = this.getChartFeatures();
	},

	getChartOption : function(){
		return this.chartOption;
	},

	load : function(){
		this.removeLegend();
		this.addLegend();
		if(this.visible){
			this.showLegend();
		}else{
			this.hideLegend();
		}
		this.flag = GeoBeans.Layer.Flag.READY;
		this.setTransformation(this.map.transformation);
		this.drawLayerSnap();
		this.renderer.clearRect();

		this.drawLayer();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	drawLayer : function(){
		if(this.chartFeatures ==  null ){
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
		var radius = 80;
		var colors = [];
		var offsetX = 0;
		var offsetY = 0;
		var showLabel = false;
		var opacity = 1;
		if(this.chartOption != null){
			if(this.chartOption.radius != null){
				radius = this.chartOption.radius;
			}
			if(this.chartOption.colors != null){
				colors = this.chartOption.colors;
			}
			if(this.chartOption.offsetX != null){
				offsetX = this.chartOption.offsetX;
			}
			if(this.chartOption.offsetY != null){
				offsetY = this.chartOption.offsetY;
			}
			if(this.chartOption.showLabel != null){
				showLabel = this.chartOption.showLabel;
			}
			if(this.chartOption.opacity != null){
				opacity = this.chartOption.opacity;
			}
		}

		// 设置透明度
		this.renderer.save();
		this.renderer.setGlobalAlpha(opacity);

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
			var dataArray = [];

			var fontCanvas = document.createElement("canvas");
			var ctx=fontCanvas.getContext('2d');
			ctx.font = "12px Arial, Verdana, sans-seri";

			var maxLabelWidth = null;
			for(var j = 0; j < this.chartFields.length; ++j){
				chartField = this.chartFields[j];
				if(chartField == null){
					continue;
				}
				var chartFieldIndex = this.chartFeatureType.getFieldIndex(chartField);
				if(chartFieldIndex != -1){
					chartValue = chartValues[chartFieldIndex];
					var obj = new Object();
					obj.name = chartValue;
					obj.value = [parseFloat(chartValue)];
					dataArray.push(obj);

					var labelWidth = ctx.measureText(chartValue).width;
					if(maxLabelWidth == null){
						maxLabelWidth = labelWidth;
					}else{
						maxLabelWidth = (maxLabelWidth>labelWidth)?maxLabelWidth:labelWidth;
					}
				}
			}
			
            var option = {
        				series: [
        					{
        						type 		: 'pie',
        						radius 		: this.chartOption.radius + 'px',
        						center 		: ['50%','50%'],
        						data 		: dataArray,
					            itemStyle 	: {
					                normal 	: {
					                    label : {
					                        show : this.chartOption.showLabel,
					                        position:'outer'
					                    },
					                    labelLine : {
					                        show : this.chartOption.showLabel,
					                        length : 0
					                    }
					                }
					            }		            						
        					}
        				],
						animation:false,
						calculable:false,
						color : colors

					};        


			var w = this.chartOption.radius*2 + maxLabelWidth * 2 + 26*2;
			var h = this.chartOption.radius*2 + 20*2;
			var chartId = "pie_chart_" + this.name + i;

			var div = "<div class='chart-div' style='height: " + h 
			+  "px; width:" + w + "px' id='" 
			+ chartId +　"'></div>";
			this.map.mapDiv.append(div);

			var chart = echarts.init(document.getElementById(chartId));
			chart.setOption(option); 
			

			var canvas = $("#" + chartId).find("canvas").first();
			var width = canvas.width();
			var height = canvas.height();

			var x = geometry.x;
			var y = geometry.y;
			var sp = this.map.transformation.toScreenPoint(x,y);
			var spx = sp.x - w/2 + offsetX;
			var spy = sp.y - h/2 - offsetY;

			this.renderer.drawImage(canvas[0],spx,spy,width,height);
			chart.dispose();
		}
		var preName = "pie_chart_" + this.name;
		$("*[id*='" + preName + "']").remove();

		this.renderer.restore();
	},

	addLegend : function(){
		if(this.chartOption == null){
			return;
		}

		var html = "<div class='chart-legend' id='" + this.name + "'>";
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