CoEditor.MapPanel = CoEditor.Class({

	// 所有页码
	_pageCount : null,

	// 当前页码
	_currentPage : null,

	// 每页显示的个数
	_listCount : 20,

	// 
	_userOnly : false,

	// 绘制交互
	_drawer : null,

	initialize : function(id){
		this._panel = $("#"+ id);
		this.registerPanelEvent();
	}
});

// 页面点击事件
CoEditor.MapPanel.prototype.registerPanelEvent = function(){
	var that = this;

	this._panel.find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

    // 返回地图列表
    this._panel.find(".back-to-maps").click(function(){
    	that.backToMapsPanel();
    });

	// 新建图层
	this._panel.find(".create-layer").click(function(){
		CoEditor.create_dataset_dlg.show();
	});


	// 返回图层列表
	this._panel.find(".back-to-layers").click(function(){
		that.backToLayersTab();
	});

	// 显示所有的还是自己的
	this._panel.find("#show_all").click(function(){
		$(this).attr("disabled","disabled");
		that._panel.find("#show_user").removeAttr("disabled");
		that._userOnly = false;
		that.refreshFeatures();
	});	

	this._panel.find("#show_user").click(function(){
		$(this).attr("disabled","disabled");
		that._panel.find("#show_all").removeAttr("disabled");
		that._userOnly = true;
		that.refreshFeatures();
	});

	// 采集
	this._panel.find(".draw-overlay").click(function(){
		that.drawOverlay();
	});

	// 保存要素
	this._panel.find(".save-btn").click(function(){
		that.saveFeature();
	});

	// 删除要素
	this._panel.find(".remove-btn").click(function(){
		if(!confirm("确认删除么？")){
			return;
		}
		that.removeFeature();
	});

	// 取消
	this._panel.find(".cancel-btn").click(function(){
		that.getFeaturesByPage();
		featureNew = null;
		featureCur = null;
	});

	// 切换页码
	this._panel.find(".page-div .pagination li").click(function(){
		if($(this).hasClass("first-page")){
			that._currentPage = 1;
			that.getFeaturesByPage();
			
		}else if($(this).hasClass("pre-page")){
			if(that._currentPage > 1 && that._currentPage <= that._pageCount){
				that._currentPage = that._currentPage - 1;
				that.getFeaturesByPage();
			}
		}else if($(this).hasClass("next-page")){
			if(that._currentPage > 0 && that._currentPage < that._pageCount){
				that._currentPage = that._currentPage + 1;
				that.getFeaturesByPage();
			}
		}else if($(this).hasClass("last-page")){
			that._currentPage = that._pageCount;
			that.getFeaturesByPage();
		}
	});	

	// 底图切换
	this._panel.find(".map-base-div").click(function(){
		if($(this).hasClass("active")){
			return;
		}

		that._panel.find(".map-base-div").removeClass("active");
		$(this).addClass("active");

		var imageSetName = null;
		if($(this).hasClass("map-vector-div")){
			imageSetName = "world_vector";
		}else if($(this).hasClass("map-image-div")){
			imageSetName = "world_image";
		}

		that.setBaseLayer(imageSetName);
	});
}	

// 增加绘制交互
CoEditor.MapPanel.prototype.addDrawInteraction = function(){
	this._drawer = new GeoBeans.Interaction.Draw({
		map : mapObj,
		onComplete : this.drawComplete
	});
	mapObj.addInteraction(this._drawer);
}

// 返回到地图页面
CoEditor.MapPanel.prototype.backToMapsPanel = function(){
	this._panel.removeClass("active");
	$("#maps_panel").addClass("active");
	var that = CoEditor.mapsPanel;
	that.getMaps();
}

// 返回图层列表
CoEditor.MapPanel.prototype.backToLayersTab = function(){
	this._panel.find(".left-tab").removeClass("active");
	this._panel.find("#layers_tab").addClass("active");
	if(layerCur != null){
		var layerName = layerCur.getName();
		this._panel.find("#layers_tab .list-type").removeClass("active");
		this._panel.find("#layers_tab .list-type[lname='" + layerName + "']").addClass("active");
	}
}

// 展示地图面板
CoEditor.MapPanel.prototype.showMapPanel = function(){
	$(".content-panel").removeClass("active");
	$("#main_panel").addClass("active");	
}

