function addPanelEvent(){

	$("body").find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

	// 返回图层列表
	$(".back-to-layers").click(function(){
		backToLayersTab();
	});


    // 入库
    $(".save-to-db").click(function(){
    	alert("入库保存...");
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
		removeFeature();
	});
}

// 保存feature
function saveFeature(){
	if(featureCur == null){
		return;
	}

	$(".overlay-info-div .input-group").each(function(){
		var field = $(this).find(".input-group-addon").html();
		var value = $(this).find("input").val();

		featureCur.setValue(field,value);
	});

	refreshFeatures();

}

// 删除feature
function removeFeature(){
	if(featureCur == null){
		return;
	}

	var source = layerCur.getSource();
	source.removeFeature(featureCur);
	mapObj.refresh();

	featureCur = null;

	refreshFeatures();

}

// 刷新列表
function refreshFeatures(){
	if(layerCur == null){
		return;
	}
	$(".left-tab").removeClass("active");
	$("#layer_tab").addClass("active");
	$("#layer_tab .left-tab_title .layer-name").html(layerCur.name);

	var source = layerCur.getSource();
	if(source == null){
		return;
	}

	var success = {
		target : this,
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			showFeatures(features);
		}
	};
	source.getFeatures(null,success,null);
}

// 展示列表
function showFeatures(features){
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

		name = feature.getValue("名称");
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
		var fid = $(this).parents(".overlay-item").attr("fid");

		var filter = new GeoBeans.Filter.IDFilter();
		filter.addID(fid);

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
	source.removeFeature(feature);
	mapObj.refresh();

	refreshFeatures();
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