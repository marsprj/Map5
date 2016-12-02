function loadMap(){
	mapObj = new GeoBeans.Map({
		target : "map_div",
		name : "map",
		srs  : GeoBeans.Proj.WGS84,
		baselayer : "base",
		layers : [
			new GeoBeans.Layer.TileLayer({
				"name" : "base",
				"source" : new GeoBeans.Source.Tile.QuadServer({
		 			"url" : "/QuadServer/maprequest",
		 			"imageSet" : "world_vector"
		 		}),
		 		"opacity" : 1.0,
		 		"visible" : true
			})
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});
}

function addDrawInteraction(){
	drawer = new GeoBeans.Interaction.Draw({
		map : mapObj,
		onComplete : onComplete
	});
	mapObj.addInteraction(drawer);
}



function loadLayersList(){
	$(".left-tab").removeClass("active");
	$("#layers_tab").addClass("active");
	var html = "";
	for(var i = 0; i < g_layers.length;++i){
		var obj = g_layers[i];
		var name = obj.name;
		var image = obj.image;
		var type = obj.type;
		var db = obj.db;

		html += '<div class="list-type" lname="' + name + '" ltype="' + type 
						+ '" db="' + db + '">'
		 	+	'	<div class="col-md-4 layer-style" data-container="body" data-toggle="popover" data-placement="bottom" data-content="">'
		 	+	'		<img src="' +  image +'">'
		 	+	'	</div>'
		 	+	'	<div class="col-md-6 layer-name">'
		 	+			name
		 	+	'	</div>'
		 	+	'	<div class="col-md-2 layer-invisible">'
		 	+	'	</div>'
		 	+	'</div>';
	}

	$("#layers_tab .list-type-div").html(html);	

	// 进入图层
	$("#layers_tab .list-type .layer-name").click(function(){
		var layerDiv = $(this).parents(".list-type");
		clickLayerDiv(layerDiv);
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


    // 设置样式
    $("#layers_tab .layer-style").click(function(){
    	var layerDiv = $(this).parents(".list-type");
    	showStylePanel(layerDiv);
    });

    $("#layers_tab .layer-style").popover({
    	html : true
    });

    $('#layers_tab .layer-style').on('shown.bs.popover', function(){
    	var that = this;
	    $(".style-panel").find('[data-toggle="tooltip"]').tooltip({
	        container: "body"
	    });

    	// 点样式的事件
    	$(".popover-content li").click(function(){
    		var listTypeDiv = $(that).parents(".list-type");
			var layerName = $(listTypeDiv).attr("lname");
			var type = $(listTypeDiv).attr("ltype");
			var db = $(listTypeDiv).attr("db");
			layerCur = getLayer(layerName,type,db);

    		var image = $(this).attr("pimage");

    		// 设置新的样式
    		$(that).find("img").attr("src",image);
    		$(that).popover("hide");
    		var style = new GeoBeans.Style.FeatureStyle();
    		var symbol = new GeoBeans.Style.Symbol();
			symbol.icon = image;
			symbol.scale = 1.0;
			var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
			symbolizer.symbol = symbol;
			var rule = new GeoBeans.Style.Rule();
			rule.symbolizer = symbolizer;
			style.addRule(rule);
			layerCur.setStyle(style);
    		mapObj.refresh();
    	});

    	// 线样式事件
	    $(".line-style-panel .colorSelector").colpick({
			color:'cccccc',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).children().css("background-color","#" + hex);
				changeLineStyle_color(hex);

			},
			onSubmit:function(hsb,hex,rgb,el,bySetColor){
				$(el).children().css("background-color","#" + hex);
				$(el).colpickHide();
				changeLineStyle_color(hex);
			}
		});

		$(".line-style-panel .slider").slider({
			tooltip : 'hide'
		});
		$(".line-style-panel .slider").on("slide",function(slideEvt){
			var parent = $(this).parents(".row");
			var input = parent.find(".slider-value")
							.val(slideEvt.value + "%");
			parent.find(".colorSelector div").css("opacity",
						slideEvt.value/100);	
			changeLineStyle_colorOpacity(slideEvt.value/100);
		});
		$(".line-style-panel .stroke-width").change(function(){
			var value = $(this).val();
			value = parseFloat(value);
			changeLineStyle_width(value);
		});

		// 面样式事件
		$(".polygon-style-panel input[type='checkbox']").change(function(){
			var item = $(this).parents(".row");
			var checked = $(this).prop("checked");
			setStyleItemEnabled(item,checked);
		});

		// 线段颜色
	    $(".polygon-style-panel .stroke-row .colorSelector").colpick({
			color:'cccccc',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).children().css("background-color","#" + hex);
				changePolygonStyle_strokeColor(hex);

			},
			onSubmit:function(hsb,hex,rgb,el,bySetColor){
				$(el).children().css("background-color","#" + hex);
				$(el).colpickHide();
				changePolygonStyle_strokeColor(hex);
			}
		});	

		$(".polygon-style-panel .slider").slider({
			tooltip : 'hide'
		});
		$(".polygon-style-panel .stroke-row .slider").on("slide",function(slideEvt){
			var parent = $(this).parents(".row");
			var input = parent.find(".slider-value")
							.val(slideEvt.value + "%");
			parent.find(".colorSelector div").css("opacity",
						slideEvt.value/100);	
			changePolygonStyle_colorOpacity(slideEvt.value/100);
		});

		$(".polygon-style-panel .stroke-width").change(function(){
			var value = $(this).val();
			value = parseFloat(value);
			changePolygonStyle_width(value);
		});

		// 填充颜色
		$(".polygon-style-panel .fill-row .colorSelector").colpick({
			color:'cccccc',
			onChange:function(hsb,hex,rgb,el,bySetColor) {
				$(el).children().css("background-color","#" + hex);
				changePolygonStyle_fillColor(hex);

			},
			onSubmit:function(hsb,hex,rgb,el,bySetColor){
				$(el).children().css("background-color","#" + hex);
				$(el).colpickHide();
				changePolygonStyle_fillColor(hex);
			}
		});	
		// 填充颜色透明度
		$(".polygon-style-panel .fill-row .slider").on("slide",function(slideEvt){
			var parent = $(this).parents(".row");
			var input = parent.find(".slider-value")
							.val(slideEvt.value + "%");
			parent.find(".colorSelector div").css("opacity",
						slideEvt.value/100);	
			changePolygonStyle_fillColorOpacity(slideEvt.value/100);
		});		

		// 设置面样式stroke
		$(".polygon-style-panel .stroke-row .style-enable").change(function(){
			var checked = $(this).prop("checked");
			changePolygonStyle_stroke(checked);
		});

		// 设置面样式fill
		$(".polygon-style-panel .fill-row .style-enable").change(function(){
			var checked = $(this).prop("checked");
			changePolygonStyle_fill(checked);
		});		


		// 获取样式
    	var listTypeDiv = $(that).parents(".list-type");
		var layerName = $(listTypeDiv).attr("lname");
		var type = $(listTypeDiv).attr("ltype");
		var db = $(listTypeDiv).attr("db");
		layerCur = getLayer(layerName,type,db);
		var style = layerCur.style;
		var symbolizer = style.rules[0].symbolizer;
		if(symbolizer instanceof GeoBeans.Symbolizer.LineSymbolizer){
			initLineSymbolizer(symbolizer);
		}else if(symbolizer instanceof GeoBeans.Symbolizer.PolygonSymbolizer){
			initPolygonSymbolizer(symbolizer);
		}
	});
}