// 初始化地图
CoEditor.MapPanel.prototype.initMap = function(map){
	if(map == null){
		return;
	}

	var baseLayer = new GeoBeans.Layer.TileLayer({
				"name" : "base",
				"source" : new GeoBeans.Source.Tile.QuadServer({
		 			"url" : "/QuadServer/maprequest",
		 			"imageSet" : "world_vector"
		 		}),
		 		"opacity" : 1.0,
		 		"visible" : true
			});
	if(mapObj != null){
		mapObj.close();
		mapObj = null;
	}
	mapObj = new GeoBeans.Map({
		target : "map_div",
		name : map.name,
		srs  : GeoBeans.Proj.WGS84,
		baselayer : "base",
		layers : [
			baseLayer
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});


	var layers = map.layers;
	for(var i = layers.length-1; i >= 0;--i){
		var layer = layers[i];
		var layerName = layer.getName();
		var type = layer.geomType;
		if(layer instanceof GeoBeans.Layer.FeatureDBLayer){
			var l = new GeoBeans.Layer.FeatureLayer({			
					name : layerName,
					geometryType : type,
					source : new GeoBeans.Source.Feature({
						geometryName : "shape",
					}),
				});
			
			this.loadAllFeatures(l);
			this.setLayerStyle(layer.styleName,l);
			mapObj.addLayer(l);
		}
	}

	
	this.addDrawInteraction();
	this.refreshLayersList();
}

// 获取wfs数据源
CoEditor.MapPanel.prototype.getLayerSource = function(layerName){
	if(layerName == null){
		return;
	}
	return new GeoBeans.Source.Feature.WFS({
		url : user.getServer(),
		version : "1.0.0",
		featureNS : 'http://www.radi.ac.cn',
		featurePrefix : "radi",
		featureType : layerName,
		geometryName : "shape",
		outputFormat: "GML2",
		mapName : mapObj.name
	});
} 


// 获取所有的要素添加到图层上
CoEditor.MapPanel.prototype.loadAllFeatures = function(layer){
	if(layer == null){
		return;
	}

	var source = this.getLayerSource(layer.getName());
	if(source == null){
		return;
	}
	var query = new GeoBeans.Query({

	});
	var success = {
		execute : function(features){
			if(features == null){
				return;
			}
			var s = layer.getSource();
			s.setFeatures(features);

			// 初始化热力图
			var geometryType = layer.getGeometryType();
			if(geometryType == GeoBeans.Geometry.Type.POINT){
				var heatMapName = layer.getName() + "-heatmap";
				if(mapObj.getLayer(heatMapName) == null){
					var heatMapLayer = new GeoBeans.Layer.HeatMapLayer({
						name : heatMapName,
						radius : 30,
						showGeometry :false,
						visible: false,
						source : new GeoBeans.Source.Feature({
							geometryName : "shape"
						})
					});
					mapObj.addLayer(heatMapLayer);
					var source = heatMapLayer.getSource();
					source.setFeatures(features);
				}else{
					var heatMapLayer = mapObj.getLayer(heatMapName);
					var source = heatMapLayer.getSource();
					source.setFeatures(features);
				}
				
			}
			mapObj.refresh();
		}
	}
	source.query(query,success);
}

// 设置样式
CoEditor.MapPanel.prototype.setLayerStyle = function(styleName,layer){
	if(layer == null){
		return;
	}
	if(styleName == null || styleName == ""){
		this.setDefaultStyle(layer);
		return;
	}

	var styleManager = user.getStyleManager();
	styleManager.getStyleXML(styleName,this.getStyle_callback,layer);
}


// 设置样式
CoEditor.MapPanel.prototype.getStyle_callback = function(style,layer){
	if(style == null){
		return;
	}
	if(layer != null){
		layer.setStyle(style);
		mapObj.refresh();
	}
}

// 设置默认样式
CoEditor.MapPanel.prototype.setDefaultStyle = function(layer){
	if(layer == null){
		return;
	}
	var geometryType = layer.getGeometryType();
	var style = new GeoBeans.Style.FeatureStyle();
	style.name = "default";
	switch(geometryType){
		case GeoBeans.Geometry.Type.POINT:{
			var image = "images/food.png";
			var symbol = new GeoBeans.Style.Symbol();
			symbol.icon = image;
			symbol.scale = 1.0;

			var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
			symbolizer.symbol = symbol;
			var rule = new GeoBeans.Style.Rule();
			rule.symbolizer = symbolizer;
			style.addRule(rule);
			break;
		}
		case GeoBeans.Geometry.Type.LINESTRING:
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
			var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
			symbolizer.stroke.color.setHex("#77d3de",1);
			symbolizer.stroke.width = 2.0;
			var rule = new GeoBeans.Style.Rule();
			rule.symbolizer = symbolizer;
			style.addRule(rule);
			break;
		}
		case GeoBeans.Geometry.Type.POLYGON:
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
			var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
			symbolizer.stroke.color.setHex("#ffffff",1);
			symbolizer.stroke.width = 2.0;
			symbolizer.fill.color.setHex("#f6634f",1);

			var rule = new GeoBeans.Style.Rule();
			rule.symbolizer = symbolizer;
			style.addRule(rule);
			break;
		}
		default:
			break;
	}

	layer.setStyle(style);
	mapObj.refresh();
}


