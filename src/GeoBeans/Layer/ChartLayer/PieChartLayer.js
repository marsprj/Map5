GeoBeans.Layer.PieChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
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
	},

	load : function(){
		this.removeLegend();
		this.addLegend();
		if(this.visible){
			this.showLegend();
		}else{
			this.hideLegend();
		}
		this.renderer.clearRect();
		this.setTransformation(this.map.transformation);
		this.drawLayer();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	drawLayer : function(){
		if(this.features ==  null ){
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
		var radius = 80;
		var colors = [];
		var offsetX = 0;
		var offsetY = 0;
		var showLabel = false;
		var opacity = 1;
		if(this.option != null){
			if(this.option.radius != null){
				radius = this.option.radius;
			}
			if(this.option.colors != null){
				colors = this.option.colors;
			}
			if(this.option.offsetX != null){
				offsetX = this.option.offsetX;
			}
			if(this.option.offsetY != null){
				offsetY = this.option.offsetY;
			}
			if(this.option.showLabel != null){
				showLabel = this.option.showLabel;
			}
			if(this.option.opacity != null){
				opacity = this.option.opacity;
			}
		}

		// 设置透明度
		this.renderer.save();
		this.renderer.setGlobalAlpha(opacity);


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
			var dataArray = [];

			var fontCanvas = document.createElement("canvas");
			var ctx=fontCanvas.getContext('2d');
			ctx.font = "12px Arial, Verdana, sans-seri";

			var maxLabelWidth = null;
			for(var j = 0; j < this.baseLayerFields.length; ++j){
				chartField = this.baseLayerFields[j];
				if(chartField == null){
					continue;
				}
				var chartFieldIndex = this.featureType.getFieldIndex(chartField);
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
        						radius 		: this.option.radius + 'px',
        						center 		: ['50%','50%'],
        						data 		: dataArray,
					            itemStyle 	: {
					                normal 	: {
					                    label : {
					                        show : this.option.showLabel,
					                        position:'outer'
					                    },
					                    labelLine : {
					                        show : this.option.showLabel,
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


			var w = this.option.radius*2 + maxLabelWidth * 2 + 26*2;
			var h = this.option.radius*2 + 20*2;
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

			var x = center.x;
			var y = center.y;
			var sp = this.map.getMapViewer().toScreenPoint(x,y);
			var spx = sp.x - w/2 + offsetX;
			var spy = sp.y - h/2 - offsetY;

			this.renderer.drawImage(canvas[0],spx,spy,width,height);
			chart.dispose();
		}
		var preName = "pie_chart_" + this.name;
		$("*[id*='" + preName + "']").remove();

		this.renderer.restore();
	},


	registerClickEvent : function(){

	},

	unRegisterClickEvent : function(){

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
			if(last != null){
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