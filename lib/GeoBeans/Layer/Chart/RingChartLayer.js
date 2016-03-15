GeoBeans.Layer.RingChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	chartOption : null,


	initialize : function(name,baseLayerName,baseLayerField,dbName,tableName,tableField,
		chartFields,chartOption){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
		this.type = GeoBeans.Layer.ChartLayer.Type.RING;
		this.chartOption = chartOption;
	},


	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);
			// 注册点击事件
		// this.registerHitEvent(this.onFeatureHit);
		// map._addLegend(this);
	},

	

	load : function(){
		this.flag = GeoBeans.Layer.Flag.LOADED;
		if(this.features == null){
			this.features = this.chartFeatures;
		}
		this.renderer.clearRect();

		this.drawLayer();

	},

	// 获取最大最小值
	getMinMaxValue : function(){
		if(this.chartFeatures == null){
			return null;
		}
		var chartFeature = null;
		var chartField = this.chartFields[0];
		var chartFeatureType = this.chartFeatureType;
		var chartFieldIndex = chartFeatureType.getFieldIndex(this.chartFields[0]);
		var values = null,min = null, max = null,value = null;
		for(var i = 0; i < this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
			if(chartFeature == null){
				continue;
			}
			values = chartFeature.values;
			if(values == null){
				continue;
			}
			value = values[chartFieldIndex];
			// console.log(value);
			if(value == null){
				continue;
			}
			value = parseFloat(value);
			if(min == null){
				min = value;
			}else{
				min = (value < min ) ? value : min; 
			}
			if(max == null){
				max = value;
			}else{
				max = (value > max) ? value : max;
			}
		}
		return{
			min : min,
			max : max
		};
	},	

	drawLayer : function(){
		var minMax = this.getMinMaxValue();
		this.minMax = minMax;
		var min = minMax.min;
		var max = minMax.max;

		var chartField = this.chartFields[0];
		var chartFeatureType = this.chartFeatureType;
		var chartFieldIndex = chartFeatureType.getFieldIndex(this.chartFields);	

		var chartFeature = null,values = null,value = null;
		var geometry = null, radiusInner = null,circle = null;
		var radiusOuter = null,color = null;
		var color = this.chartOption.color;
		var opacityInner = this.chartOption.opacityInner;
		var opacityOuter = this.chartOption.opacityOuter;
		for(var i = 0; i < this.chartFeatures.length; ++i){
			chartFeature = this.chartFeatures[i];
			if(chartFeature == null){
				continue;
			}
			values = chartFeature.values;
			if(values == null){
				continue;
			}
			value = values[chartFieldIndex];
			if(value == null){
				continue;
			}
			geometry = chartFeature.geometry;
			radiusInner = parseFloat(value)/max * this.chartOption.maxsize;
			radiusOuter = radiusInner + this.chartOption.outerRadius;
			this.renderer.drawRing(geometry,radiusInner,radiusOuter,color,opacityInner,opacityOuter,
				this.map.transformation);
		}
	},
})
	