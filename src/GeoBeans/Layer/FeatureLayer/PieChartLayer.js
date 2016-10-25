GeoBeans.Layer.PieChartLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	
	fields : null,

	showGeometry : null,

	height : null,

	width : null,

	radius : null,

	colors : null,

	offsetX : null,

	offsetY : null,

	showLabel : null,

	opacity : null,



	CLASS_NAME : "GeoBeans.Layer.PieChartLayer",

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

			if(isValid(options.radius)){
				this.radius = options.radius;	
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

		}

	},

	destory : function(){
		GeoBeans.Layer.FeatureLayer.prototype.destory.apply(this, arguments);
	}
});


GeoBeans.Layer.PieChartLayer.prototype.draw = function(){
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

			layer.drawPieFeatures(features);
		}
	};
	this._source.getFeatures(null,success,null);	
};


GeoBeans.Layer.PieChartLayer.prototype.drawPieFeatures = function(features){
	if(!isValid(features)){
		return;
	}

	var mapContainer = this.map.getContainer();

	this.renderer.save();
	this.renderer.setGlobalAlpha(this.opacity);

	var feature = null,geometry = null,center = null,field = null;

	for(var i = 0; i <features.length;++i){
		feature = features[i];
		if(!isValid(feature)){
			continue;
		}

		geometry = feature.geometry;
		if(!isValid(geometry)){
			continue;
		}
		if(geometry.type == GeoBeans.Geometry.Type.POINT){
			center = geometry;
		}else if(geometry.type == GeoBeans.Geometry.Type.POLYGON 
			|| geometry.type == GeoBeans.Geometry.Type.MULTIPOLYGON){
			center = geometry.getCentroid();
		}

		if(!isValid(center)){
			continue;
		}

		var dataArray = [];

		var fontCanvas = document.createElement("canvas");
		var ctx=fontCanvas.getContext('2d');
		ctx.font = "12px Arial, Verdana, sans-seri";


		var length = this.fields.length;
		var maxLabelWidth = null;
		for(var j = 0; j < length;++j){
			field = this.fields[j];

			if(!isValid(field)){
				continue;
			}

			var v = feature.getValue(field);
			if(isValid(v)){
				var obj = new Object();
				obj.name = v;
				obj.value = [parseFloat(v)];
				dataArray.push(obj);

				var labelWidth = ctx.measureText(v).width;
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
					radius 		: this.radius + 'px',
					center 		: ['50%','50%'],
					data 		: dataArray,
		            itemStyle 	: {
		                normal 	: {
		                    label : {
		                        show : this.showLabel,
		                        position:'outer'
		                    },
		                    labelLine : {
		                        show : this.showLabel,
		                        length : 0
		                    }
		                }
		            }		            						
				}
			],
			animation:false,
			calculable:false,
			color : this.colors
		};

		var w = this.radius*2 + maxLabelWidth * 2 + 26*2;
		var h = this.radius*2 + 20*2;
		var chartId = "pie_chart_" + this.name + i;

		var div = "<div class='chart-div' style='height: " + h 
		+  "px; width:" + w + "px' id='" 
		+ chartId +　"'></div>";
		$(mapContainer).append(div);

		var chart = echarts.init(document.getElementById(chartId));
		chart.setOption(option);  

		var canvas = $("#" + chartId).find("canvas").first();
		var width = canvas.width();
		var height = canvas.height();

		var x = center.x;
		var y = center.y;
		var sp = this.map.getViewer().toScreenPoint(x,y);
		var spx = sp.x - w/2 + this.offsetX;
		var spy = sp.y - h/2 - this.offsetY;

		this.renderer.drawImage(canvas[0],spx,spy,width,height);
		chart.dispose();
	}

	var preName = "pie_chart_" + this.name;
	$("*[id*='" + preName + "']").remove();

	this.renderer.restore();
};