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

// function addFeatureLayer(){
// 	featureLayer = new GeoBeans.Layer.FeatureLayer({
// 		name : "features",
// 		geometryType : GeoBeans.Geometry.Type.POINT,
// 		source : new GeoBeans.Source.Feature({

// 		})
// 	});

// 	mapObj.addLayer(featureLayer);
// }


// function loadPointType(){
// 	var html = "";
// 	for(var i = 0; i < g_pointType.length;++i){
// 		var obj = g_pointType[i];
// 		var name = obj.name;
// 		var image = obj.image;

// 		html += '<div class="list-type" ltype="' + name + '">'
// 		 	+	'	<div class="col-md-4">'
// 		 	+	'		<img src="' +  image +'">'
// 		 	+	'	</div>'
// 		 	+	'	<div class="col-md-8">'
// 		 	+			name
// 		 	+	'	</div>'
// 		 	+	'</div>';
// 	}

// 	$("#point_type_tab .list-type-div").html(html);
// }

// function loadLineType(){
// 	var html = "";
// 	for(var i = 0; i < g_lineType.length;++i){
// 		var obj = g_lineType[i];
// 		var name = obj.name;
// 		var image = obj.image;

// 		html += '<div class="list-type" ltype="' + name + '">'
// 		 	+	'	<div class="col-md-4">'
// 		 	+	'		<img src="' +  image +'">'
// 		 	+	'	</div>'
// 		 	+	'	<div class="col-md-8">'
// 		 	+			name
// 		 	+	'	</div>'
// 		 	+	'</div>';
// 	}

// 	$("#line_type_tab .list-type-div").html(html);	
// }

// function loadPolygonType(){
// 	var html = "";
// 	for(var i = 0; i < g_polygonType.length;++i){
// 		var obj = g_polygonType[i];
// 		var name = obj.name;
// 		var image = obj.image;

// 		html += '<div class="list-type" ltype="' + name + '">'
// 		 	+	'	<div class="col-md-4">'
// 		 	+	'		<img src="' +  image +'">'
// 		 	+	'	</div>'
// 		 	+	'	<div class="col-md-8">'
// 		 	+			name
// 		 	+	'	</div>'
// 		 	+	'</div>';
// 	}

// 	$("#polygon_type_tab .list-type-div").html(html);		
// }

// 加载所有图层
function loadLayersList(){
	var html = "";
	for(var i = 0; i < g_layers.length;++i){
		var obj = g_layers[i];
		var name = obj.name;
		var image = obj.image;
		var type = obj.type;

		html += '<div class="list-type" lname="' + name + '" ltype="' + type + '">'
		 	+	'	<div class="col-md-4">'
		 	+	'		<img src="' +  image +'">'
		 	+	'	</div>'
		 	+	'	<div class="col-md-8">'
		 	+			name
		 	+	'	</div>'
		 	+	'</div>';
	}

	$("#layers_tab .list-type-div").html(html);	

	$("#layers_tab .list-type").click(function(){
		clickLayerDiv(this);
	});
}

// 获取图层
function getLayer(layerName,type){
	if(layerName == null){
		return;
	}

	var layer = mapObj.getLayer(layerName);
	if(layer != null){
		return layer;
	}

	var style = getStyleByLayerName(layerName);
	layer = new GeoBeans.Layer.FeatureLayer({
		name : layerName,
		geometryType : type,
		style : style,
		source : new GeoBeans.Source.Feature({

		})
	});
	mapObj.addLayer(layer);
	var select = new GeoBeans.Interaction.Select({
		"map" : mapObj,
		"layer" : layer
	});
	select.onchange(onSelectionChange);
	mapObj.addInteraction(select);

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
}