// 刷新图层列表
CoEditor.MapPanel.prototype.refreshLayersList = function(){
	if(mapObj == null){
		return;
	}
	var layers = mapObj.layers;
	var layer = null,geometryType = null,icon = null,name = null;
	var html = "";
	for(var i = 0; i < layers.length;++i){
		layer = layers[i];
		if(layer == null){
			continue;
		}
		if(layer instanceof GeoBeans.Layer.TileLayer){
			continue;
		}
		name = layer.getName();
		geometryType = layer.getGeometryType();
		icon = this.getGeometryIcon(geometryType);
		html += '<div class="list-type" lname="' + name + '" ltype="' + geometryType 
						+ '">'
		 	+	'	<div class="col-md-4 layer-style" data-container="body" data-toggle="popover" data-placement="bottom" data-content="">'
		 	+	'		<img src="' +  icon +'">'
		 	+	'	</div>';
		if(geometryType == GeoBeans.Geometry.Type.POINT){
		 	html+=	'	<div class="col-md-4 layer-name">' + name + "</div>"
		 		+   '	<div class="col-md-2 layer-heatmap" data-toggle="tooltip" data-placement="top" title="热力图">'
		 		+	'		<span class="glyphicon glyphicon-fire"></span>'
		 		+	'	</div>'
		}else{
			html+=	'	<div class="col-md-6 layer-name">' + name + "</div>";
		}

		html +=	'	<div class="col-md-2 layer-visible" data-toggle="tooltip" data-placement="top" title="图层显示">'
		 	+	'	</div>'
		 	+	'</div>';
	}
	this._panel.find("#layers_tab .list-type-div").html(html);
	this._panel.find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

	var that = this;
	// 进入图层
	this._panel.find("#layers_tab .list-type .layer-name").click(function(){
		var layerDiv = $(this).parents(".list-type");
		that.selectLayer(layerDiv);
	});

	// 图层显示设置
	this._panel.find("#layers_tab .layer-visible,#layers_tab .layer-invisible").click(function(){
		var listTypeDiv = $(this).parents(".list-type");
		var layerName = $(listTypeDiv).attr("lname");
		var layer = mapObj.getLayer(layerName);
		that.loadAllFeatures(layer);
		if($(this).hasClass("layer-visible")){
			layer.setVisible(false);
			$(this).removeClass("layer-visible").addClass("layer-invisible");
		}else{
			layer.setVisible(true);
			$(this).removeClass("layer-invisible").addClass("layer-visible");
		}
		mapObj.refresh();
	});

	// 样式设置
	this._panel.find("#layers_tab .layer-style").each(function(){
		var layerDiv = $(this).parents(".list-type");
		CoEditor.styleControl.set(layerDiv);
	});

	// 热力图设置
	this._panel.find(".layer-heatmap").click(function(){
		var listTypeDiv = $(this).parents(".list-type");
		var name = listTypeDiv.attr("lname");
		var heatMapName = name + "-heatmap";
		var heatMapLayer = mapObj.getLayer(heatMapName);
		if(heatMapLayer != null){
			if($(this).hasClass("heatmap-visible")){
				heatMapLayer.setVisible(false);
				$(this).removeClass("heatmap-visible");
			}else{
				var layer = mapObj.getLayer(name);
				that.loadAllFeatures(layer);
				heatMapLayer.setVisible(true);
				$(this).addClass("heatmap-visible");
			}
			mapObj.refresh();
		}
	});
};

