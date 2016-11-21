function addPanelEvent(){

	$("body").find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

	// 返回图层列表
	$(".back-to-layers").click(function(){
		backToLayersTab();
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
		refreshFeatures();
		featureNew = null;
		featureCur = null;
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

	var source = layerCur.getSource();
	var geometryName = source.getGeometryName();
	if(featureNew != null){
		featureNew.setValue(geometryName,featureNew.geometry);
	}else if(featureCur != null){
		featureCur.setValue(geometryName,featureCur.geometry);
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
		var source = layerCur.getSource();
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
	$("#layer_tab .left-tab_title .layer-name,#overlay-info-tab .left-tab_title .layer-name").html(layerCur.name);

	var source = layerCur.getSource();
	if(source == null){
		return;
	}
	$(".overlay-list-div").addClass("loading").empty();

	var success = {
		target : this,
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			showFeatures(features);
		}
	};
	var prop = new GeoBeans.Expression.PropertyName();
	prop.setName("name");

	// 2、定义查询过滤条件，参数为查询的字段
	var filter = new GeoBeans.Filter.IsNullFilter(prop);
	source.getFeatures(filter,success,null);
}

// 展示列表
function showFeatures(features){
	$(".overlay-list-div").removeClass("loading")
	if(features == null){
		return;
	}

	var html = "";
	var feature = null,name = null,geometry = null,geometryType = null,image = null;
	var fid = null,type = null;

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
		html += '<div class="overlay-item" fid="' + fid+'">'
			+	'	<div class="col-md-2">'
			+	'		<img src="' + image + '">'
			+	'	</div>'
			+	'	<div class="col-md-6">' + name + '</div>'
			+	'	<div class="col-md-2 edit">编辑</div>'
			+	'	<div class="col-md-2 remove">删除</div>'
			+	'</div>';

	}

	$(".overlay-list-div").html(html);

	// 编辑
	$(".overlay-list-div .edit").click(function(){
		var fid = $(this).parents(".overlay-item").attr("fid");

		var filter = new GeoBeans.Filter.IDFilter();
		fid += layerCur.getName() + "." + fid;
		filter.addID(fid);

		var query = new GeoBeans.Query({
			typeName : layerCur.getName(),
			filter : filter 	//查询过滤条件
		});

		var success = {
			execute : editFeatureHandler
		};

		layerCur.query(query,success);
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


// 列表中编辑的feature
function editFeatureHandler(features){
	if(features == null){
		return;
	}
	var feature = features[0];
	if(feature == null){
		return;
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