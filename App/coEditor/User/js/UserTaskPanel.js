CoEditor.UserTaskPanel = CoEditor.Class({
	
	_panel : null,

	_checked : false,

	// 所有页码
	_pageCount : null,

	// 当前页码
	_currentPage : null,

	// 每页显示的个数
	_listCount : 20,

	initialize : function(id){
		this._panel = $("#" + id);
		this.registerPanelEvent();
	}
});

CoEditor.UserTaskPanel.prototype.registerPanelEvent = function(){
	var that = this;

	this._panel.find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

	// 伸缩列表
	this._panel.find("#maps_list_panel .maps-coll-icon").click(function(){
		var mapListPanel = that._panel.find("#maps_list_panel");
		var layersListPanel = that._panel.find("#layers_list_panel");
		if(mapListPanel.css("height") == "30px"){
			// 展开
			$(this).attr("data-original-title","收起");
			mapListPanel.animate({
				height : "300px"
			});
		}else{
			// 收起
			$(this).attr("data-original-title","展开");
			mapListPanel.animate({
				height : "30px"
			});
		}
	});

	// 审核点击
	this._panel.find(".btn-group-checked .btn").click(function(){
		that._panel.find(".btn-group-checked .btn").removeAttr("disabled");
		$(this).attr("disabled","disabled");
		if($(this).hasClass("btn-unchecked")){
			that._checked = false;
		}else{
			that._checked = true;
		}
		that.refreshFeatures();
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

	// 返回标绘列表
	this._panel.find(".return-overlay-list").click(function(){
		that.backToOverlayList();
	});

	// 保存标绘
	this._panel.find(".save-overlay").click(function(){
		that.saveFeature();
	});

	// 删除标绘
	this._panel.find(".remove-overlay").click(function(){
		if(!confirm("确定要删除当前要素?")){
			return;
		}
		that.removeFeature();
	});

	// 关闭右侧面板
	this._panel.find(".close-right-icon").click(function(){
		that.closeRightPanel();
	});
}

// 初始化任务页面
CoEditor.UserTaskPanel.prototype.initUserTask = function(){
	if(user == null){
		return;
	}

	this.getTasks();
}

// 获取任务列表，只展示owner的
CoEditor.UserTaskPanel.prototype.getTasks = function(){
	var userName = user.name;
	var role = "owner";
	CoEditor.notify.loading();
	taskManager.describeTask(userName,role,this.getTasks_callback);
}

CoEditor.UserTaskPanel.prototype.getTasks_callback = function(tasks){
	if(tasks == null){
		CoEditor.notify.hideLoading();
		return;
	}

	CoEditor.notify.showInfo("获取任务列表","success");
	var that = CoEditor.userTaskPanel;
	that.showTasks(tasks);
}

CoEditor.UserTaskPanel.prototype.showTasks = function(tasks){
	console.log(tasks);
	if(tasks == null){
		return;
	}

	var html = "";
	var map = null,name = null,task = null,taskName = null;
	for(var i = 0; i < tasks.length;++i){
		task = tasks[i];
		if(task == null){
			continue;
		}
		map = task.map;
		if(map == null){
			continue;
		}
		taskName = task.name;
		name = map.name;
		html += "<div class='list-item' tname='" + taskName + "' mname='" + name + "'>"
		+	taskName + "</div>";
	}

	this._panel.find("#maps_list_panel .list-main-panel").html(html);

	var firstItem = this._panel.find("#maps_list_panel .list-item:first");
	firstItem.addClass("active");
	var mapName = firstItem.attr("mname");
	this.getMap(mapName);

	var that = this;
	// 点击地图列表
	this._panel.find("#maps_list_panel .list-main-panel .list-item").click(function(){
		that._panel.find("#maps_list_panel .list-main-panel .list-item").removeClass("active");
		$(this).addClass("active");

		var name = $(this).attr("mname");
		that.getMap(name);
	});
}


// 获取地图
CoEditor.UserTaskPanel.prototype.getMap = function(mapName){
	if(mapName == null){
		return;
	}
	this._panel.find("#layers_list_panel .list-main-panel").empty();
	this.closeRightPanel();
	CoEditor.notify.loading();
	var mapManager = user.getMapManager();
	mapManager.getMapObj(mapName,this.initMap_callback);

}


// 初始化地图
CoEditor.UserTaskPanel.prototype.initMap_callback = function(map){
	CoEditor.notify.hideLoading();
	var that = CoEditor.userTaskPanel;
	that.initMap(map);
}

// 初始化地图
CoEditor.UserTaskPanel.prototype.initMap = function(map){
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

	this.refreshLayersList();
}

// 刷新图层面板
CoEditor.UserTaskPanel.prototype.refreshLayersList = function(){
	if(mapObj == null){
		return;
	}

	var layers = mapObj.layers;
	var layer = null,name = null;

	var html = '';
	for(var i = 0; i < layers.length;++i){
		layer = layers[i];
		if(layer == null || layer instanceof GeoBeans.Layer.TileLayer){
			continue;
		}
		name = layer.getName();
		html += "<div class='list-item'>" 
				+  '<span class="layer-name">' + name + '</span>'
				+ '<i class="glyphicon glyphicon-ok layer-visible"></i>'
				+ "</div>";
	}	

	this._panel.find("#layers_list_panel .list-main-panel").html(html);

	var that = this;
	// 点击图层列表
	this._panel.find("#layers_list_panel .list-item .layer-name").click(function(){
		that._panel.find("#layers_list_panel .list-item").removeClass("active");
		$(this).parents(".list-item").addClass("active");
		var name = $(this).html();

		var layer = mapObj.getLayer(name);
		if(layer == null){
			return;
		} 
		layerCur = layer;
		that.refreshFeatures();
	});

	// 图层显示
	this._panel.find("#layers_list_panel .list-item .layer-visible,"
		+"#layers_list_panel .list-item .layer-invisible").click(function(){
		var name = $(this).prev().html();
		var layer = mapObj.getLayer(name);
		if(layer == null){
			return;
		} 
		if($(this).hasClass("layer-invisible")){
			$(this).removeClass("layer-invisible")
			layer.setVisible(true);
		}else{
			$(this).addClass("layer-invisible");
			layer.setVisible(false);
		}
		mapObj.refresh();
	});
}

// 获取所有的要素到图层上
CoEditor.UserTaskPanel.prototype.loadAllFeatures = function(layer){
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
			mapObj.refresh();
		}
	}
	source.query(query,success);	
}