// 获取图层
function getLayer(layerName,type,db){
	if(layerName == null){
		return;
	}

	var layer = mapObj.getLayer(layerName);
	if(layer != null){
		return layer;
	}

	var style = getStyleByLayerName(layerName);
	var layer = new GeoBeans.Layer.FeatureLayer({			
		name : layerName,
		geometryType : type,
		// source : new GeoBeans.Source.Feature.WFS({
		// 	url : "/ows/radi/mgr?",
		// 	version : "1.0.0",
		// 	featureNS : 'http://www.radi.ac.cn',
		// 	featurePrefix : "radi",
		// 	featureType : layerName,
		// 	geometryName : "shape",
		// 	outputFormat: "GML2",
		// 	sourceName : db
		// }),		
		source : new GeoBeans.Source.Feature({
			geometryName : "shape",
		}),
		style : style
	});

	mapObj.addLayer(layer);
	return layer;
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



function onSelectionChange(features){
	console.log("click:" + features.length);
	if(features.length == 0){
		refreshFeatures();
		return;
	}

	var feature = features[0];
	featureCur = feature;
	openInfoWindow();
	showFeatureInfo();
}


// 添加点击交互
function addSelectInteraction(){
	if(layerCur == null){
		return;
	}

	removeSelectInteraction();
	var select = new GeoBeans.Interaction.Select({
		"map" : mapObj,
		"layer" : layerCur
	});
	select.onchange(onSelectionChange);
	mapObj.addInteraction(select);
}

// 删除点击交互
function removeSelectInteraction(){
	var select = mapObj.getInteraction(GeoBeans.Interaction.Type.SELECT);
	mapObj.removeInteraction(select);
}

// 弹出弹框
function openInfoWindow(){
	if(featureCur == null){
		return;
	}
	var geometry = featureCur.geometry;
	if(geometry == null){
		return;
	}

	var type = geometry.type;
	if(type != GeoBeans.Geometry.Type.POINT){
		return;
	}

	var infoWindow = mapObj.getWidget(GeoBeans.Widget.Type.INFO_WINDOW);
	if(infoWindow == null){
		return;
	}

	var name = featureCur.getValue("name");
	infoWindow.setPosition(geometry);
	infoWindow.setOption({
		title : layerCur.getName(),
		content : "名称 : " + name
	});
	infoWindow.show(true);
}

// 根据图层名称获取wfs的source 
function getWFSSourceByLayerName(layerName){
	if(layerName == null){
		return null;
	}
	return new GeoBeans.Source.Feature.WFS({
		url : url,
		version : "1.0.0",
		featureNS : 'http://www.radi.ac.cn',
		featurePrefix : "radi",
		featureType : layerName,
		geometryName : "shape",
		outputFormat: "GML2",
		sourceName : db
	});	
}

// 日期格式化
function dateFormat(date,fmt){
	var o = {   
		"M+" : date.getMonth()+1,                 //月份   
		"d+" : date.getDate(),                    //日   
		"h+" : date.getHours(),                   //小时   
		"m+" : date.getMinutes(),                 //分   
		"s+" : date.getSeconds(),                 //秒   
		"q+" : Math.floor((date.getMonth()+3)/3), //季度   
		"S"  : date.getMilliseconds()             //毫秒   
	};   
	if(/(y+)/.test(fmt))   
		fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
	for(var k in o)   
		if(new RegExp("("+ k +")").test(fmt))   
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
	return fmt;   	
}

// 添加地图拖动，滚动事件
function addMapEvent(){
	// mapObj.on(GeoBeans.Event.DRAG_END, onMapEvent);
	// mapObj.on(GeoBeans.Event.MOUSE_WHEEL, onMapEvent);
}

// 暂时不考虑
function onMapEvent(evt){
	var viewer = mapObj.getViewer();
	var extent = viewer.getExtent();
	var propName = "shape";
	var filter = new GeoBeans.Filter.BBoxFilter(propName,extent);
	// getCount(filter);
}