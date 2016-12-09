// 注册页面事件
function registerPanelEvent(){
	// 返回标绘列表
	$(".return-overlay-list").click(function(){
		refreshFeatures();
	});

	// 切换页码
	$(".page-div .pagination li").click(function(){
		if($(this).hasClass("first-page")){
			currentPage = 1;
			getFeaturesByPage();
			
		}else if($(this).hasClass("pre-page")){
			if(currentPage > 1 && currentPage <= pageCount){
				currentPage = currentPage - 1;
				getFeaturesByPage();
			}
		}else if($(this).hasClass("next-page")){
			if(currentPage > 0 && currentPage < pageCount){
				currentPage = currentPage + 1;
				getFeaturesByPage();
			}
		}else if($(this).hasClass("last-page")){
			currentPage = pageCount;
			getFeaturesByPage();
		}
	});	
}


var g_users = ["a","b","c"];

// 加载用户
function loadUser(){
	var html = '';
	for(var i = 0; i < g_users.length;++i){
		html += '<div class="left-panel-content-item">'
			+ g_users[i] + "</div>";
	}
	$("#user_panel .left-panel-content").html(html);

	var firstChild = $("#user_panel .left-panel-content .left-panel-content-item:first");
	var name = firstChild.html();
	if(name != null || name == ""){
		userName = name;
		firstChild.addClass("active");
	}

	// 切换用户
	$("#user_panel .left-panel-content .left-panel-content-item").click(function(){
		$("#user_panel .left-panel-content .left-panel-content-item").removeClass("active");
		$(this).addClass("active");
		var name = $(this).html();
		userName = name;
		loadLayers();
	});
}

// 加载图层
function loadLayers(){
	var html = '';
	var obj = null;
	var name = null,type = null;
	for(var i = 0; i < g_layers.length;++i){
		obj = g_layers[i];
		name = obj.name;
		type = obj.type;
		html += '<div class="left-panel-content-item" ltype="' + type +'">' 
			+ name + "</div>";
	}

	$("#layers_panel .left-panel-content").html(html);

	var firstChild = $("#layers_panel .left-panel-content .left-panel-content-item:first");
	var name = firstChild.html();
	if(name != null || name == ""){
		
		var type =firstChild.attr("ltype");
		firstChild.addClass("active");
		initLayer(name,type);
	}

	// 切换图层
	$("#layers_panel .left-panel-content .left-panel-content-item").click(function(){
		$("#layers_panel .left-panel-content .left-panel-content-item").removeClass("active");
		$(this).addClass("active");
		var name = $(this).html();
		var type = $(this).attr("ltype");
		initLayer(name,type);
	});
}


// 初始化图层
function initLayer(layerName,type){
	if(layerName == null || type == null){
		return;
	}


	if(layerCur != null){
		removeSelectInteraction();
		mapObj.removeLayer(layerCur.getName());

	}
	var style = getStyleByLayerName(layerName);
	layer = new GeoBeans.Layer.FeatureLayer({			
		name : layerName,
		geometryType : type,
		source : new GeoBeans.Source.Feature({
			geometryName : "shape",
		}),
		style : style
	});
	mapObj.addLayer(layer);
	layerCur = layer;
	addSelectInteraction();

	var selection = mapObj.getSelection();
	selection.setFeatures([]);
	mapObj.refresh();	

	refreshFeatures();
}

// 刷新列表
function refreshFeatures(){
	$("#overlays_panel .content-tab").removeClass("active");
	$("#overlay_list_tab").addClass("active");
	$(".overlay-list-div").addClass("loading").empty();
	$(".return-overlay-list").removeClass("active");
	var selection = mapObj.getSelection();
	selection.setFeatures([]);
	mapObj.refresh();
	// 读取个数
	getCount();
}

// 读取样式
function getStyleByLayerName(layerName){
	if(layerName == null){
		return null;
	}
	var style = new GeoBeans.Style.FeatureStyle();

	var obj = null,type = null,styleObj = null;
	for(var i = 0; i < g_layers.length;++i){
		obj = g_layers[i];
		type = obj.type;
		if(obj.name != layerName){
			continue;
		}
		styleObj = obj.style;
		switch(type){
			case "Point":{
				var image = styleObj.image;
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
			case "LineString":{
				var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				if(styleObj.stroke != null){
					symbolizer.stroke.color.setHex(styleObj.stroke);
				}
				if(styleObj.opacity != null){
					symbolizer.stroke.color.setOpacity(styleObj.opacity);
				}
				if(styleObj.width != null){
					symbolizer.stroke.width = styleObj.width;
				}
				var rule = new GeoBeans.Style.Rule();
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			case "Polygon":{
				var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
				if(styleObj.stroke != null){
					symbolizer.stroke.color.setHex(styleObj.stroke);
					if(styleObj.strokeOpacity != null){
						symbolizer.stroke.color.setOpacity(styleObj.strokeOpacity);
					}
					if(styleObj.width != null){
						symbolizer.stroke.width = styleObj.width;
					}
				}else{
					symbolizer.stroke = null;
				}
				if(styleObj.fill != null){
					symbolizer.fill.color.setHex(styleObj.fill);

					if(styleObj.fillOpacity != null){
						symbolizer.fill.color.setOpacity(styleObj.fillOpacity);
					}
				}

				var rule = new GeoBeans.Style.Rule();
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			default:
				break;
		}
	}

	return style;
}

// 读取个数
function getCount(){
	if(layerCur == null || userName == null){
		return;
	}
	var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
	var prop = new GeoBeans.Expression.PropertyName();
	prop.setName("username");
	var literal = new GeoBeans.Expression.Literal();
	literal.setValue(userName);
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


	var success = {
		execute : function(count){
			$(".overlay-list-div").removeClass("loading");
			if(!isValid(count)){
				return;
			}
			initPage(count);
		}
	};

	var source = getWFSSourceByLayerName(layerCur.getName());
	if(source != null){
		source.queryCount(query,success);
	}	
}

// 初始化页码
function initPage(count){
	pageCount = Math.ceil(count / listCount);
	$(".current-page").html(currentPage + " / " + pageCount + "页");
	currentPage = 1;

	getFeaturesByPage();
}

// 根据页码获取要素
function getFeaturesByPage(){
	if(layerCur == null || userName == null){
		return;
	}
	$(".overlay-list-div").addClass("loading").empty();
	var offset = (currentPage - 1) * listCount;
	$(".current-page").html(currentPage + " / " + pageCount + "页");

	var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
	var prop = new GeoBeans.Expression.PropertyName();
	prop.setName("username");
	var literal = new GeoBeans.Expression.Literal();
	literal.setValue(userName);
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
		maxFeatures : listCount,
		offset : offset
	});

	var success = {
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			$(".overlay-list-div").removeClass("loading");
			addFeaturesToLayer(features);
			showFeatures(features);
		}
	};

	var source = getWFSSourceByLayerName(layerCur.getName());
	if(source != null){
		source.query(query,success);
	}	
}

