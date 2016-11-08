function addPanelEvent(){

	$("body").find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    }),

	// 退回类型
	$(".type-before").click(function(){
		showTypeBefore();
	});

	// 从类型页面到信息页面
	$(".type-next").click(function(){
		showFeatureInfo();
	});

	// 点击了某个类型
	$("#point_type_tab .list-type,#line_type_tab .list-type,#polygon_type_tab .list-type")
		.click(function(){
			clickListType(this);
	});

	// 保存feature
	$(".save-btn").click(function(){
		saveFeature();
	});

	// 删除feature
	$(".remove-btn").click(function(){
		removeFeature();
	});

	// 搜索
	$(".search-btn").click(function(){
		var name = $(".search-input").val();
		if(name == ""){
			alert("请输入查询名称");
			return;
		}
		searchFeature(name);
	});

	// 返回列表
	$(".list-btn").click(function(){
		listFeatures();
	});
}

// 显示刚才选择的类型
function showTypeBefore(){
	if(featureCur == null){
		return;
	}

	var g = featureCur.geometry;
	if(g == null){
		return;
	}

	var type = featureCur.getValue("type");

	switch(g.type){
		case GeoBeans.Geometry.Type.POINT:{
			$(".left_tab").removeClass("active");
			$("#point_type_tab").addClass("active");
			$("#point_type_tab .list-type").removeClass("active");
			$("#point_type_tab .list-type[ltype='" + type　+"']").addClass("active");
			break;
		}

		case GeoBeans.Geometry.Type.LINESTRING:{
			$(".left_tab").removeClass("active");
			$("#line_type_tab").addClass("active");
			$("#line_type_tab .list-type").removeClass("active");
			$("#line_type_tab .list-type[ltype='" + type　+"']").addClass("active");
			break;
		}

		case GeoBeans.Geometry.Type.POLYGON:{
			$(".left_tab").removeClass("active");
			$("#polygon_type_tab").addClass("active");
			$("#polygon_type_tab .list-type").removeClass("active");
			$("#polygon_type_tab .list-type[ltype='" + type　+"']").addClass("active");
			break;
		}

		default:
			break;
	}


}


// 保存feature
function saveFeature(){
	if(featureCur == null){
		return;
	}
	var name = $(".overlay-name").val();
	if(name == null || name == ""){
		alert("请输入名称");
		return;
	}
	featureCur.setValue("name",name);

	// 刷新列表
	refreshFeatures();
	// 
	drawer.enable(true);

	featureCur = null;
}

// 删除feature
function removeFeature(){
	if(featureCur == null){
		return;
	}

	var source = featureLayer.getSource();
	source.removeFeature(featureCur);
	mapObj.refresh();

	refreshFeatures();

	featureCur = null;

}

// 点击了某个类型，一个是选择，一个是修改
function clickListType(listTypeDiv){
	if(featureCur == null){
		// 添加
		var symbolizer = getSymbolizer(listTypeDiv);
		var type = $(listTypeDiv).attr("ltype");

		var source = featureLayer.getSource();
		var fid = GeoBeans.Utility.uuid();
		featureCur = new GeoBeans.Feature({
			fid : fid,
			geometry : geometry,
			properties : {
				type : type
			}
		});

		featureCur.symbolizer = symbolizer;
		source.addFeature(featureCur);
		mapObj.refresh();

		showFeatureInfo();

	}else{
		// 修改
		var type = $(listTypeDiv).attr("ltype");

		featureCur.setValue("type",type);

		var symbolizer = getSymbolizer(listTypeDiv);

		featureCur.symbolizer = symbolizer;
		mapObj.refresh();

		showFeatureInfo();
	}
}

// 刷新列表
function refreshFeatures(){
	$(".left_tab").removeClass("active");
	$("#overlay-tab").addClass("active");
	var source = featureLayer.getSource();
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

function showFeatures(features){
	if(features == null){
		return;
	}

	var html = "";
	var feature = null,name = null,geometry = null,geometryType = null,image = null;
	var fid = null,type = null;
	for(var i = 0; i < features.length;++i){
		feature = features[i];
		if(feature == null){
			continue;
		}
		geometry = feature.geometry;
		if(geometry == null){
			continue;
		}

		geometryType = geometry.type;
		type = feature.getValue("type");
		name = feature.getValue("name");
		fid = feature.fid;
		image = getTypeImage(geometryType,type);
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
			typeName : featureLayer.getName(),
			filter : filter 	//查询过滤条件
		});

		var success = {
			execute : editFeatureHandler
		};

		featureLayer.query(query,success);
	});

	// 删除
	$(".overlay-list-div .remove").click(function(){
		var fid = $(this).parents(".overlay-item").attr("fid");

		var filter = new GeoBeans.Filter.IDFilter();
		filter.addID(fid);

		var query = new GeoBeans.Query({
			typeName : featureLayer.getName(),
			filter : filter 	//查询过滤条件
		});

		var success = {
			execute : removeFeatureHandler
		};

		featureLayer.query(query,success);
		
	});


}
	
