GeoBeans.Layer.ClusterLayer_1 = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	// 来源图层
	sourceLayer : null,

	// 按照像素来划分
	distance : 28,

	// 聚类数组
	clusters : null,

	symbolizer : null,

	initialize : function(name,layer,symbolizer){
		GeoBeans.Layer.FeatureLayer.prototype.initialize.apply(this, arguments);

		this.features = null;
		this.sourceLayer = layer;
		this.sourceLayer.visible = false;
		this.symbolizer = symbolizer;
	},

	setName : function(name){
		this.name = name;
	},

	setMap : function(map){
		this.map = map;
		this.canvas =  this.sourceLayer.canvas;
		this.renderer = this.sourceLayer.renderer;
	},

	setLayer : function(layer){
		if(layer == null){
			return;
		}
		this.sourceLayer.visible = true;
		this.sourceLayer = layer;
		this.sourceLayer.visible = false;
		this.features = null;
	},

	setSymbolizer : function(symbolizer){
		this.symbolizer = symbolizer;
	},

	load : function(){
		
		if(this.features == null){
			this.flag = GeoBeans.Layer.Flag.READY;
			this.getFeatures();
		}else{
			var mapViewer = this.map.viewer;
			if(mapViewer != null && this.viewer != null &&
				this.flag == GeoBeans.Layer.Flag.LOADED && mapViewer.equal(this.viewer)){
				return;
			}
			this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);
			this.renderer.clearRect();
			this.cluster();
			this.flag = GeoBeans.Layer.Flag.LOADED;
		}
	},


	getFeatures : function(){
		var featureType = this.sourceLayer.getFeatureType();
		var geomField = featureType.geomFieldName;
		var fields = [geomField];

		this.sourceLayer.getFeatures(fields,this,this.getFeatures_callback);

	},

	getFeatures_callback : function(layer,features){
		layer.flag = GeoBeans.Layer.Flag.LOADED;
		layer.features = features;
		// layer.cluster();
		layer.map.drawLayersAll();
	},
	cluster : function(){
		if(this.features == null){
			return;
		}
		var date = new Date();
		var f = null,geometry = null,cluster = null;
		var clustered = false,clusters = [];
		for(var i = 0; i < this.features.length;++i){
			f = this.features[i];
			if(f == null){
				continue;
			}
			geometry = f.geometry;
			
			if(geometry == null){
				continue;
			}
			if(!this.viewer.contain(geometry.x,geometry.y)){
				continue;
			}
			clustered = false;
			for(var j = 0; j < clusters.length;++j){
				cluster = clusters[j];
				if(this.shouldCluster(cluster,geometry)){
					this.addToCluster(cluster,f);
					clustered = true;
					break;
				}
			}
			if(!clustered){
				clusters.push(this.createCluster(f));
			}

		}

		this.drawClusters(clusters);
	},

	// 创建一个聚类
	createCluster : function(feature){
		var cluster = {
			features : []
		};
		cluster.features.push(feature);
		var geometry = feature.geometry;
		cluster.geometry = geometry;
		return cluster;
	},

	// 是否可以聚类进去
	shouldCluster : function(cluster,geometry){
		var cg = cluster.geometry;
		var cg_s = this.map.transformation.toScreenPoint(cg.x,cg.y);
		var geometry_s = this.map.transformation.toScreenPoint(geometry.x,geometry.y);
		var distance = Math.sqrt(Math.pow((cg_s.x - geometry_s.x),2) + Math.pow((cg_s.y - geometry_s.y),2));
		return(distance < this.distance);
	},

	// 添加到聚类
	addToCluster : function(cluster,feature){
		cluster.features.push(feature);
		// var geometry = cluster.geometry;
		// var fg = cluster.geometry;
		// var x = (geometry.x + fg.x)/2;
		// var y = (geometry.y + fg.y)/2;
		// cluster.geometry = new GeoBeans.Geometry.Point(x,y);
	},

	// 绘制聚类
	drawClusters : function(clusters){
		var cluster = null, geometry = null;
		
		for(var i = 0; i < clusters.length; ++i){
			cluster = clusters[i];
			if(cluster == null){
				continue;
			}
			geometry = cluster.geometry;
			var point = this.getClusterCenter(cluster);
			point = geometry;
			var circle = new GeoBeans.Geometry.Circle(point,2);
			// var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
			// var color = new GeoBeans.Color();
			// color.setByHex("#3399CC",1);
			// symbolizer.fill.color = color;
			// color = new GeoBeans.Color();
			// color.setByHex("#ffffff",1);
			// symbolizer.stroke.color = color;
			var symbolizer = null;
			if(this.symbolizer == null){
				symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
			}else{
				symbolizer = this.symbolizer;
			}
			
			this.renderer.setSymbolizer(symbolizer);
			var context = this.renderer.context;
			context.beginPath();
			var radius = 14;

			var point_s = this.map.transformation.toScreenPoint(point.x,point.y);
			context.arc(point_s.x,point_s.y,radius,0,Math.PI*2,true);
			if(symbolizer.fill != null){
				context.fill();
			}
			if(symbolizer.stroke != null){
				context.stroke();
			}

			context.closePath();

			var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();

			var color = new GeoBeans.Color();
			color.setByHex("#ffffff",1);
			textSymbolizer.fill.color = color;
			this.renderer.setSymbolizer(textSymbolizer);
			var text = cluster.features.length;
			var textWidth = context.measureText(text).width;
			if(symbolizer.fill != null){
				context.fillText(text, point_s.x-textWidth/2, point_s.y+4);
			}
			// this.renderer.setSymbolizer(textSymbolizer);
			// this.renderer.labelPoint(point,cluster.features.length,textSymbolizer,this.map.transformation);
		}

		
	},

	getClusterCenter : function(cluster){
		var features = cluster.features;
		var feature = null,geometry = null;
		var sum_x = 0,sum_y = 0;
		for(var i = 0; i < features.length;++i){
			feature = features[i];
			if(feature == null){
				continue;
			}
			geometry = feature.geometry;
			if(geometry == null){
				continue;
			}
			sum_x += geometry.x;
			sum_y += geometry.y;
		}

		return new GeoBeans.Geometry.Point(sum_x/features.length,sum_y/features.length);
	},


});