// 获取wfs数据源
CoEditor.UserTaskPanel.prototype.getLayerSource = function(layerName){
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


// 设置样式
CoEditor.UserTaskPanel.prototype.setLayerStyle = function(styleName,layer){
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

// 设置默认样式
CoEditor.UserTaskPanel.prototype.setDefaultStyle = function(layer){
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

// 获取样式后进行设置
CoEditor.UserTaskPanel.prototype.getStyle_callback = function(style,layer){
	if(layer != null || style != null){
		layer.setStyle(style);
		mapObj.refresh();
	}
}

// 获取数据列表
CoEditor.UserTaskPanel.prototype.refreshFeatures = function(){
	if(layerCur == null){
		return;
	}
	this._panel.find(".right-panel-tab").removeClass("active");
	this._panel.find("#features_list_div").addClass("active");
	
	var that = this
	this._panel.find(".content-right-panel").animate({
		width : "300px"
	},function(){
		that._panel.find(".btn-group-checked").css("display","inline-block");
	});

	var width = this._panel.find(".content-main-panel").width() - 560;
	this._panel.find(".content-center-panel").animate({
		width: width
	},function(){
		mapObj.getViewer().update();
	});


	this._panel.find(".overlay-list-div").addClass("loading").empty();
	this.getFeaturesCount();
}

// 获取数据个数
CoEditor.UserTaskPanel.prototype.getFeaturesCount = function(){
	if(layerCur == null){
		return;
	}

	var checked = null;
	if(this._checked){
		checked = 1;
	}else{
		checked = 0;
	}
	var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
	var prop = new GeoBeans.Expression.PropertyName();
	prop.setName("checked");
	var literal = new GeoBeans.Expression.Literal();
	literal.setValue(checked);
	var filter = new GeoBeans.Filter.BinaryComparisionFilter(
						oper,
						prop,
						literal);	

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
			console.log(count);
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
CoEditor.UserTaskPanel.prototype.initPage = function(count){
	this._pageCount = Math.ceil(count / this._listCount);
	this._currentPage = 1;
	this._panel.find(".current-page").html(this._currentPage + " / " + this._pageCount + "页");

	this.getFeaturesByPage();	
}

// 根据页码获取要素
CoEditor.UserTaskPanel.prototype.getFeaturesByPage = function(){
	if(this._currentPage == null || layerCur == null){
		return;
	}
	var offset = (this._currentPage - 1) * this._listCount;
	this._panel.find(".overlay-list-div").addClass("loading").empty();
	this._panel.find(".current-page").html(this._currentPage + " / " + this._pageCount + "页");

	var checked = null;
	if(this._checked){
		checked = 1;
	}else{
		checked = 0;
	}
	var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
	var prop = new GeoBeans.Expression.PropertyName();
	prop.setName("checked");
	var literal = new GeoBeans.Expression.Literal();
	literal.setValue(checked);
	var filter = new GeoBeans.Filter.BinaryComparisionFilter(
						oper,
						prop,
						literal);	

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
			that._panel.find(".overlay-list-div").removeClass("loading");
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
CoEditor.UserTaskPanel.prototype.setFeaturesToLayer = function(features){
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
CoEditor.UserTaskPanel.prototype.showFeatures = function(features){
	if(features == null){
		return;
	}
	var html = '';
	var name = null, feature = null,geometry = null,fid = null;
	for(var i = 0; i < features.length;++i){
		feature = features[i];
		if(feature == null){
			continue;
		}
		geometry = feature.geometry;
		if(geometry == null){
			continue;
		}
		name = feature.getValue("name");
		fid = feature.fid;
		if(name == null || name == "" || name == undefined){
			name = "未命名";
		}
		html += '<div class="list-item" fid="' + fid + '">' + name + "</div>";
	}

	this._panel.find(".overlay-list-div").html(html);

	var that = this;
	// 编辑
	this._panel.find(".overlay-list-div .list-item").click(function(){
		that._panel.find(".right-panel-tab").removeClass("active");
		that._panel.find("#feature_info_div").addClass("active");

		that._panel.find(".overlay-info-div").addClass("loading").empty();
		var fid = $(this).attr("fid");

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
}

// 列表中编辑要素
CoEditor.UserTaskPanel.prototype.editFeatureHandler = function(features){
	if(features == null){
		return;
	}

	var feature = features[0];
	if(feature == null){
		return;
	}

	var that = CoEditor.userTaskPanel;

	var selection = mapObj.getSelection();
	selection.setFeatures(features);
	if(layerCur.getGeometryType() == GeoBeans.Geometry.Type.POINT){
		var selection = mapObj.getSelection();
		var symbolizer = that.createPointSymbolizer();
		selection.setSymbolizer(symbolizer);
	}else{
		var selection = mapObj.getSelection();
		selection.setSymbolizer(null);
	}


	var zoom = mapObj.getViewer().getZoom();
	var geometry = feature.getGeometry();
	if(geometry instanceof GeoBeans.Geometry.Point){
		mapObj.zoomTo(zoom,geometry);
	}else{
		mapObj.zoomToFeatures([feature]);
	}
	
	featureCur = feature;
	
	that.showFeatureInfo();		
}

// 设置点样式
CoEditor.UserTaskPanel.prototype.createPointSymbolizer = function(){
	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();

	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../../coEditor/images/marker-hit.png";
	symbolizer.symbol = symbol;		

	return symbolizer;
}

// 展示要素信息
CoEditor.UserTaskPanel.prototype.showFeatureInfo = function(){
	// 先获取字段
	this.getFields();
}

// 获取字段
CoEditor.UserTaskPanel.prototype.getFields = function(){
	if(layerCur == null){
		return;
	}
	var handler = {
		execute : this.getFields_handler
	};

	var source = this.getLayerSource(layerCur.getName());
	source.getFields(handler);
}


CoEditor.UserTaskPanel.prototype.getFields_handler = function(fields){
	if(!$.isArray(fields)){
		console.log(fields);
		return;
	}	
	if(featureCur == null){
		return;
	}

	var that = CoEditor.userTaskPanel;
	that._panel.find(".overlay-info-div").removeClass("loading");
	var html = "";
	var feature = featureCur;
	var checked = null;
	var checkedValue = feature.getValue("checked");
	var checkedHtml = "";
	if(checkedValue == "1"){
		checkedHtml = "checked";
	}
	html += '<div class="input-group input-group-checked">'
		+	'  	<span class="input-group-addon">' + '审核' + '</span>'
		+	'   <input type="checkbox" data-on-text="通过" data-off-text="未通过" id="feature_checked" ' +  checkedHtml + ' />'
		+	'</div>';		
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
		if(name == "gid" || name == "updatetime" || name == "checked"){
			continue;
		}


		var disabledHtml = "";
		if(name == "username"){
			disabledHtml = " disabled ";
		}
		html += '<div class="input-group">'
			+	'  	<span class="input-group-addon" title="' + name +'">' + name + '</span>'
			+	'  	<input type="text" class="form-control" value="' + value +'" ' + disabledHtml +'>'
			+	'</div>';		
	}
	that._panel.find(".overlay-info-div").html(html);	
	that._panel.find("input[type='checkbox']").bootstrapSwitch();

}

// 返回标绘列表
CoEditor.UserTaskPanel.prototype.backToOverlayList = function(){
	featureCur = null;
	var selection = mapObj.getSelection();
	selection.setFeatures([]);
	this.refreshFeatures();
}


// 保存标绘
CoEditor.UserTaskPanel.prototype.saveFeature = function(){
	if(featureCur == null){
		return;
	}
	$(".overlay-info-div .input-group").not(".input-group-checked").each(function(){
		var field = $(this).find(".input-group-addon").html();
		var value = $(this).find("input").val();
		if(value != null && value != ""){
			featureCur.setValue(field,value);
		}
	});

	var date = new Date();
	var dateStr = dateFormat(date,"yyyy-MM-dd hh:mm:ss");
	featureCur.setValue("updatetime",dateStr);

	var checkedValue = "0";
	var checked = this._panel.find("#feature_checked").bootstrapSwitch("state");
	if(checked){
		checkedValue = "1";
	}

	featureCur.setValue("checked",checkedValue);

	var source = this.getLayerSource(layerCur.getName());
	var updateFeature_success = {
		execute : this.updateFeature_handler
	};
	source.updateFeature(featureCur,updateFeature_success);
}


CoEditor.UserTaskPanel.prototype.updateFeature_handler = function(result){
	console.log(result);
	var selection = mapObj.getSelection();
	selection.setFeatures([]);
	var that = CoEditor.userTaskPanel;
	that.refreshFeatures();
}
// 删除标绘
CoEditor.UserTaskPanel.prototype.removeFeature = function(){
	if(featureCur == null){
		return;
	}

	var source = this.getLayerSource(layerCur.getName());
	var removeFeature_success = {
		execute : this.removeFeature_success_handler
	};
	source.removeFeature(featureCur,removeFeature_success);
}

CoEditor.UserTaskPanel.prototype.removeFeature_success_handler = function(result){
	var selection = mapObj.getSelection();
	selection.setFeatures([]);
	console.log(result);
	var that = CoEditor.userTaskPanel;
	that.refreshFeatures();
}

// 关闭右侧面板
CoEditor.UserTaskPanel.prototype.closeRightPanel = function(){
	var that = this;
	this._panel.find(".content-right-panel").animate({
		width : "0px"
	},function(){
		that._panel.find(".btn-group-checked").css("display","none");
	});

	var width = this._panel.find(".content-main-panel").width() - 260;
	this._panel.find(".content-center-panel").animate({
		width : width
	},function(){
		mapObj.getViewer().update();
	});
}