// 根据几何类型获取图标
CoEditor.MapPanel.prototype.getGeometryIcon = function(geometryType){
	var icon = null;
	switch(geometryType){
		case GeoBeans.Geometry.Type.POINT:{
			icon = "images/food.png";
			break;
		}
		case GeoBeans.Geometry.Type.LINESTRING:
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
			icon = "images/wave.png"
			break;
		}
		case GeoBeans.Geometry.Type.POLYGON:
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
			icon = "images/home.png";
			break;
		}
		default:
			break;
	}
	return icon;
}

// 选择一个图层
CoEditor.MapPanel.prototype.selectLayer = function(layerDiv){
	if(layerDiv == null){
		return;
	}
	var layerName = $(layerDiv).attr("lname");
	var layer = mapObj.getLayer(layerName);
	if(layer == null){
		return;
	}
	$(layerDiv).find(".layer-invisible,.layer-visible").removeClass("layer-invisible")
		.addClass("layer-visible");

	// 热力图不显示
	$(layerDiv).find(".layer-heatmap").removeClass("heatmap-visible");
	var heatMapName = layerName + "-heatmap";
	var heatMapLayer = mapObj.getLayer(heatMapName);
	if(heatMapLayer != null){
		heatMapLayer.setVisible(false);
	}
	layer.setFeatures([]);
	layer.setVisible(true);
	mapObj.refresh();

	layerCur = layer;

	this.refreshFeatures();
}

// 刷新列表
CoEditor.MapPanel.prototype.refreshFeatures = function(){
	if(layerCur == null){
		return;
	}

	this._panel.find(".left-tab").removeClass("active");
	this._panel.find("#layer_tab").addClass("active");
	this._panel.find("#layer_tab .left-tab-title .layer-name,#overlay-info-tab .left-tab-title .layer-name").html(layerCur.name);
	this._panel.find(".overlay-list-div").addClass("loading").empty();

	
	this.getFeaturesCount();
}

// 获取个数
CoEditor.MapPanel.prototype.getFeaturesCount = function(){
	if(layerCur == null){
		return;
	}
	var filter = null;
	if(this._userOnly){
		var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.Expression.PropertyName();
		prop.setName("username");
		var literal = new GeoBeans.Expression.Literal();
		literal.setValue(user.name);
		filter = new GeoBeans.Filter.BinaryComparisionFilter(
							oper,
							prop,
							literal);
		
	}

	var orderby = new GeoBeans.Query.OrderBy();
	orderby.addField("updatetime");
	orderby.setOrder(GeoBeans.Query.OrderBy.OrderType.OrderDesc);
	var query = new GeoBeans.Query({
		filter : filter,
		orderby : orderby,
	});

	var that = this;
	var success = {
		execute : function(count){
			that._panel.find(".overlay-list-div").removeClass("loading");
			if(!isValid(count)){
				return;
			}
			that.initPage(count);
		}
	};

	var source = this.getLayerSource(layerCur.getName());
	if(source != null){
		source.queryCount(query,success);
	}
}


// 初始化页码
CoEditor.MapPanel.prototype.initPage = function(count){
	this._pageCount = Math.ceil(count / this._listCount);
	this._currentPage = 1;
	this._panel.find(".current-page").html(this._currentPage + " / " + this._pageCount + "页");

	this.getFeaturesByPage();
}

// 根据页码获取要素
CoEditor.MapPanel.prototype.getFeaturesByPage = function(){
	if(this._currentPage == null || layerCur == null){
		return;
	}

	this._panel.find(".left-tab").removeClass("active");
	this._panel.find("#layer_tab").addClass("active");
	this._panel.find(".overlay-list-div").addClass("loading").empty();
	var offset = (this._currentPage - 1) * this._listCount;
	this._panel.find(".current-page").html(this._currentPage + " / " + this._pageCount + "页");
	this.addSelectInteraction();

	var filter = null;
	if(this._userOnly){
		var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.Expression.PropertyName();
		prop.setName("username");
		var literal = new GeoBeans.Expression.Literal();
		literal.setValue(user.name);
		filter = new GeoBeans.Filter.BinaryComparisionFilter(
							oper,
							prop,
							literal);
	} 

	var orderby = new GeoBeans.Query.OrderBy();
	orderby.addField("updatetime");
	orderby.setOrder(GeoBeans.Query.OrderBy.OrderType.OrderDesc);
	var query = new GeoBeans.Query({
		filter : filter,
		orderby : orderby,
		maxFeatures : this._listCount,
		offset : offset
	});

	var that = this;
	var success = {
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			$(".overlay-list-div").removeClass("loading");
			that.setFeaturesToLayer(features);
			that.showFeatures(features);
		}
	};

	var source = this.getLayerSource(layerCur.getName());
	if(source != null){
		source.query(query,success);
	}		
}

