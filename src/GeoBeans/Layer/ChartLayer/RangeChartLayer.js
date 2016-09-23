GeoBeans.Layer.RangeChartLayer  = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{


	initialize : function(name,baseLayerName,baseLayerField,option){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
	},

	setMap : function(map){
		GeoBeans.Layer.FeatureLayer.prototype.setMap.apply(this, arguments);
		var features = this.getFeatures();
		this.features = features;
		this.style = this.getStyle();
	},

	destroy : function(){
		GeoBeans.Layer.ChartLayer.prototype.destroy.apply(this, arguments);
		this.unRegisterClickEvent();
	},
	getStyle : function(){
		if(this.features == null || this.option == null){
			return null;
		}
		var minMaxValue = this.getMinMaxValue();
		if(minMaxValue == null){
			return null;
		}

		var colorRangeMap = new GeoBeans.ColorRangeMap(this.option.startColor,
			this.option.endColor,minMaxValue.min,minMaxValue.max);
		
		var style = new GeoBeans.Style.FeatureStyle();

		var fieldIndex = this.featureType.getFieldIndex(this.baseLayerField);

		var count = this.features.length;
		for(var i = 0; i < count; ++i){
			var feature = this.features[i];
			if(feature == null){
				continue;
			}
			var values = feature.values;
			if(values == null){
				continue;
			}
			var chartValue = values[fieldIndex];
			console.log(chartValue);
			// var chartValue = feature.chartValue;

			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();

			// fill color
			var color = null;
			if(chartValue == null){
				color = new GeoBeans.Color();
				color.setByHex("#ffffff",1.0);
			}else{
				// 根据值获得颜色
				chartValue = parseFloat(chartValue);
				color = colorRangeMap.getValue(chartValue);
			}

			if(this.option.opacity != null){
				color.setOpacity(this.option.opacity);
			}else{
				color.setOpacity(1);
			}
			symbolizer.fill.color = color;
			console.log(color.getRgba());

			// stroke

			var width = this.option.borderWidth;
			if(width == 0){
				symbolizer.stroke = null;
			}else{
				color = new GeoBeans.Color();
				if(this.option.border != null){
					color.setByHex(this.option.border,1);
				}
				if(this.option.borderOpacity != null){
					color.setOpacity(this.option.borderOpacity);
				}else{
					color.setOpacity(1);
				}
				symbolizer.stroke.color = color;
				//边界宽度
				symbolizer.stroke.width = this.option.borderWidth; 
			}
				

			var filter = new GeoBeans.Filter.IDFilter();
			filter.addID(feature.fid);


			var color = new GeoBeans.Color();
			var fill = new GeoBeans.Style.Fill();
			fill.color = color;


			var rule = new GeoBeans.Style.Rule();
			rule.filter = filter;
			rule.name = chartValue;
			rule.symbolizer = symbolizer;
			style.addRule(rule);
		}

		// style.rules = rules;
		return style;
	},
});
	