// 展示feature的信息
function showFeatureInfo(){
	if(featureCur == null){
		return;
	}
	$(".left_tab").removeClass("active");
	$("#overlay-info-tab").addClass("active");
	var name = featureCur.getValue("name");
	if(name != null || name != ""){
		$(".overlay-name").val(name);
	}
}

function getTypeImage(geometryType,name){
	var values = null;
	switch(geometryType){
		case GeoBeans.Geometry.Type.POINT:{
			values = g_pointType;
			break;
		}
		case GeoBeans.Geometry.Type.LINESTRING:{
			values = g_lineType;
			break;
		}
		case GeoBeans.Geometry.Type.POLYGON:{
			values = g_polygonType;
			break;
		}
	}
	if(values == null){
		return null;
	}
	for(var i = 0; i < values.length;++i){
		if(values[i].name == name){
			return values[i].image;
		}
	}

	return null;
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

	var source = featureLayer.getSource();
	source.removeFeature(feature);
	refreshFeatures();
	mapObj.refresh();
} 

// 列表中编辑feature
function editFeatureHandler(features){
	if(features == null){
		return;
	}

	var feature = features[0];
	if(feature == null){
		return;
	}

	featureCur = feature;
	showTypeBefore();

}

// 查询
function searchFeature(name){
	if(name == null){
		return;
	}

	$("#overlay-tab .list-btn").show();

	var likeName = "%"+ name + "%";
	var operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike;

	var prop = new GeoBeans.Expression.PropertyName();
	prop.setName("name");
	
	var literal = new GeoBeans.Expression.Literal();
	literal.setValue(likeName);

	var filter = new GeoBeans.Filter.BinaryComparisionFilter(operator,prop,literal);

	var query = new GeoBeans.Query({
		typeName : featureLayer.getName(),
		fields : null,		// 字段
		maxFeatures : null, //返回结果数
		offset : null,		//偏移量
		orderby : null,		//排序类
		filter : filter 	//查询过滤条件
	});		

	var handler = {
		execute : searchFeatureHandler
	}

	featureLayer.query(query, handler);
}


function searchFeatureHandler(features){
	showFeatures(features);
}


function listFeatures(){
	$(".list-btn").hide();
	$(".search-input").val("");
	refreshFeatures();
}


// 获取样式,根据类型
function getSymbolizer(listTypeDiv){
	if(geometry == null || listTypeDiv == null){
		return null;
	}

	var type = geometry.type;
	var symbolizer = null;
	switch(type){
		case GeoBeans.Geometry.Type.POINT:{
			var image = $(listTypeDiv).find("img").attr("src");
			var symbol = new GeoBeans.Style.Symbol();
			symbol.icon = image;
			symbol.scale = 1.0;

			symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
			symbolizer.symbol = symbol;	
			break;
		}

		case GeoBeans.Geometry.Type.LINESTRING:{
			var type = $(listTypeDiv).attr("ltype");
			var obj = null;
			for(var i = 0; i < g_lineType.length;++i){
				obj = g_lineType[i];
				if(obj.name == type){
					var style = obj.style;
					symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
					if(style.stroke != null){
						symbolizer.stroke.color.setHex(style.stroke);
					}
					if(style.opacity != null){
						symbolizer.stroke.color.setOpacity(style.opacity);
					}
					if(style.width != null){
						symbolizer.stroke.width = style.width;
					}
					break;
				}
			}
			break;
		}
		case GeoBeans.Geometry.Type.POLYGON:{
			var type = $(listTypeDiv).attr("ltype");
			var obj = null;
			for(var i = 0; i < g_polygonType.length;++i){
				obj = g_polygonType[i];
				if(obj.name == type){
					var style = obj.style;
					symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
					if(style.stroke != null){
						symbolizer.stroke.color.setHex(style.stroke);
						if(style.strokeOpacity != null){
							symbolizer.stroke.color.setOpacity(style.strokeOpacity);
						}
						if(style.width != null){
							symbolizer.stroke.width = style.width;
						}
					}else{
						symbolizer.stroke = null;
					}
					if(style.fill != null){
						symbolizer.fill.color.setHex(style.fill);

						if(style.fillOpacity != null){
							symbolizer.fill.color.setOpacity(style.fillOpacity);
						}
					}
					break;						
				}
			}
			break;
		}
	}

	return symbolizer;
		
}