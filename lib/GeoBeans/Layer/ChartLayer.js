GeoBeans.Layer.ChartLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{

	baseLayerName : null,

	baseLayerField : null,

	option : null,


	baseLayer : null,

	initialize : function(name,baseLayerName,baseLayerField,option){
		this.name = name;
		this.baseLayerName = baseLayerName;
		this.baseLayerField = baseLayerField;
		this.option = option;
	},

	cleanup : function(){

	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var features = this.getFeatures();
		this.features = features;
		
	},

	showLegend : function(){

	},

	getFeatures : function(){
		var baseLayer = this.map.getLayer(this.baseLayerName);
		if(baseLayer == null){
			return null;
		}
		this.baseLayer = baseLayer;
		this.featureType = this.baseLayer.featureType;
		var features = baseLayer.getFeatures();
		return features;
	},

	getMinMaxValue : function(){
		if(this.features == null){
			return null;
		}
		var min = null;
		var max = null;
		var feature = null;

		var fieldIndex = this.featureType.getFieldIndex(this.baseLayerField);
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			var values = feature.values;
			var value = values[fieldIndex];
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
		return {
			min : min,
			max : max
		};




	},

	
});