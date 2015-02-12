GeoBeans.Layer.HeatMapLayer = GeoBeans.Class(GeoBeans.Layer,{

	name : null,
	container : null,
	data : null,

	featureLayer : null,
	field : null,

	heatmapInstance : null,
	div : null,

	initialize : function(name){
		this.name = name;



	},

	setMap : function(map){
		this.div = document.createElement("div");
		this.div.className = "heatmap";	

		var mapCanvas = map.canvas;
		var mapCanvasHeight = mapCanvas.height;
		var mapCanvasWidth = mapCanvas.width;

		this.div.style.cssText = "height:" + mapCanvasHeight + "px;width:"
							+ mapCanvasWidth + "px;";
		this.heatmapInstance = 	h337.create({
		  // only container is required, the rest will be defaults
		  // container: document.querySelector('.heatmap')
		  container: this.div
		});				
	},

	destory : function(){
		this.name = null;
	},


	setLayer : function(featureLayer,field){
		if(featureLayer == null || field == null){
			return;
		}

		this.featureLayer = featureLayer;
		this.field = field;

	},

	load : function(){
		var featureType = this.featureLayer.featureType;
		if(featureType == null){
			return;
		}
		var fieldIndex = featureType.getFieldIndex(this.field);
		if(fieldIndex < 0 ){
			return;
		}
		var x, y, value, point;
		var max = null;
		var min = null;
		var points = [];
		var point_screen = null;

		var transformation = this.featureLayer.map.transformation;
		var features = this.featureLayer.features;
		if(features == null){
			return;
		}
		for(var i = 0; i < features.length; ++i){
			var feature = features[i];
			var geometry = feature.geometry;


			if(geometry instanceof  GeoBeans.Geometry.Point){
				point_screen = transformation.toScreenPoint(geometry.x,geometry.y);
			}


			value = feature.values[fieldIndex];

			if(i == 0){
				max = value;
				min = value;
			}

			max = Math.max(value,max);
			min = Math.min(value,min);
			console.log('max:' +  max+';min:'+ min);
			point = {
				x : point_screen.x,
				y : point_screen.y,
				value : value
			};
			points.push(point);
		}

		// var data = { 
		//   max: max, 
		//   min: min,
		//   data: points 
		// };
		var data = { 
		  max: 300, 
		  min: 0,
		  data: points 
		};
		this.heatmapInstance.setData(data);
		this.canvas = this.div.children[0];
		this.flag = GeoBeans.Layer.Flag.LOADED;	
	}

});