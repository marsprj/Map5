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

function addFeatureLayer(){
	featureLayer = new GeoBeans.Layer.FeatureLayer({
		name : "features",
		geometryType : GeoBeans.Geometry.Type.POINT,
		source : new GeoBeans.Source.Feature({

		})
	});

	mapObj.addLayer(featureLayer);
}


function loadPointType(){
	var html = "";
	for(var i = 0; i < g_pointType.length;++i){
		var obj = g_pointType[i];
		var name = obj.name;
		var image = obj.image;

		html += '<div class="list-type">'
		 	+	'	<div class="col-md-4">'
		 	+	'		<img src="' +  image +'">'
		 	+	'	</div>'
		 	+	'	<div class="col-md-8">'
		 	+			name
		 	+	'	</div>'
		 	+	'</div>';
	}

	$("#point_type_tab .list-type-div").html(html);
}