// 添加要素到地图上
CoEditor.MapPanel.prototype.setFeaturesToLayer = function(features){
	if(layerCur == null || features == null){
		return;
	}

	var source = layerCur.getSource();
	if(source == null){
		return;
	}

	source.setFeatures(features);
	mapObj.refresh();
}

// 展示要素列表
CoEditor.MapPanel.prototype.showFeatures = function(features){
	if(features == null){
		return;
	}
	var html = "";
	var feature = null;

	var username = null;
	var geometryType = layerCur.getGeometryType();
	var	icon = this.getGeometryIcon(geometryType);

	for(var i=0; i < features.length;++i){
		feature = features[i];
		if(feature == null){
			continue;
		}

		geometry = feature.geometry;
		if(geometry == null){
			continue;
		}

		name = feature.getValue("name");
		if(name == null || name == ""){
			name = "未命名";
		}

		fid = feature.fid;
		

		username = feature.getValue("username");
		html += '<div class="overlay-item" fid="' + fid+'">'
			+	'	<div class="col-md-2">'
			+	'		<img src="' + icon + '">'
			+	'	</div>'
			+	'	<div class="col-md-8 overlay-name">' + name + '</div>'
			+	((username == user.name)? '<div class="col-md-2 remove">删除</div>': '')
			+	'</div>';
	}

	this._panel.find(".overlay-list-div").html(html);	

	var that = this;
	// 编辑
	this._panel.find(".overlay-list-div .overlay-name").click(function(){
		that._panel.find(".left-tab").removeClass("active");
		that._panel.find("#overlay-info-tab").addClass("active");
		that._panel.find(".overlay-info-div").addClass("loading").empty();
		var fid = $(this).parents(".overlay-item").attr("fid");

		var filter = new GeoBeans.Filter.IDFilter();
		fid = layerCur.getName() + "." + fid;
		filter.addID(fid);

		var source = that.getLayerSource(layerCur.getName());
		var query = new GeoBeans.Query({
			filter : filter 	//查询过滤条件
		});

		var success = {
			execute : that.editFeatureHandler
		};

		source.query(query,success);
	});
	// 删除
	this._panel.find(".overlay-list-div .remove").click(function(){
		if(!confirm("确认删除么？")){
			return;
		}
		var fid = $(this).parents(".overlay-item").attr("fid");

		var filter = new GeoBeans.Filter.IDFilter();
		filter.addID(layerCur.getName() + "." + fid);

		var query = new GeoBeans.Query({
			typeName : layerCur.getName(),
			filter : filter 	//查询过滤条件
		});

		var source = that.getLayerSource(layerCur.getName());
		var success = {
			execute : that.getRemoveFeatureHandler
		};

		source.query(query,success);
	});	
}

// 列表中编辑feature
CoEditor.MapPanel.prototype.editFeatureHandler = function(features){
	if(features == null){
		return;
	}

	var feature = features[0];
	if(feature == null){
		return;
	}

	var selection = mapObj.getSelection();
	selection.setFeatures(features);


	var zoom = mapObj.getViewer().getZoom();
	var geometry = feature.getGeometry();
	if(geometry instanceof GeoBeans.Geometry.Point){
		mapObj.zoomTo(zoom,geometry);
	}else{
		mapObj.zoomToFeatures([feature]);
	}
	
	featureCur = feature;

	var that = CoEditor.mapPanel;
	that.showFeatureInfo();	
}

// 展示要素的信息
CoEditor.MapPanel.prototype.showFeatureInfo = function(){
	this._panel.find(".left-tab").removeClass("active");
	this._panel.find("#overlay-info-tab").addClass("active");
	// 先获取字段
	this.getFields();
}

// 获取字段
CoEditor.MapPanel.prototype.getFields = function(){
	if(layerCur == null){
		return;
	}
	var handler = {
		execute : this.getFields_handler
	};

	var source = this.getLayerSource(layerCur.getName());
	source.getFields(handler);
}

