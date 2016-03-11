GeoBeans.Layer.HeatMapLayer = GeoBeans.Class(GeoBeans.Layer,{

	name : null,
	container : null,
	data : null,

	layer : null,
	field : null,

	// 固定数值
	uniqueValue : null,

	heatmapInstance : null,
	div : null,

	initialize : function(name){
		this.name = name;
	},

	setMap : function(map){
		if(map == null){
			return;
		}
		this.map = map;
		this.div = document.createElement("div");
		this.div.className = "heatmap";	

		var mapCanvas = map.canvas;
		var mapCanvasHeight = mapCanvas.height;
		var mapCanvasWidth = mapCanvas.width;

		this.div.style.cssText = "height:" + mapCanvasHeight + "px;width:"
							+ mapCanvasWidth + "px;";
		this.heatmapInstance = 	h337.create({
		  	container: this.div,
		  	gradient: {
		    // enter n keys between 0 and 1 here
		    // for gradient color customization
		    // '.5': 'blue',
		    // '.8': 'red',
		    // '.95': 'white'

		    // 紫色系
		    // '0.2': '#FBF6FD',
		    // '0.4': '#E7C9F4',
		    // '0.6': '#AB40DC',
		    // '0.8': 'B241E5',
		    // '0.95' :'white'
		    '0.2': 'rgb(251,246,253)',
		    '0.9': 'rgb(231,201,244)',
		    '0.6': '#AB40DC',
		    '0.8': '#B241E5',
		    '0.95' :'white'
		  },
		  blur : 0.1
		});				
	},

	destory : function(){
		this.name = null;
		this.layer = null;
		this.field = null;
		this.heatmapInstance = null;
	},


	setLayer : function(layer,field,uniqueValue){
		if(layer == null ){
			return;
		}
		if(field == null && uniqueValue == null){
			return;
		}

		this.layer = layer;
		this.field = field;
		this.uniqueValue = uniqueValue;

	},
	getField : function(){
		return this.field;
	},

	getUniqueValue : function(){
		return this.uniqueValue;
	},

	load : function(){
		var featureType = this.layer.featureType;
		if(featureType == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;	
			return;
		}
		var fieldIndex = featureType.getFieldIndex(this.field);
		if(fieldIndex < 0 && this.uniqueValue == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;	
			return;
		}
		var x, y, value, point;
		var max = null;
		var min = null;
		var points = [];
		var point_screen = null;

		var transformation = this.layer.map.transformation;
		var viewer = this.map.getViewer();
		if(viewer == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;	
			return;
		}
		var features = this.layer.getFeatureBBoxGet(viewer);
		if(features == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;	
			return;
		}

		for(var i = 0; i < features.length; ++i){
			var feature = features[i];
			var geometry = feature.geometry;


			if(geometry instanceof  GeoBeans.Geometry.Point){
				point_screen = transformation.toScreenPoint(geometry.x,geometry.y);
			}

			if(fieldIndex < 0 && this.uniqueValue != null){
				value = this.uniqueValue;
				min = value;
				max = value;
			}else if(fieldIndex >= 0){
				value = feature.values[fieldIndex];
				if(i == 0){
					max = value;
					min = value;
				}

				max = Math.max(value,max);
				min = Math.min(value,min);
			}
			point = {
				x : point_screen.x,
				y : point_screen.y,
				value : value
			};
			points.push(point);
		}
		// console.log('max:' +  max+';min:'+ min);

		var data = { 
		  max: max, 
		  min: min,
		  data: points 
		};
		this.heatmapInstance.setData(data);
		this.canvas = this.div.children[0];
		this.flag = GeoBeans.Layer.Flag.LOADED;	
	}

});