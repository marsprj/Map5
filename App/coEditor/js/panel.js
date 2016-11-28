function addPanelEvent(){

	$("body").find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

    // 图层显示设置
    $("#layers_tab .layer-visible,#layers_tab .layer-invisible").click(function(){
    	var listTypeDiv = $(this).parents(".list-type");
		var layerName = $(listTypeDiv).attr("lname");
		var type = $(listTypeDiv).attr("ltype");
		var db = $(listTypeDiv).attr("db");
		layerCur = getLayer(layerName,type,db);
		loadAllFeatures();
		if($(this).hasClass("layer-visible")){
			layerCur.setVisible(false);
			$(this).removeClass("layer-visible").addClass("layer-invisible");
		}else{
			layerCur.setVisible(true);
			$(this).removeClass("layer-invisible").addClass("layer-visible");
		}
		mapObj.refresh();
    });

	// 返回图层列表
	$(".back-to-layers").click(function(){
		backToLayersTab();
	});


	// 显示所有还是自己的
	$("#show_all").click(function(){
		$(this).attr("disabled","disabled");
		$("#show_user").removeAttr("disabled");
		userOnly = false;
		refreshFeatures();
	});

	$("#show_user").click(function(){
		$(this).attr("disabled","disabled");
		$("#show_all").removeAttr("disabled");
		userOnly = true;
		refreshFeatures();
	});

    // 采集
    $(".draw-overlay").click(function(){
    	drawOverlay();
    });


  	// 保存feature
	$(".save-btn").click(function(){
		saveFeature();
	});  


	// 删除feature
	$(".remove-btn").click(function(){
		if(!confirm("确认删除么？")){
			return;
		}
		removeFeature();
	});

	// 取消
	$(".cancel-btn").click(function(){
		getFeaturesByPage();
		featureNew = null;
		featureCur = null;
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

// 区分是添加还是更新
function saveFeature(){
	if(featureCur == null && featureNew == null){
		return;
	}

	$(".overlay-info-div .input-group").each(function(){
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

	var source = getWFSSourceByLayerName(layerCur.getName());
	var geometryName = source.getGeometryName();
	if(featureNew != null){
		featureNew.setValue(geometryName,featureNew.geometry);
		featureNew.setValue("username",userName);
		// featureNew.setValue("updatetime",dateStr);
	}else if(featureCur != null){
		featureCur.setValue(geometryName,featureCur.geometry);
		// featureCur.setValue("updatetime",dateStr);
	}
	
	if(featureNew != null){
		var addFeature_success = {
			execute : addFeature_handler
		};

		source.addFeature(featureNew,addFeature_success);
	}
 	
 	if(featureCur != null){
 		var updateFeature_success = {
 			execute : updateFeature_handler
 		};
 		source.updateFeature(featureCur,updateFeature_success);
 	}
	
}

function addFeature_handler(result){
	featureNew = null;
	console.log(result);
	refreshFeatures();

}

function updateFeature_handler(result){
	featureCur = null;
	console.log(result);
	refreshFeatures();

}

// 删除feature,如果是准备新添加的，则不用处理，如果是已有的，则删除
function removeFeature(){
	if(featureCur != null){
		var source = getWFSSourceByLayerName(layerCur.getName());
		var removeFeature_success = {
			execute : removeFeature_success_handler
		};
		source.removeFeature(featureCur,removeFeature_success);
	}

	if(featureNew != null){
		refreshFeatures();
		featureNew = null;
	}
}

// 刷新列表
function refreshFeatures(){
	if(layerCur == null){
		return;
	}


	addSelectInteraction();
	$(".left-tab").removeClass("active");
	$("#layer_tab").addClass("active");
	$("#layer_tab .left-tab-title .layer-name,#overlay-info-tab .left-tab-title .layer-name").html(layerCur.name);
	$(".overlay-list-div").addClass("loading").empty();

	
	getCount();
}

// 获取个数
function getCount(bboxFilter){
	if(layerCur == null){
		return;
	}

	var filter = null;
	if(userOnly){
		var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.Expression.PropertyName();
		prop.setName("username");
		var literal = new GeoBeans.Expression.Literal();
		literal.setValue(userName);
		var userFilter = new GeoBeans.Filter.BinaryComparisionFilter(
							oper,
							prop,
							literal);
		if(bboxFilter != null){
			var operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprAnd;
			var filter = new GeoBeans.Filter.BinaryLogicFilter(operator);
			filter.addFilter(bboxFilter);
			filter.addFilter(userFilter);
		}else{
			filter = userFilter;
		}
	}else{
		if(bboxFilter != null){
			filter = bboxFilter;
		}
	}

	

	var orderby = new GeoBeans.Query.OrderBy();
	// orderby.addField("updatetime");
	orderby.addField("gid");
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

// 设置页码
function initPage(count){
	pageCount = Math.ceil(count / listCount);
	$(".current-page").html(currentPage + " / " + pageCount + "页");
	currentPage = 1;

	getFeaturesByPage();
}

// 根据页码获取要素
function getFeaturesByPage(){
	if(currentPage == null || layerCur == null){
		return;
	}

	$(".left-tab").removeClass("active");
	$("#layer_tab").addClass("active");
	$(".overlay-list-div").addClass("loading").empty();
	var offset = (currentPage - 1) * listCount;
	$(".current-page").html(currentPage + " / " + pageCount + "页");
	addSelectInteraction();

	var filter = null;
	if(userOnly){
		var oper = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
		var prop = new GeoBeans.Expression.PropertyName();
		prop.setName("username");
		var literal = new GeoBeans.Expression.Literal();
		literal.setValue(userName);
		filter = new GeoBeans.Filter.BinaryComparisionFilter(
							oper,
							prop,
							literal);
	}

	var orderby = new GeoBeans.Query.OrderBy();
	// orderby.addField("updatetime");
	orderby.addField("gid");
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

	// 先删除已有的，再添加新的
	var query = new GeoBeans.Query({
		filter: null,
	});
	var success = {
		execute : function(f){
			var source = layerCur.getSource();
			while(f.length>0){
				source.removeFeature(f[f.length-1]);
			}
			// for(var i = 0; i < f.length;++i){
			// 	source.removeFeature(f[i]);
			// }
			source.addFeatures(features);
			mapObj.refresh();
		}
	};
	layerCur.query(query,success);
}


// 显示列表
function showFeatures(features){
	if(features == null){
		return;
	}

	var html = "";
	var feature = null;

	var username = null;
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
		image = "images/food.png";
		image = getLayerIconImage();
		username = feature.getValue("username");
		html += '<div class="overlay-item" fid="' + fid+'">'
			+	'	<div class="col-md-2">'
			+	'		<img src="' + image + '">'
			+	'	</div>'
			+	'	<div class="col-md-8 overlay-name">' + name + '</div>'
			+	((username == userName)? '<div class="col-md-2 remove">删除</div>': '')
			+	'</div>';
	}

	$(".overlay-list-div").html(html);

	// 编辑
	$(".overlay-list-div .overlay-name").click(function(){
		var fid = $(this).parents(".overlay-item").attr("fid");

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
	$(".overlay-list-div .remove").click(function(){
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

		var success = {
			execute : removeFeatureHandler
		};

		layerCur.query(query,success);
	});
}

// 展示列表
// function showFeatures(features){
// 	$(".overlay-list-div").removeClass("loading")
// 	if(features == null){
// 		return;
// 	}

// 	featuresList = features;

// 	pageCount = Math.ceil(featuresList.length / listCount);
// 	currentPage = 1;
// 	showFeatureByPage();
// }


// function showFeatureByPage(){
// 	var page = currentPage;
// 	if(currentPage > pageCount){
// 		return;
// 	}

// 	$(".current-page").html(currentPage + " / " + pageCount + "页");
// 	var start = featuresList.length - (currentPage -1) * listCount -1;
// 	var end = start - listCount + 1;
// 	if(end < 0){
// 		end = 0;
// 	}

// 	var html = "";
// 	var feature = null,name = null,geometry = null,geometryType = null,image = null;
// 	var fid = null,type = null;

// 	for(var i=start; i >= end;--i){
// 		feature = featuresList[i];
// 		if(feature == null){
// 			continue;
// 		}

// 		geometry = feature.geometry;
// 		if(geometry == null){
// 			continue;
// 		}

// 		name = feature.getValue("name");
// 		if(name == null || name == ""){
// 			name = "未命名";
// 		}

// 		fid = feature.fid;
// 		image = "images/food.png";
// 		image = getLayerIconImage();
// 		html += '<div class="overlay-item" fid="' + fid+'">'
// 			+	'	<div class="col-md-2">'
// 			+	'		<img src="' + image + '">'
// 			+	'	</div>'
// 			+	'	<div class="col-md-8 overlay-name">' + name + '</div>'
// 			// +	'	<div class="col-md-2 edit">编辑</div>'
// 			+	'	<div class="col-md-2 remove">删除</div>'
// 			+	'</div>';
// 	}

// 	$(".overlay-list-div").html(html);

// 	// 编辑
// 	$(".overlay-list-div .overlay-name").click(function(){
// 		var fid = $(this).parents(".overlay-item").attr("fid");

// 		var filter = new GeoBeans.Filter.IDFilter();
// 		fid += layerCur.getName() + "." + fid;
// 		filter.addID(fid);

// 		var query = new GeoBeans.Query({
// 			typeName : layerCur.getName(),
// 			filter : filter 	//查询过滤条件
// 		});

// 		var success = {
// 			execute : editFeatureHandler
// 		};

// 		layerCur.query(query,success);
// 	});

// 	// 删除
// 	$(".overlay-list-div .remove").click(function(){
// 		if(!confirm("确认删除么？")){
// 			return;
// 		}
// 		var fid = $(this).parents(".overlay-item").attr("fid");

// 		var filter = new GeoBeans.Filter.IDFilter();
// 		filter.addID(layerCur.getName() + "." + fid);

// 		var query = new GeoBeans.Query({
// 			typeName : layerCur.getName(),
// 			filter : filter 	//查询过滤条件
// 		});

// 		var success = {
// 			execute : removeFeatureHandler
// 		};

// 		layerCur.query(query,success);
// 	});
// }

// 列表中编辑的feature
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


	var zoom = mapObj.getViewer().getZoom();
	var geometry = feature.getGeometry();
	if(geometry instanceof GeoBeans.Geometry.Point){
		mapObj.zoomTo(zoom,geometry);
	}else{
		mapObj.zoomToFeatures([feature]);
	}
	
	featureCur = feature;

	showFeatureInfo();
}

// 列表中删除feature
function removeFeatureHandler(features){
	if(features == null){
		return;
	}

	var feature = features[0];
	if(feature == null){
		return;
	}

	var source = layerCur.getSource();
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

// 返回图层列表
function backToLayersTab(){
	$(".left-tab").removeClass("active");
	$("#layers_tab").addClass("active");
	if(layerCur != null){
		var layerName = layerCur.getName();
		$("#layers_tab .list-type").removeClass("active");
		$("#layers_tab .list-type[lname='" + layerName + "']").addClass("active");
	}
}

// 获取当前图层的图标
function getLayerIconImage(){
	if(layerCur == null){
		return "";
	}
	var obj = null;
	var layerName = layerCur.getName();
	for(var i = 0; i < g_layers.length;++i){
		obj = g_layers[i];
		if(obj.name == layerName){
			return obj.image;
		}
	}
	return "";
}

// 获取所有的要素
function loadAllFeatures(){
	if(layerCur == null){
		return;
	}
	var source = getWFSSourceByLayerName(layerCur.getName());
	var query = new GeoBeans.Query({

	});
	var success = {
		execute : function(features){
			if(features == null){
				return;
			}
			var s = layerCur.getSource();
			s.addFeatures(features);
			mapObj.refresh();
		}
	}
	source.query(query,success);
}