CoEditor.MapPanel.prototype.getFields_handler = function(fields){
	if(!$.isArray(fields)){
		console.log(fields);
		return;
	}
	var that = CoEditor.mapPanel;
	that._panel.find(".overlay-info-div").removeClass("loading");
	var feature = null;
	var isEdit = false;
	if(featureNew != null){
		// 新建
		feature = featureNew;
		that._panel.find("#overlay-info-tab .overlay-title").html("新建");
		that._panel.find("#overlay-info-tab .save-btn").show();
		that._panel.find("#overlay-info-tab .remove-btn").hide();
		isEdit = true;
	}else{
		// 编辑
		feature = featureCur;
		var username = feature.getValue("username");
		if(username == user.name){
			// 当前用户所有，允许编辑
			that._panel.find("#overlay-info-tab .overlay-title").html("编辑");
			isEdit = true;
			that._panel.find("#overlay-info-tab .remove-btn").show();
			that._panel.find("#overlay-info-tab .save-btn").show();
		}else{
			// 只允许查看
			that._panel.find("#overlay-info-tab .overlay-title").html("查看");
			that._panel.find("#overlay-info-tab .remove-btn").hide();
			that._panel.find("#overlay-info-tab .save-btn").hide();
		}
	}

	if(feature == null){
		return;
	}

	var html = "";

	var disabledHtml = "";
	if(!isEdit){
		disabledHtml = ' disabled="disabled"';
	}
	for(var i = 0; i < fields.length;++i){
		var field = fields[i];
		var name = field.getName();
		var value = feature.getValue(name);
		if(value == null){
			value = "";
		}
		var type = field.getType();
		if(type  == GeoBeans.Field.Type.GEOMETRY){
			continue;
		}
		if(name == "gid" || name == "username" || name == "updatetime" || name == "checked"){
			continue;
		}
		html += '<div class="input-group">'
			+	'  	<span class="input-group-addon">' + name + '</span>'
			+	'  	<input type="text" class="form-control" value="' + value +'" ' + disabledHtml + '>'
			+	'</div>';
	}

	that._panel.find(".overlay-info-div").html(html);	
}

// 添加点击交互
CoEditor.MapPanel.prototype.addSelectInteraction = function(){
	if(layerCur == null){
		return;
	}

	this.removeSelectInteraction();
	var select = new GeoBeans.Interaction.Select({
		"map" : mapObj,
		"layer" : layerCur
	});
	select.onchange(this.onSelectionChange);
	if(layerCur.getGeometryType() == GeoBeans.Geometry.Type.POINT){
		var selection = mapObj.getSelection();
		var symbolizer = this.createPointSymbolizer();
		selection.setSymbolizer(symbolizer);
	}else{
		var selection = mapObj.getSelection();
		selection.setSymbolizer(null);
	}
	mapObj.addInteraction(select);	
}

// 删除点击交互
CoEditor.MapPanel.prototype.removeSelectInteraction = function(){
	var select = mapObj.getInteraction(GeoBeans.Interaction.Type.SELECT);
	mapObj.removeInteraction(select);	
}

// 点击选择
CoEditor.MapPanel.prototype.onSelectionChange = function(features){
	console.log("click:" + features.length);
	var that = CoEditor.mapPanel;
	if(features.length == 0){
		that.refreshFeatures();
		return;
	}

	var feature = features[0];
	featureCur = feature;
	// openInfoWindow();
	that.showFeatureInfo();
}

// 设置点样式
CoEditor.MapPanel.prototype.createPointSymbolizer = function(){
	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();

	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../coEditor/images/marker-hit.png";
	symbolizer.symbol = symbol;		

	return symbolizer;
}

// 绘制要素
CoEditor.MapPanel.prototype.drawOverlay = function(){
	this.removeSelectInteraction();
	var geomType = layerCur.getGeometryType();
	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;

	if(geomType == GeoBeans.Geometry.Type.MULTILINESTRING){
		geomType = GeoBeans.Geometry.Type.LINESTRING;
	}else if(geomType == GeoBeans.Geometry.Type.MULTIPOLYGON){
		geomType = GeoBeans.Geometry.Type.POLYGON;
	}else if(geomType == GeoBeans.Geometry.Type.MULTIPOINT){
		geomType = GeoBeans.Geometry.Type.POINT;
	}
	this._drawer.draw(geomType,symbolizer);
}

