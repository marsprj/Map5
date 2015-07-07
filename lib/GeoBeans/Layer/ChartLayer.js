GeoBeans.Layer.ChartLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	style : null,

	initialize : function(name){
		GeoBeans.Layer.FeatureLayer.prototype.initialize.apply(this, arguments);
	},

	setStyle : function(style){
		this.style = style;
	},


	setFeatureType : function(featureType){
		this.featureType = featureType;
	},

	setFeatures : function(features){
		this.features = features;
	},

	load : function(){
		var mapViewer = this.map.viewer;
		if(mapViewer != null && this.viewer != null 
			&& mapViewer.equal(this.viewer) && this.features != null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			this.drawLayerSnap();
			this.renderer.clearRect();
			this.drawLayer();
			return;		
		}

		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);

		
		if(this.featureType==null){
			return;
		}
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;
		if(that.features == null){
			var features = this.featureType.getFeatures(this.map.name,null,null,null);
			that.features = features;
		}
		that.setTransformation(that.map.transformation);
		that.drawLayerSnap();
		that.renderer.clearRect();
		var timer = new Date();
		that.drawLayer();
		console.log("time:" + (new Date() - timer));
		that.map.drawLayersAll();
		that.flag = GeoBeans.Layer.Flag.LOADED;



		// var features = this.featureType.getFeatureBBoxGet(this.map.name,null,
		// 	this.viewer,null,null);
		// that.features = features;
		// that.setTransformation(that.map.transformation);
		// that.drawLayerSnap();
		// that.renderer.clearRect();
		//  var timer = new Date();
		// that.drawLayer();
		// console.log("time:" + (new Date() - timer));
		// that.map.drawLayersAll();
		// that.flag = GeoBeans.Layer.Flag.LOADED;

	},

	// 获得图例
	addLegend : function(){
		if(this.style == null){
			return null;
		}
		var valueNodes = this.style.valueNodes;
		if(valueNodes == null){
			return null;
		}
		var rules = this.style.rules;
		if(rules == null){
			return null;
		}
		var symbolizer = null;
		var color = null;
		var fill = null;
		var rule = null;
		var colorValue = null;
		var label = null;
		var html = "";
		html = "<div class='chart-legend'>";
		html += "<div class='chart-legend-title'>"
		+	"<h5>" + this.name + "</h5>"
		+	"</div>";
		// var labelWidthMax = null;
		for(var i = 0; i < rules.length; ++i){
			rule = rules[i];
			if(rule == null){
				continue;
			}
			symbolizer = rule.symbolizer;
			if(symbolizer == null){
				continue;
			}
			fill = symbolizer.fill;
			if(fill == null){
				continue;
			}
			color = fill.color;
			if(color == null){
				continue;
			}
			colorValue = color.getRgba();

			var lower = parseFloat(valueNodes[i]);
			var upper = parseFloat(valueNodes[i+1])
			label = lower.toFixed(2) + " ~ " + upper.toFixed(2);
		
			html += "<div>"
				+ 	"	<span class='chart-legend-symbol' style='background-color:" + colorValue + "'></span>"
				+	"	<span class='chart-legend-label'>" + label + "</span>"
				+	"</div>";
		}
		html += "</div>";
		this.map.mapDiv.find(".chart-legend").remove();
		this.map.mapDiv.append(html);
	},
});