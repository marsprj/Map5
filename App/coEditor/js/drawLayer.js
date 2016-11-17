// 选择了一个图层
function clickLayerDiv(listTypeDiv){
	var layerName = $(listTypeDiv).attr("lname");
	var type = $(listTypeDiv).attr("ltype");
	layerCur = getLayer(layerName,type);

	if(layerCur == null){
		return;
	}

	refreshFeatures();
	drawOverlay();
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
	if(layerCur == null || featureCur == null){
		return;
	}

	$(".left-tab").removeClass("active");
	$("#overlay-info-tab").addClass("active");
	var layerName = layerCur.getName();
	var fields = getFields(layerName);
	var html = "";

	for(var i = 0; i < fields.length;++i){
		var field = fields[i];
		var value = featureCur.getValue(field);
		if(value == null){
			value = "";
		}
		html += '<div class="input-group">'
			+	'  	<span class="input-group-addon">' + fields[i] + '</span>'
			+	'  	<input type="text" class="form-control" value="' + value +'">'
			+	'</div>';
	}

	$(".overlay-info-div").html(html);


}
// 获取字段
function getFields(layerName){
	for(var i = 0;  i < g_layers.length;++i){
		var obj = g_layers[i];
		if(obj.name == layerName){
			return obj.fields;
		}
	}
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

	featureCur = feature;
	var source = layerCur.getSource();
	source.addFeature(feature);
	mapObj.refresh();

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