// 绘制结束
CoEditor.MapPanel.prototype.drawComplete = function(geometry){
	if(geometry == null){
		return;
	}
	var that = CoEditor.mapPanel;
	that.addFeature(geometry);
}

// 添加要素
CoEditor.MapPanel.prototype.addFeature = function(geometry){
	if(geometry == null){
		return;
	}

	var fid = GeoBeans.Utility.uuid();
	var feature = new GeoBeans.Feature({
		fid : fid,
		geometry : geometry
	});

	featureNew = feature;
	this.showFeatureInfo();
}

// 保存要素，更新或者是新建
CoEditor.MapPanel.prototype.saveFeature = function(){
	if(featureCur == null && featureNew == null){
		return;
	}

	this._panel.find(".overlay-info-div .input-group").each(function(){
		var field = $(this).find(".input-group-addon").html();
		var value = $(this).find("input").val();
		if(value != null && value != ""){
			if(featureNew != null){
				featureNew.setValue(field,value);
			}else if(featureCur != null){
				featureCur.setValue(field,value);
			}
		}
	});

	var date = new Date();
	var dateStr = dateFormat(date,"yyyy-MM-dd hh:mm:ss");

	var source = this.getLayerSource(layerCur.getName());
	var geometryName = source.getGeometryName();
	if(featureNew != null){
		featureNew.setValue(geometryName,featureNew.geometry);
		featureNew.setValue("username",userName);
		featureNew.setValue("updatetime",dateStr);
		featureNew.setValue("checked","0");
	}else if(featureCur != null){
		featureCur.setValue(geometryName,featureCur.geometry);
		featureCur.setValue("updatetime",dateStr);
		featureCur.setValue("checked","0");
	}
	
	if(featureNew != null){
		var addFeature_success = {
			execute : this.addFeature_handler
		};

		source.addFeature(featureNew,addFeature_success);
	}
 	
 	if(featureCur != null){
 		var updateFeature_success = {
 			execute : this.updateFeature_handler
 		};
 		source.updateFeature(featureCur,updateFeature_success);
 	}
}

// 添加要素回调
CoEditor.MapPanel.prototype.addFeature_handler = function(result){
	console.log(result);
	var that = CoEditor.mapPanel;
	featureNew = null;
	that.refreshFeatures();
}

// 更新要素回调
CoEditor.MapPanel.prototype.updateFeature_handler = function(result){
	console.log(result);
	var that = CoEditor.mapPanel;
	featureCur = null;
	that.refreshFeatures();
}

// 删除要素
CoEditor.MapPanel.prototype.removeFeature = function(){
	if(featureCur != null){
		var source = this.getLayerSource(layerCur.getName());
		var removeFeature_success = {
			execute : this.removeFeature_success_handler
		};
		source.removeFeature(featureCur,removeFeature_success);
	}

	if(featureNew != null){
		this.refreshFeatures();
		featureNew = null;
	}
}

// 获取删除要素回调
CoEditor.MapPanel.prototype.getRemoveFeatureHandler = function(features){
	if(features == null){
		return;
	}
	var feature = features[0];
	if(feature == null){
		return;
	}

	var that = CoEditor.mapPanel;
	var source = that.getLayerSource(layerCur.getName());
	var removeFeature_success = {
		execute : that.removeFeature_success_handler
	};
	source.removeFeature(feature,removeFeature_success);

}

// 删除要素回调
CoEditor.MapPanel.prototype.removeFeature_success_handler = function(result){
	console.log(result);
	mapObj.refresh();
	var that = CoEditor.mapPanel;
	that.refreshFeatures();
	featureCur = null;
}

// 设置底图
CoEditor.MapPanel.prototype.setBaseLayer = function(imageSetName){
	var source = new GeoBeans.Source.Tile.QuadServer({
		 			"url" : "/QuadServer/maprequest",
		 			"imageSet" : imageSetName
		 		});
	var layer = mapObj.getLayer("base");
	layer.setSource(source);
	mapObj.refresh();
}

// 选中底图div
CoEditor.MapPanel.prototype.setBaseLayerDivChoose = function(imageSetName){
	this._panel.find(".map-base-div").removeClass("active");
	if(imageSetName == "world_vector"){
		this._panel.find(".map-vector-div").addClass("active");
	}else if(imageSetName == "world_image"){
		this._panel.find(".map-image-div").addClass("active");
	}
}