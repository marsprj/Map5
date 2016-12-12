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

// 设置点样式
function createPointSymbolizer(){
	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();

	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../coEditor/images/marker-hit.png";
	symbolizer.symbol = symbol;		

	return symbolizer;
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
	if(layerCur.getGeometryType() == GeoBeans.Geometry.Type.POINT){
		var selection = mapObj.getSelection();
		var symbolizer = createPointSymbolizer();
		selection.setSymbolizer(symbolizer);
	}else{
		var selection = mapObj.getSelection();
		selection.setSymbolizer(null);
	}
	mapObj.addInteraction(select);
}

// 删除点击交互
function removeSelectInteraction(){
	var select = mapObj.getInteraction(GeoBeans.Interaction.Type.SELECT);
	mapObj.removeInteraction(select);
}


// 点击回调函数
function onSelectionChange(features){
	console.log("click:" + features.length);
	if(features.length == 0){
		refreshFeatures();
		return;
	}
	mapObj.refresh();
	var feature = features[0];
	featureCur = feature;
	showFeatureInfo();
}