// 添加到地图上
function addFeaturesToLayer(features){
	if(features == null || layerCur == null){
		return;
	}

	var source = layerCur.getSource();
	source.setFeatures(features);
	mapObj.refresh();
}


// 显示列表
function showFeatures(features){
	if(features == null || layerCur == null){
		return;
	}

	var f = null,fid = null,name = null;
	var html = '';
	for(var i = 0; i < features.length;++i){
		f = features[i];
		if(f == null){
			continue;
		}
		name = f.getValue("name");
		if(name == null || name == ""){
			continue;
		}
		fid = f.fid;

		html += "<div class='left-panel-content-item' fid='" + fid + "'>"
			+ name + "</div>";

	}
	$(".overlay-list-div").html(html);

	// 查看信息
	$(".overlay-list-div .left-panel-content-item").click(function(){
		$("#overlays_panel .content-tab").removeClass("active");
		$("#overlay_info_tab").addClass("active").addClass("loading");
		$("#overlay_info_tab .overlay-info").empty();
		$(".return-overlay-list").addClass("active");

		var fid = $(this).attr("fid");

		var filter = new GeoBeans.Filter.IDFilter();
		fid = layerCur.getName() + "." + fid;
		filter.addID(fid);

		var source = getWFSSourceByLayerName(layerCur.getName());
		var query = new GeoBeans.Query({
			// typeName : layerCur.getName(),
			filter : filter 	//查询过滤条件
		});

		var success = {
			execute : editFeatureHandler
		};

		source.query(query,success);
	});
}

// 查看编辑列表信息
function editFeatureHandler(features){
	if(features == null){
		return;
	}

	var feature = features[0];
	if(feature == null){
		return;
	}

	var selection = mapObj.getSelection();
	selection.setFeatures(features);
	if(layerCur.getGeometryType() == GeoBeans.Geometry.Type.POINT){
		var symbolizer = createPointSymbolizer();
		selection.setSymbolizer(symbolizer);
	}
	

	var zoom = mapObj.getViewer().getZoom();
	var geometry = feature.getGeometry();
	if(geometry instanceof GeoBeans.Geometry.Point){
		mapObj.zoomTo(zoom,geometry);
	}else{
		mapObj.zoomToFeatures([feature]);
	}
	
	mapObj.refresh();
	featureCur = feature;

	showFeatureInfo();
}

// 展示具体的信息
function showFeatureInfo(){
	if(layerCur == null){
		return;
	}
	$("#overlays_panel .content-tab").removeClass("active");
	$("#overlay_info_tab").addClass("active").addClass("loading");
	$("#overlay_info_tab .overlay-info").empty();
	$(".return-overlay-list").addClass("active");
	getFields(getFields_handler);
}

// 获取字段
function getFields(getFields_handler){
	if(layerCur == null){
		return;
	}

	var handler = {
		execute : getFields_handler
	};

	var source = getWFSSourceByLayerName(layerCur.getName());
	source.getFields(handler);
}

// 字段获取成功
function getFields_handler(fields){
	$("#overlay_info_tab").removeClass("loading");
	if(fields == null || featureCur == null){
		return;
	}

	var field = null,value = null,name = null,value = null;
	var html = '';
	for(var i = 0; i < fields.length;++i){
		field = fields[i];
		if(field == null){
			continue;
		}
		name = field.getName();

		value = featureCur.getValue(name);

		if(value == null){
			value = "";
		}

		var type = field.getType();
		if(type  == GeoBeans.Field.Type.GEOMETRY){
			continue;
		}
		if(name == "gid" || name == "username" || name == "updatetime"){
			continue;
		}
		html += '<div class="input-group">'
			+	'  	<span class="input-group-addon">' + name + '</span>'
			+	'  	<input type="text" class="form-control" value="' + value +'" disabled="disabled">'
			+	'</div>';
	}
	$("#overlay_info_tab .overlay-info").html(html);
}