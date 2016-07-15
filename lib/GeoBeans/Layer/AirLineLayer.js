GeoBeans.Layer.AirLineLayer = GeoBeans.Class(GeoBeans.Layer,{
	dbName : null,
	typeName : null,
	symbolizer : null,
	pointSymbolizer : null,

	option : null,

	featureType : null,

	initialize : function(name,dbName,typeName,symbolizer,pointSymbolizer,option){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.dbName = dbName;
		this.typeName = typeName;
		this.symbolizer = symbolizer;
		this.pointSymbolizer = pointSymbolizer;
		this.option = option;
	},


	load : function(){
		var mapViewer = this.map.viewer;
		// if(this.features == null){
		if(mapViewer != null && this.viewer != null && mapViewer.equal(this.viewer) 
			&& this.features != null ){
			// this.getFeatures();
			this.flag = GeoBeans.Layer.Flag.LOADED;
			return;
		}
		this.viewer = new GeoBeans.Envelope(mapViewer.xmin,mapViewer.ymin,
			mapViewer.xmax,mapViewer.ymax);
		this.flag = GeoBeans.Layer.Flag.READY;
		this.renderer.clearRect();
		this.getFeatures();
		// this.drawLayer();
		// this.flag = GeoBeans.Layer.Flag.LOADED;
	},


	getFeatures : function(){
		if(this.features != null){
			this.drawLayer();
			return;
		}
		var featureType = this.getFeatureType();
		if(featureType == null){
			this.flag = GeoBeans.Layer.Flag.ERROR;
			return;
		}
		var fields = [this.featureType.geomFieldName];
		this.featureType.getFeaturesFilterAsync2(null,this.dbName,null,null,null,fields,
			null,this,this.getFeatures_callback);
	},


	getFeatureType : function(){
		if(this.featureType != null){
			return this.featureType;
		}else{
			if(this.map != null){
				var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
				this.featureType = new GeoBeans.FeatureType(workspace,
					this.typeName);
				if(this.featureType.fields == null){
					this.featureType.fields = this.featureType
					.getFields(null,this.dbName);
				}
				return this.featureType;
			}
		}
		return null;
	},


	getFeatures_callback : function(layer,features){
		if(layer == null || features == null){
			return;
		}

		layer.features = features;
		layer.drawLayer();
	},
	drawLayer : function(){
		var renderer = this.renderer;

		var features = this.filterFeatures();

		var pointSymbolizer = this.pointSymbolizer;
		renderer.setSymbolizer(pointSymbolizer);
		for(var i =0; i < features.length;++i){
			var f = features[i];
			if(f == null){
				continue;
			}
			var geometry = f.geometry;

			renderer.drawGeometry(geometry,pointSymbolizer,this.map.transformation);
		}


		renderer.setSymbolizer(this.symbolizer);
		// var features = this.features;

		var curveness = this.option.curveness;
		var from = null, from_geometry = null,to = null,to_geometry = null,control = null;



		for(var i = 0;i < features.length;++i){
		// for(var i = 1000;i < 1300;++i){	
			// if(i%800 != 0){
			// 	continue;
			// }

			from = features[i];
			if(from == null){
				continue;
			}
			from_geometry = from.geometry;
			if(from_geometry == null){
				continue;
			}

			// 画点

			for(var j = i+1; j < features.length;++j){
			// for(var j = i+1; j < 1300;++j){
			// for(var j = 0; j < features.length;++j){	
				if(j <= i){
					continue;
				}
				to = features[j];
				if(to == null){
					continue;
				}
				to_geometry = to.geometry;
				if(to_geometry == null){
					continue;
				}
				control = this.getBezierControlPoint(from_geometry,to_geometry,curveness);
				renderer.drawBezierLine(from_geometry,to_geometry,control,this.map.transformation);
			}
		}

		this.flag = GeoBeans.Layer.Flag.LOADED;
		this.map.drawLayersAll();
	},

	getBezierControlPoint: function(from,to,curveness){
		if(from == null || to == null){
			return null;
		}
		var center = new GeoBeans.Geometry.Point(from.x/2+to.x/2,from.y/2+to.y/2);
		// var distance = this.getDistance(from,to);
		var distance = Math.sqrt((from.x-to.x)*(from.x-to.x) + (from.y-to.y)*(from.y-to.y));
		var k = (from.x-to.x)/(from.y-to.y);
		var angle = Math.atan(k);
		angle = Math.PI/2 - angle;
		var distance_cur = distance * curveness;
		var x_cur = Math.sin(angle) * distance_cur;
		var y_cur = Math.cos(angle) * distance_cur;
		var x = center.x + x_cur;
		var y = center.y - y_cur;
		var point = new GeoBeans.Geometry.Point(x,y);
		return point;		
	},

	filterFeatures : function(){
		var array = [];
		var features = this.features;
		var feature = null;
		for(var i = 0; i < features.length;++i){
			if(i % 60 == 0){
				array.push(features[i]);
			}
		}
		return array;
	}

});