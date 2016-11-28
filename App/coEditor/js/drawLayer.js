// 选择了一个图层
function clickLayerDiv(listTypeDiv){
	var layerName = $(listTypeDiv).attr("lname");
	var type = $(listTypeDiv).attr("ltype");
	var db = $(listTypeDiv).attr("db");
	layerCur = getLayer(layerName,type,db);

	$(listTypeDiv).find(".layer-invisible,.layer-visible").removeClass("layer-invisible")
		.addClass("layer-visible");
	layerCur.setVisible(true);
	mapObj.refresh();

	if(layerCur == null){
		return;
	}

	refreshFeatures();
	// drawOverlay();
}

// 绘制结束
function onComplete(geometry){
	if(geometry == null){
		return;
	}

	// 默认添加
	addFeature(geometry);
	showFeatureInfo();
}

// 展示具体的信息
function showFeatureInfo(){
	if(layerCur == null){
		return;
	}

	$(".left-tab").removeClass("active");
	$("#overlay-info-tab").addClass("active");
	var layerName = layerCur.getName();
	getFields(getFields_handler);
}

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

function getFields_handler(fields){
	var feature = null;
	var isEdit = false;
	if(featureNew != null){
		// 新建
		feature = featureNew;
		$("#overlay-info-tab .overlay-title").html("新建");
		$("#overlay-info-tab .save-btn").show();
		$("#overlay-info-tab .remove-btn").hide();
		isEdit = true;
	}else{
		// 编辑
		feature = featureCur;
		var username = feature.getValue("username");
		if(username == userName){
			// 当前用户所有，允许编辑
			$("#overlay-info-tab .overlay-title").html("编辑");
			isEdit = true;
			$("#overlay-info-tab .remove-btn").show();
			$("#overlay-info-tab .save-btn").show();
		}else{
			// 只允许查看
			$("#overlay-info-tab .overlay-title").html("查看");
			$("#overlay-info-tab .remove-btn").hide();
			$("#overlay-info-tab .save-btn").hide();
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
		if(name == "gid" || name == "username" || name == "updatetime"){
			continue;
		}
		html += '<div class="input-group">'
			+	'  	<span class="input-group-addon">' + name + '</span>'
			+	'  	<input type="text" class="form-control" value="' + value +'" ' + disabledHtml + '>'
			+	'</div>';
	}

	$(".overlay-info-div").html(html);
}

function addFeature(geometry){
	if(geometry == null){
		return;
	}

	var fid = GeoBeans.Utility.uuid();
	var feature = new GeoBeans.Feature({
		fid : fid,
		geometry : geometry
	});

	featureNew = feature;
	showFeatureInfo();
}

// 采集
function drawOverlay(){
	removeSelectInteraction();
	var geomType = layerCur.getGeometryType();
	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;

	drawer.draw(geomType,symbolizer);
}