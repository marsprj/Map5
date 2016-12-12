// 注册页面事件
function registerPanelEvent(){

	$("body").find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

	// 返回标绘列表
	$(".return-overlay-list").click(function(){
		refreshFeatures();
	});

	// 保存标绘
	$(".save-overlay").click(function(){
		saveFeature();
	});

	// 删除标绘
	$(".remove-overlay").click(function(){
		if(!confirm("确定要删除当前要素?")){
			return;
		}
		removeFeature();
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

	// 刷新
	$("#user_panel .glyphicon-refresh").click(function(){
		loadUser();
	});

	$("#layers_panel .glyphicon-refresh").click(function(){
		loadLayers();
	});

	$("#overlays_panel .glyphicon-refresh").click(function(){
		refreshFeatures();
	});
}


var g_users = ["a","b","c"];

// 加载用户
function loadUser(){
	layerCur = null;
	userName = null;
	// 清空面板
	$("#user_panel .left-panel-content").empty();
	$("#layers_panel .left-panel-content").empty();
	$("#overlays_panel .overlay-list-div").empty();

	var html = '';
	for(var i = 0; i < g_users.length;++i){
		html += '<div class="left-panel-content-item">'
			+ '<span class="username">' + g_users[i] + '</span>'
			+ '<span class="item-oper remove-user pull-right">删除</span>'
			+ "</div>";
	}
	$("#user_panel .left-panel-content").html(html);

	var firstChild = $("#user_panel .left-panel-content .left-panel-content-item:first");
	var name = firstChild.find(".username").html();
	if(name != null || name == ""){
		userName = name;
		firstChild.addClass("active");
	}
	loadLayers();

	// 切换用户
	$("#user_panel .left-panel-content .left-panel-content-item .username").click(function(){
		$("#user_panel .left-panel-content .left-panel-content-item").removeClass("active");
		$(this).parents(".left-panel-content-item").addClass("active");
		var name = $(this).html();
		userName = name;
		loadLayers();
	});

	// 删除用户
	$("#user_panel .left-panel-content .left-panel-content-item .remove-user").click(function(){
		var name = $(this).prev().html();
		if(!confirm("要删除用户[" + name + "]?")){
			return;
		}
		removeUser(name);
	});
}

// 删除用户
function removeUser(username){
	if(username == null){
		return;
	}
	for(var i = 0; i < g_users.length;++i){
		if(g_users[i] == username){
			g_users.splice(i,1);
		}
	}

	loadUser();
}

// 加载图层
function loadLayers(){
	// 清空面板
	$("#layers_panel .left-panel-content").empty();
	$("#overlays_panel .overlay-list-div").empty();

	var html = '';
	var obj = null;
	var name = null,type = null;
	var typeClass = "";
	for(var i = 0; i < g_layers.length;++i){
		obj = g_layers[i];
		name = obj.name;
		type = obj.type;
		if(type == GeoBeans.Geometry.Type.POINT){
			typeClass = "layer-point-type";
		}else if(type == GeoBeans.Geometry.Type.LINESTRING){
			typeClass = "layer-line-type";
		}else if(type == GeoBeans.Geometry.Type.POLYGON){
			typeClass = "layer-polygon-type";
		}
		html += '<div class="left-panel-content-item" ltype="' + type +'">' 
			  +	 '<i class="layer-type-icon ' + typeClass + '"></i>'			
			  + '	<span class="layer-name">' + name + '</span>'
			  + '	<span class="item-oper remove-layer pull-right">删除</span>'
			  + "</div>";
	}

	$("#layers_panel .left-panel-content").html(html);

	var firstChild = $("#layers_panel .left-panel-content .left-panel-content-item:first");
	var name = firstChild.find("span.layer-name").html();
	if(name != null || name == ""){
		var type =firstChild.attr("ltype");
		firstChild.addClass("active");
		initLayer(name,type);
	}

	// 切换图层
	$("#layers_panel .left-panel-content .left-panel-content-item .layer-name").click(function(){
		$("#layers_panel .left-panel-content .left-panel-content-item").removeClass("active");
		$(this).parents(".left-panel-content-item").addClass("active");
		var name = $(this).html();
		var type = $(this).parents(".left-panel-content-item").attr("ltype");
		initLayer(name,type);
	});

	// 删除图层
	$("#layers_panel .left-panel-content .left-panel-content-item .remove-layer").click(function(){
		var name = $(this).prev().html();
		if(!confirm("确定要删除图层[" + name + "]?")){
			return;
		}
		removeLayer(name);
	});
}

// 删除图层
function removeLayer(layerName){
	if(layerName == null){
		return;
	}

	for(var i = 0; i < g_layers.length;++i){
		if(g_layers[i].name == layerName){
			g_layers.splice(i,1);
		}
	}
	if(layerCur != null){
		if(layerCur.getName() == layerName){
			mapObj.removeLayer(layerName);
			mapObj.refresh();
			layerCur = null;
		}
	}
	loadLayers();
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
	$("#overlays_panel .title-oper").removeClass("active");
	$("#overlays_panel .glyphicon-refresh").addClass("active");
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
			+	"	<span class='overlay-name'>" + name +"</span>"
			+  	"	<span class='item-oper remove-overlay pull-right'>删除</span>"
			+   "</div>";

	}
	$(".overlay-list-div").html(html);

	// 查看信息
	$(".overlay-list-div .left-panel-content-item .overlay-name").click(function(){
		$("#overlays_panel .content-tab").removeClass("active");
		$("#overlay_info_tab").addClass("active").addClass("loading");
		$("#overlay_info_tab .overlay-info").empty();
		$("#overlays_panel .title-oper").addClass("active");
		$("#overlays_panel .glyphicon-refresh").removeClass("active");

		var fid = $(this).parents(".left-panel-content-item").attr("fid");

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

	// 删除
	$(".overlay-list-div .left-panel-content-item .remove-overlay").click(function(){
		var name = $(this).prev().html();
		if(!confirm("确认删除[" + name + "]?")){
			return;
		}
		var fid = $(this).parents(".left-panel-content-item").attr("fid");
		var filter = new GeoBeans.Filter.IDFilter();
		filter.addID(layerCur.getName() + "." + fid);

		var query = new GeoBeans.Query({
			typeName : layerCur.getName(),
			filter : filter 	//查询过滤条件
		});

		var source = getWFSSourceByLayerName(layerCur.getName());
		var success = {
			execute : removeFeatureHandler
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
	$("#overlays_panel .title-oper").addClass("active");
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
			+	'  	<input type="text" class="form-control" value="' + value +'">'
			+	'</div>';
	}
	$("#overlay_info_tab .overlay-info").html(html);
}

// 删除列表中feature
function removeFeatureHandler(features){
	if(features == null){
		return;
	}

	var feature = features[0];
	if(feature == null){
		return;
	}

	var source = getWFSSourceByLayerName(layerCur.getName());
	var removeFeature_success = {
		execute : removeFeature_success_handler
	};
	source.removeFeature(feature,removeFeature_success);
}

function removeFeature_success_handler(result){
	console.log(result);
	mapObj.refresh();
	refreshFeatures();
	featureCur = null;
}

// 删除标绘
function removeFeature(){
	if(featureCur == null){
		return;
	}

	var source = getWFSSourceByLayerName(layerCur.getName());
	var removeFeature_success = {
		execute : removeFeature_success_handler
	};
	source.removeFeature(featureCur,removeFeature_success);
}


// 保存标绘
function saveFeature(){
	if(featureCur == null){
		return;
	}

	$(".overlay-info .input-group").each(function(){
		var field = $(this).find(".input-group-addon").html();
		var value = $(this).find("input").val();
		if(value != null && value != ""){
			featureCur.setValue(field,value);
		}
	});

	var date = new Date();
	var dateStr = dateFormat(date,"yyyy-MM-dd hh:mm:ss");

	var source = getWFSSourceByLayerName(layerCur.getName());
	var geometryName = source.getGeometryName();
	featureCur.setValue(geometryName,featureCur.geometry);
	featureCur.setValue("updatetime",dateStr);

	var updateFeature_success = {
		execute : updateFeature_handler
	};
	source.updateFeature(featureCur,updateFeature_success);
}

function updateFeature_handler(result){
	featureCur = null;
	console.log(result);
	refreshFeatures();

}