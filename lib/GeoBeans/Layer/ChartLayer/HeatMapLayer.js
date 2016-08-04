GeoBeans.Layer.HeatMapLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	
	initialize : function(name,baseLayerName,baseLayerField,option){
		GeoBeans.Layer.ChartLayer.prototype.initialize.apply(this, arguments);
	},


	destroy : function(){
		GeoBeans.Layer.ChartLayer.prototype.destroy.apply(this, arguments);
	},

	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);	
		this.div = document.createElement("div");
		this.div.className = "heatmap";	

		var mapCanvas = map.canvas;
		var mapCanvasHeight = mapCanvas.height;
		var mapCanvasWidth = mapCanvas.width;

		this.div.style.cssText = "height:" + mapCanvasHeight + "px;width:"
							+ mapCanvasWidth + "px;";
		var radius = 40;
		if(this.option!= null && this.option.radius != null){
			radius = this.option.radius;
		}
		this.heatmapInstance = 	h337.create({
		  	container: this.div,
		  	radius : radius
		});	
	},

	load : function(){
		var mapViewer = this.map.viewer;
		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);

		this.drawLayer();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	registerClickEvent : function(){

	},

	unRegisterClickEvent : function(){

	},

	drawLayer : function(){	
		if(this.features == null){
			return;
		}
		var bboxFilter = new GeoBeans.BBoxFilter(this.featureType.geomFieldName,this.viewer);
		var features = this.selectFeaturesByFilter(bboxFilter,this.features);

		var fieldIndex = -1;
		if(this.baseLayerField != null){
			fieldIndex = this.featureType.getFieldIndex(this.baseLayerField);
		} 
		// console.log(features.length);
		var point_s = null,point = null;
		var f = null, geometry = null;
		var max = null,min = null,points = [];
		for(var i = 0; i < features.length;++i){
			f = features[i];
			if(f == null){
				continue;
			}
			geometry = f.geometry;
			if(geometry == null){
				continue;
			}

			if(fieldIndex == -1){
				value = 1;
				min = value;
				max = value;
			}else{
				values = f.values;
				value = values[fieldIndex];
				if(min == null){
					min = value;
				}else{
					min = Math.min(min,value);
				}

				if(max == null){
					max = value;
				}else{
					max = Math.max(max,value);	
				}
				
			}
			point_s = this.map.transformation.toScreenPoint(geometry.x,geometry.y);

			point = {
				x : point_s.x,
				y : point_s.y,
				value : value
				// radius : 16
			};
			points.push(point);
		}

		
		var data = {
			max : max,
			min : min,
			data : points
		};


		this.heatmapInstance.setData(data);
		this.canvas = this.div.children[0];
	},
});