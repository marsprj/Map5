GeoBeans.Layer.AQIChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要显示的字段
	chartField : null,

	// 时间点
	timePoint  : null,

	initialize : function(name,dbName,tableName,chartField,timePoint,option){
		this.name = name;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartField = chartField;
		this.timePoint = timePoint;		
	},


	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var featureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		this.featureType = featureType;
		var tableFields = featureType.getFields(null,this.dbName);
	},


	load : function(){
		if(this.features == null){
			this.getFeatures();
		}
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

		
		var that = this;
		that.flag = GeoBeans.Layer.Flag.READY;
		// if(that.features == null){
		// 	var features = this.featureType.getFeatures(this.map.name,null,null,null);
		// 	that.features = features;
		// }
		that.setTransformation(that.map.transformation);
		that.drawLayerSnap();
		that.renderer.clearRect();
		var timer = new Date();
		that.drawLayer();
		
		console.log("time:" + (new Date() - timer));
		that.map.drawLayersAll();
		that.flag = GeoBeans.Layer.Flag.LOADED;

	},

	getFeatures : function(){
		var filter = new GeoBeans.BinaryComparisionFilter();
		filter.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.PropertyName();
		prop.setName("time_point");
		// prop.setName("gid");
		var literal =  new GeoBeans.Literal();
		literal.setValue(this.timePoint);
		// literal.setValue("1");
		filter.expression1 = prop;
		filter.expression2 = literal;
		// var features = this.featureType.getFeaturesFilter(null,
		// 	this.dbName,filter,null,null,[this.chartField]);
		var features = this.featureType.getFeaturesFilter(null,
			this.dbName,filter,null,null,null);	
		this.features = features;	
	},

	showTips : function(){

		var chartFieldIndex = this.featureType.getFieldIndex(this.chartField);
		var value = null;
		var geometry = null;
		for(var i = 0; i < 2; ++i){
			var feature = this.features[i];
			if(feature == null){
				continue;
			}
			var values = feature.values;
			if(values == null){
				continue;
			}
			
			geometry = feature.geometry;
			if(geometry == null){
				continue;
			}
			var id = feature.fid;
			var infoID = this.name + "_info_" + id;
			var infoWindowHtml = "<div class='infoWindow' data-toggle='popover' "
			+ 	"title='Info' data-content='' id='" + infoID + "''></div>";
			this.map.mapDiv.append(infoWindowHtml);
			var infoWindow = this.map.mapDiv.find("#" + infoID);
			infoWindow.popover({
				animation: false,
				trigger: 'manual',
				placement : 'top',
				html : true
			});	

			var x = geometry.x;
			var y = geometry.y;
			var point_s = this.map.transformation.toScreenPoint(x,y);
			var x_s = point_s.x;
			var y_s = point_s.y;

			infoWindow.attr("x",x);
			infoWindow.attr("y",y);

			infoWindow.css("left",x_s + "px");
			infoWindow.css("top", (y_s) + "px");
			infoWindow.popover("hide")
				.attr("data-content","")
				.attr("data-original-title",title)
				.popover("show");

		}
	},

});