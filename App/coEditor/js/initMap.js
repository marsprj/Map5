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


// 加载所有图层
// function loadLayersList(){
// 	var html = "";
// 	for(var i = 0; i < g_layers.length;++i){
// 		var obj = g_layers[i];
// 		var name = obj.name;
// 		var image = obj.image;
// 		var type = obj.type;

// 		html += '<div class="list-type" lname="' + name + '" ltype="' + type + '">'
// 		 	+	'	<div class="col-md-4">'
// 		 	+	'		<img src="' +  image +'">'
// 		 	+	'	</div>'
// 		 	+	'	<div class="col-md-8">'
// 		 	+			name
// 		 	+	'	</div>'
// 		 	+	'</div>';
// 	}

// 	$("#layers_tab .list-type-div").html(html);	

// 	$("#layers_tab .list-type").click(function(){
// 		clickLayerDiv(this);
// 	});
// }

function loadLayersList(){
	var html = "";
	for(var i = 0; i < g_layers.length;++i){
		var obj = g_layers[i];
		var name = obj.name;
		var image = obj.image;
		var type = obj.type;
		var db = obj.db;

		html += '<div class="list-type" lname="' + name + '" ltype="' + type 
						+ '" db="' + db + '">'
		 	+	'	<div class="col-md-4">'
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

	$("#layers_tab .list-type .layer-name").click(function(){
		var layerDiv = $(this).parents(".list-type");
		clickLayerDiv(layerDiv);
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
		source : new GeoBeans.Source.Feature.WFS({
			url : "/ows/radi/mgr?",
			version : "1.0.0",
			featureNS : 'http://www.radi.ac.cn',
			featurePrefix : "radi",
			featureType : layerName,
			geometryName : "shape",
			outputFormat: "GML2",
			sourceName : db
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