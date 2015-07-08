GeoBeans.Layer.AQIChartLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{
	// 要显示的字段
	chartField : null,

	// 时间点
	timePoint  : null,

	styleMgr : null,

	initialize : function(name,dbName,tableName,chartField,timePoint,chartOption){
		this.name = name;
		this.dbName = dbName;
		this.tableName = tableName;
		this.chartField = chartField;
		this.timePoint = timePoint;		
		this.chartOption = chartOption;
	},


	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
		var featureType = new GeoBeans.FeatureType(workspace,
			this.tableName);
		this.featureType = featureType;
		var tableFields = featureType.getFields(null,this.dbName);

		this.styleMgr = new GeoBeans.StyleManager(this.map.server);
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
			this.showTips();
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
		this.showTips();
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
		var geomField = this.featureType.geomFieldName
		var features = this.featureType.getFeaturesFilter(null,
			this.dbName,filter,null,null,[this.chartField,geomField]);
		// var features = this.featureType.getFeaturesFilter(null,
		// 	this.dbName,filter,null,null,null);	
		this.features = features;	
	},

	// showTips : function(){
	// 	var idSel = this.name + "_info_";
	// 	this.map.mapDiv.find(".popover.top.in").remove();
	// 	this.map.mapDiv.find("[id*='" + idSel + "']").remove();
	// 	var chartFieldIndex = this.featureType.getFieldIndex(this.chartField);
	// 	var value = null;
	// 	var geometry = null;
	// 	// for(var i = 0; i < 2; ++i){
	// 	for(var i = 0; i < this.features.length; ++i){	
			// var feature = this.features[i];
	// 		if(feature == null){
	// 			continue;
	// 		}
	// 		var values = feature.values;
	// 		if(values == null){
	// 			continue;
	// 		}
	// 		value = values[chartFieldIndex];
	// 		geometry = feature.geometry;
	// 		if(geometry == null){
	// 			continue;
	// 		}
	// 		var id = feature.fid;
	// 		var infoID = this.name + "_info_" + i;
	// 		var infoWindowHtml = "<div class='infoWindow' data-toggle='popover' "
	// 		+ 	"title='Info' data-content='' id='" + infoID + "''></div>";
	// 		this.map.mapDiv.append(infoWindowHtml);
	// 		var infoWindow = this.map.mapDiv.find("#" + infoID);
	// 		infoWindow.popover({
	// 			animation: false,
	// 			trigger: 'manual',
	// 			placement : 'top',
	// 			html : true
	// 		});	

	// 		var x = geometry.x;
	// 		var y = geometry.y;
	// 		var point_s = this.map.transformation.toScreenPoint(x,y);
	// 		var x_s = point_s.x;
	// 		var y_s = point_s.y;

	// 		infoWindow.attr("x",x);
	// 		infoWindow.attr("y",y);

	// 		infoWindow.css("left",x_s + "px");
	// 		infoWindow.css("top", (y_s) + "px");
	// 		// infoWindow.popover("hide")
	// 		infoWindow.attr("data-content",value)
	// 			.attr("data-original-title","")
	// 			.popover("show");

	// 	}
	// },

	showTips : function(){
		if(this.features == null || this.chartOption == null){
			return;
		}
		// 获取最大最小值
		var minMaxValue =  this.getMinMaxValue();
		if(minMaxValue == null){
			return null;
		}
		var colorMapID = this.chartOption.colorMapID;
		var colors = this.styleMgr.getColorMap(colorMapID,2);
		this.colors = colors;
		// 渐变色
		var colorRangeMap = new GeoBeans.ColorRangeMap(colors[0],colors[1],
			minMaxValue.min,minMaxValue.max);

		var chartFieldIndex = this.featureType.getFieldIndex(this.chartField);
		var value = null;

		var feature = null;
		var geometry = null;
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				continue;
			}
			geometry = feature.geometry;
			if(geometry == null){
				continue;
			}
			var values = feature.values;
			if(values == null){
				continue;
			}
			
			value = values[chartFieldIndex];
			// 差值获得的颜色
			var colorValue = colorRangeMap.getValue(value);

			var rule = new GeoBeans.Rule();
			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
			var fill = new GeoBeans.Fill();
			var color = new GeoBeans.Color();
			fill.color = colorValue;
			symbolizer.fill = fill;
			var stroke = new GeoBeans.Stroke();
			color = new GeoBeans.Color();
			color.setByHex("#8d8d8d",1.0);
			stroke.color = color;
			stroke.width = 0.5;
			symbolizer.stroke = stroke;
			rule.symbolizer = symbolizer;

			var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
			textSymbolizer.labelText = value;
			var font = new GeoBeans.Font();
			font.family = "宋体";
			font.style = "normal";
			font.weight = "normal";
			font.size = "12";		
			textSymbolizer.font = font;
			var color = new GeoBeans.Color();
			color.setByHex("#ffffff",1.0);
			var fill = new GeoBeans.Fill();
			fill.color = color;
			textSymbolizer.fill = fill;
			rule.textSymbolizer = textSymbolizer;	

			this.renderer.drawTip(geometry,value,this.map.transformation,rule);

		}
	},

	getMinMaxValue : function(){
		var feature = null;
		var min = null;
		var max = null;

		if(this.chartField == null){
			return null;
		}

		var chartField = this.chartField;
		var chartFieldIndex = this.featureType.getFieldIndex(chartField);
		
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature == null){
				return;
			}
			var values = feature.values;
			if(values == null){
				continue;
			}
			var value = values[chartFieldIndex];
			value = parseFloat(value);
			if(value == null){
				continue;
			}
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