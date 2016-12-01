function loadMap(){
		
	mapObj = new GeoBeans.Map({
		target : "mapDiv",
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
			}),new GeoBeans.Layer.FeatureLayer({			
				"name" : "country",
				"geometryType" : GeoBeans.Geometry.Type.LINESTRING,
				"source" : new GeoBeans.Source.Feature.WFS({
					"url" : "/geoserver/radi/ows?",
					"version" : "1.0.0",
					"featureNS" : 'http://www.radi.ac.cn',
					"featurePrefix" : "radi",
					"featureType" : "rivers_2",
					"geometryName" : "shape",
					"outputFormat": "GML2"
				})
			})
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});
	
}

function loadTileMap(){
		
	mapObj = new GeoBeans.Map({
		target : "mapDiv",
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

function loadCities(){

	mapObj = new GeoBeans.Map({
		target : "mapDiv",
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
			}),new GeoBeans.Layer.FeatureLayer({			
				"name" : "cities",
				"geometryType" : GeoBeans.Geometry.Type.POINT,
				"source" : new GeoBeans.Source.Feature.WFS({
					"url" : "/geoserver/radi/ows?",
					"version" : "1.0.0",
					"featureNS" : 'http://www.radi.ac.cn',
					"featurePrefix" : "radi",
					"featureType" : "cities_2",
					"geometryName" : "shape",
					"outputFormat": "GML2"
				})
			})
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});
}

function loadRivers(){

	mapObj = new GeoBeans.Map({
		target : "mapDiv",
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
			}),new GeoBeans.Layer.FeatureLayer({			
				"name" : "rivers",
				"geometryType" : GeoBeans.Geometry.Type.LINESTRING,
				"source" : new GeoBeans.Source.Feature.WFS({
					"url" : "/geoserver/radi/ows?",
					"version" : "1.0.0",
					"featureNS" : 'http://www.radi.ac.cn',
					"featurePrefix" : "radi",
					"featureType" : "rivers_2",
					"geometryName" : "shape",
					"outputFormat": "GML2"
				})
			})
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});
}