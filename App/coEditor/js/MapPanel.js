CoEditor.MapPanel = CoEditor.Class({

	initialize : function(id){
		this._panel = $("#"+ id);
		this.registerPanelEvent();
	}
});

CoEditor.MapPanel.prototype.registerPanelEvent = function(){

}

// 展示地图面板
CoEditor.MapPanel.prototype.showMapPanel = function(){
	$(".content-panel").removeClass("active");
	$("#main_panel").addClass("active");	
}

// 初始化地图
CoEditor.MapPanel.prototype.initMap = function(map){
	if(map == null){
		return;
	}

	var baseLayer = map.baseLayer;
	var baselayerName = null;
	if(baseLayer != null){
		baselayerName = baseLayer.getName();
	}
	var baselayerName = 
	mapObj = new GeoBeans.Map({
		target : "map_div",
		name : map.name,
		srs  : GeoBeans.Proj.WGS84,
		baselayer : baselayerName,
		layers : [
			baseLayer
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});


	var layers = map.layers;
	for(var i = 0; i < layers.length;++i){
		var layer = layers[i];
		var layerName = layer.getName();
		var type = layer.geomType;
		if(layer instanceof GeoBeans.Layer.FeatureDBLayer){
			var layer = new GeoBeans.Layer.FeatureLayer({			
					name : layerName,
					geometryType : type,
					source : new GeoBeans.Source.Feature({
						geometryName : "shape",
					}),
					// style : style
				});
			this.loadAllFeatures(layer);
			mapObj.addLayer(layer);
		}
	}
}

// 获取wfs数据源
CoEditor.MapPanel.prototype.getLayerSource = function(layerName){
	if(layerName == null){
		return;
	}
	return new GeoBeans.Source.Feature.WFS({
		url : user.getServer(),
		version : "1.0.0",
		featureNS : 'http://www.radi.ac.cn',
		featurePrefix : "radi",
		featureType : layerName,
		geometryName : "shape",
		outputFormat: "GML2",
		mapName : mapObj.name
	});
} 


// 获取所有的要素添加到图层上
CoEditor.MapPanel.prototype.loadAllFeatures = function(layer){
	if(layer == null){
		return;
	}

	var source = this.getLayerSource(layer.getName());
	if(source == null){
		return;
	}
	var query = new GeoBeans.Query({

	});
	var success = {
		execute : function(features){
			if(features == null){
				return;
			}
			var s = layer.getSource();
			s.setFeatures(features);
			mapObj.refresh();
		}
	}
	source.query(query,success);
}
