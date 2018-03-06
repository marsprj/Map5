GeoBeans.MapManager = GeoBeans.Class({
	service : "ims",
	version : "1.0.0",
	server : null,
	maps : null,

	getMap_u_id : null,
	getMap_u_map : null,

	// createMap_u_id : null,
	// createMap_u_name : null,
	// createMap_u_extent : null,
	// createMap_u_srid : null,

	removeMap_u_callback : null,

	initialize : function(server){
		this.server = server + "/mgr";
		this.maps = [];
	},

	getMaps : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=describeMap";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.maps = that.parseMaps(xml);
				if(callback != undefined){
					callback(that.maps);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	getMap : function(id,name){
		if(id == null || name == null 
			|| name == ""){
			return;
		}
		this.getMap_u_id = id;
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=describeMap&"
					+ "name=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var map = that.parseMap(xml);
				that.getMap_u_map = map;
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error : function(){
			}
		});
		return that.getMap_u_map;
	},

	// 创建地图
	createMap : function(name,extent,srid,callback){
		if(name == null || extent == null 
			|| srid == null){
			return;
		}
		// this.createMap_u_id = id;
		// this.createMap_u_name = name;
		// this.createMap_u_extent = extent;
		// this.createMap_u_srid = srid;
		// this.createMap_u_callback = callback;
		var extentStr = extent.toString();
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=CreateMap"
					+ "&name=" + name + "&extent=" 
					+ extentStr + "&srid=" + srid;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseCreateMap(xml);
				// that.createMap_callback(result);
				if(isValid(callback)){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},


	removeMap : function(name){
		if(name == null || name == ""){
			return;
		}
		// this.removeMap_u_callback = callback;
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RemoveMap"
					+ "&name=" + name;
		this.removeMapResult = null;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRemoveMap(xml);
				that.removeMapResult = result;
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return this.removeMapResult;
	},

	parseMaps : function(xml){
		var maps = [];
		var that = this;
		$(xml).find("Map").each(function(){
			// var map = new GeoBeans.Map();
			var map = new Object();
			var name = $(this).find("Name").text();
			var srid = $(this).find("Srid").text();
			var envelopeXML = $(this).find("BoundingBox");
			var extent = that.parseBoundingBox(envelopeXML);
			var thumbnail = $(this).find("Thumbnail").attr("xlink");


			map.name = name;
			map.srid = srid;
			map.extent = extent;
			if(thumbnail.length - thumbnail.lastIndexOf(".png") == 4){
				map.thumbnail = thumbnail;	
			}
			maps.push(map);
		});
		return maps;
	},

	parseMap : function(xml){
		var exception = $(xml).find("ows\\:ExceptionText").text();
		if(exception != ""){
			console.log(exception);
			return null;
		}

		var that = this;
		var name = $(xml).find("Name:first").text();
		var srid = $(xml).find("Srid:first").text();
		var envelopeXML = $(xml).find("BoundingBox:first");
		var extent = that.parseBoundingBox(envelopeXML);
		var viewerXML = $(xml).find("Viewer:first");
		var viewer = that.parseBoundingBox(viewerXML);
		var thumbnail = $(xml).find("Thumbnail").attr("xlink");

		var map = new GeoBeans.Map(that.server,
					that.getMap_u_id,
					name,
					extent,
					srid,
					viewer);
		map.thumbnail = thumbnail;
		$(xml).find("Capability>Layer").each(function(){
			var layer = that.parseLayer(this);
			if(layer instanceof GeoBeans.Layer.GroupLayer){
				// map.groupLayer = layer;
				var dbLayers = layer.getLayers();
				for(var i = 0; i < dbLayers.length;++i){
					var dbLayer = dbLayers[i];
					dbLayer.setMap(map);
					// map.addLayer(dbLayer);
					map.groupLayer.addLayer(dbLayer);
				}
			}else if(layer instanceof GeoBeans.Layer.TileLayer){
				map.setBaseLayer(layer);
			}else{
				map.addLayer(layer);
			}
		});
		return map;
	},

	parseBoundingBox : function(xml){
		if(xml == null){
			return null;
		}
		var xmin = parseFloat($(xml).attr("minx"));
		var ymin = parseFloat($(xml).attr("miny"));
		var xmax = parseFloat($(xml).attr("maxx"));
		var ymax = parseFloat($(xml).attr("maxy"));

		if(!$.isNumeric(xmin) || !$.isNumeric(xmax) || !$.isNumeric(ymin) || !$.isNumeric(ymax)){
			return null;
		}
		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
	},

	parseLayer : function(xml){
		if(xml == null){
			return null;
		}
		var layer = null;
		
		var type = $(xml).find("Type").first().text();
		if(type == "Group"){
			layer = this.parseGroupLayer(xml);
		}else if(type.toLowerCase() == "quadserver" || type.toLowerCase() == "wmts"){
			layer = this.parseTileLayer(xml);
		}
		return layer;
	},

	parseGroupLayer : function(xml){
		if(xml == null){
			return null;
		}
		var that = this;
		

		var name = $(xml).find("Name:first").text();
		var extentXML = $(xml).find("BoundingBox:first");
		var extent = this.parseBoundingBox(extentXML);

		var groupLayer = new GeoBeans.Layer.GroupLayer(name);
		groupLayer.extent = extent;
		$(xml).find("Layer").each(function(){
			var dbLayer = that.parseDBLayer(this);
			groupLayer.addLayer(dbLayer);
		});
		return groupLayer;
	},

	parseDBLayer : function(xml){
		if(xml == null){
			return null;
		}
		var dbLayer = null;
		var id = $(xml).attr("id");
		var name = $(xml).find("Name:first").text();
		var queryable = parseInt($(xml).attr("queryable"));
		var visible = parseInt($(xml).attr("visible"));
		if(visible == 1){
			visible = true;
		}else{
			visible = false;
		}
		var type = $(xml).find("Type").first().text();
		var dbLayerType = null;
		switch(type.toLowerCase()){
			case "raster":{
				dbLayerType = GeoBeans.Layer.DBLayer.Type.Raster;
				break;
			}
			case "feature":{
				dbLayerType = GeoBeans.Layer.DBLayer.Type.Feature;
				break;
			}
			default:
				break;
		}

		var extentXML = $(xml).find("BoundingBox:first");
		var extent = this.parseBoundingBox(extentXML);

		if(dbLayerType == GeoBeans.Layer.DBLayer.Type.Raster){
			dbLayer = new GeoBeans.Layer.RasterDBLayer(name,parseInt(id),null,null,queryable,visible,null);
			dbLayer.extent = extent;
		}else if(dbLayerType == GeoBeans.Layer.DBLayer.Type.Feature){
			var styleName = $(xml).find("Style>Name").text();
			var geomType = $(xml).find("GeometryType").text();
			var geomFeatureType = null;
			switch(geomType.toUpperCase()){
				case "POINT":{
					geomFeatureType = GeoBeans.Geometry.Type.POINT;
					break;
				}
				case "LINESTRING":{
					geomFeatureType = GeoBeans.Geometry.Type.LINESTRING;
					break;
				}
				case "POLYGON":{
					geomFeatureType = GeoBeans.Geometry.Type.POLYGON;
					break;
				}
				case "MULTIPOINT":{
					geomFeatureType = GeoBeans.Geometry.Type.MULTIPOINT;
					break;
				}
				case "MULTILINESTRING":{
					geomFeatureType = GeoBeans.Geometry.Type.MULTILINESTRING;
					break;
				}
				case "MULTIPOLYGON":{
					geomFeatureType = GeoBeans.Geometry.Type.MULTIPOLYGON;
					break;
				}
				default:
					break;
			}
			dbLayer = new GeoBeans.Layer.FeatureDBLayer(name,parseInt(id),null,null,queryable,visible,styleName);
			dbLayer.extent = extent;
			dbLayer.geomType = geomFeatureType;
		}
		return dbLayer;
	},

	parseTileLayer : function(xml){
		if(xml == null){
			return null;
		}
		var id = $(xml).attr("id");
		var queryable = parseInt($(xml).attr("queryable"));
		if(queryable == 1){
			queryable = true;
		}else{
			queryable = false;
		}
		var visible = parseInt($(xml).attr("visible"));
		if(visible == 1){
			visible = true;
		}else{
			visible = false;
		}
		var name = $(xml).find("Name:first").text();
		var title = $(xml).find("Title:first").text();
		var type = $(xml).find("Type").text();
		var url = $(xml).find("URL").text();
		var extentXML = $(xml).find("BoundingBox:first");
		var extent = this.parseBoundingBox(extentXML);
		var layer = null;
		if(type == "QuadServer"){
			var source_url = url.slice(0,url.indexOf("?"));
			var imageSet = url.slice(url.lastIndexOf("=")+1,url.length);
			var source = new GeoBeans.Source.Tile.QuadServer({
                url : source_url,
                imageSet : imageSet
            });

			// layer = new GeoBeans.Layer.TileLayer(name,url);
			// layer.extent = extent;
			// layer.visible = visible;
			// layer.queryable = queryable;
			// layer.id = id;
			layer = new GeoBeans.Layer.TileLayer({
				name : name,
				source : source,
				visible : visible
			});
			layer.extent = extent;
            layer.id = id;
		}else if(type == "WMTS"){
			layer = this.getWMTSLayer(name,url);
			if(layer != null){
				layer.visible = visible;
				layer.queryable = queryable;
				layer.id = id;
			}
		}
		return layer;
	},

	
	getWMTSLayer : function(name,url){
		if(url == null && name == null){
			return null;
		}

		var typeName = null,format = null,tms = null,extent = null,extentStr = null;
		var sourceName = null,server= null,startLevel = null,endLevel = null;
		var array = url.split(';');
		for(var i = 0; i < array.length;++i){
			var str = array[i];
			var strArray = str.split(":");
			var item = strArray[0];
			switch(item){
				case "typeName":{
					typeName = strArray[1];
					break;
				}
				case "format":{
					format = strArray[1];
					break;
				}
				case "tms":{
					tms = strArray[1];
					break;
				}
				case "extent":{
					extentStr = strArray[1];
					var c = extentStr.split(",");
					extent = new GeoBeans.Envelope(parseFloat(c[0]),parseFloat(c[1]),
						parseFloat(c[2]),parseFloat(c[3]));
					break;
				}
				case "sourceName":{
					sourceName = strArray[1];
					break;
				}
				case "url":{
					server = strArray[1];
					break;
				}
				case "startLevel":{
					startLevel = strArray[1];
					startLevel = parseInt(startLevel);
					break;
				}
				case "endLevel":{
					endLevel = strArray[1];
					endLevel = parseInt(endLevel);
					break;
				}
				default:
					break;
			}
		}

		if(name != null && typeName!= null && format != null && tms != null &&extent != null 
			&& sourceName != null&& server != null){
			var layer = new GeoBeans.Layer.WMTSLayer(name,server,typeName,extent,tms,format,sourceName);
			if(startLevel != null){
				layer.MIN_ZOOM_LEVEL = startLevel;
			}
			if(endLevel != null){
				layer.MAX_ZOOM_LEVEL = endLevel;
			}
			return layer;
		}
		return null;
	},


	parseCreateMap : function(xml){
		var result = $(xml).find("CreateMap")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ows\\:ExceptionText").text();
		return exception;
	},

	// createMap_callback : function(result){
	// 	if(this.createMap_u_callback == null){
	// 		return;
	// 	}
	// 	if(result != "success"){
	// 		this.createMap_u_callback(null,result);
	// 		return;
	// 	}
	// 	var map = new GeoBeans.Map(this.server,
	// 				this.createMap_u_id,
	// 				this.createMap_u_name,
	// 				this.createMap_u_extent,
	// 				this.createMap_u_srid);
	// 	this.createMap_u_callback(map,result);
	// },

	parseRemoveMap : function(xml){
		var result = $(xml).find("RemoveMap")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ows\\:ExceptionText").text();
		return exception;
	},

	removeMap_callback : function(result){
		if(this.removeMap_u_callback != null){
			this.removeMap_u_callback(result);
		}
	},


	// 保存地图
	saveMap : function(map,callback){
		if(map == null){
			if(callback != null){
				callback("map is null");
				return;
			}
		}
		var xml = this.buildSaveMapXML(map);
		if(xml == null){
			if(callback != null){
				callback("map is null");
				return;
			}
		}
		var that = this;
		$.ajax({
			type : "post",
			url	 : this.server,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseSaveMap(xml);
				if(callback != null){
					callback(result);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	// <?xml version="1.0"?>
	// <SaveMap
	// 	service="ims"
	// 	version="1.0.0"
	// 	user="user1">
	// 	<Name>world</Name>
	// 	<Srid>4326</Srid>
	// 	<Extent xmin="-180" ymin="90" xmax="180" ymax="90"/>
	// 	<Viewer xmin="-180" ymin="90" xmax="180" ymax="90"/>
	// 	<Layers>
	// 		<Layer name="cities" id="2"/>
	// 		<Layer name="rivers" id="3"/>
	// 		<Layer name="country" id="4"/>
	// 	</Layers>
	// </SaveMap>

	buildSaveMapXML : function(map){
		if(map == null){
			return null;
		}
		// var xml = $.parseXML('<?xml version="1.0" encoding="UTF-8"?>'
		var xml = $.parseXML('<?xml version="1.0"?>'			
			+ '<SaveMap service="ims" version="1.0.0" user="user1"/>');

		var name = map.name;
		var nameXML = xml.createElement("Name");
		$(nameXML).text(name);
		$('SaveMap',xml).append(nameXML);

		var srid = map.srid;
		var sridXML = xml.createElement("Srid");
		$(sridXML).text(srid);
		$('SaveMap',xml).append(sridXML);

		var extent = map.extent;
		if(extent != null){
			var extentXML = xml.createElement("Extent");
			$(extentXML).attr("xmin",extent.xmin);
			$(extentXML).attr("ymin",extent.ymin);
			$(extentXML).attr("xmax",extent.xmax);
			$(extentXML).attr("ymax",extent.ymax);
			$('SaveMap',xml).append(extentXML);
		}

		var viewer = map.viewer;
		if(viewer != null){
			var viewerXML = xml.createElement("Viewer");
			$(viewerXML).attr("xmin",viewer.xmin);
			$(viewerXML).attr("ymin",viewer.ymin);
			$(viewerXML).attr("xmax",viewer.xmax);
			$(viewerXML).attr("ymax",viewer.ymax);
			$('SaveMap',xml).append(viewerXML);
		}
		

		var layersXML = xml.createElement("Layers");

		// base layer
		var baseLayer = map.baseLayer;
		if(baseLayer != null){
			var layerXML = xml.createElement("Layer");
			var name = baseLayer.name;
			if(name != null){
				$(layerXML).attr("name",name);
			}
			var id = baseLayer.id;
			if(id != null){
				$(layerXML).attr("id",id);
			}
			var visible = baseLayer.visible;
			if(visible){
				visible = 1; 
			}else{
				visible = 0;
			}
			$(layerXML).attr("visible",visible);
			$(layersXML).append(layerXML);
		}

		var layers = map.getLayers();
		var layer = null;
		for(var i = 0 ; i < layers.length; ++i){
			layer = layers[i];
			if(layer == null){
				continue;
			}
			if(layer instanceof GeoBeans.Layer.DBLayer){
				var layerXML = xml.createElement("Layer");
				var name = layer.name;
				if(name != null){
					$(layerXML).attr("name",name);
				}
				var id = layer.id;
				if(id != null){
					$(layerXML).attr("id",id);
				}
				var visible = layer.visible;
				if(visible){
					visible = 1; 
				}else{
					visible = 0;
				}
				$(layerXML).attr("visible",visible);
				$(layersXML).append(layerXML);
			}
		}
		$('SaveMap',xml).append(layersXML);

		if(xml != null){
			var xmlString = (new XMLSerializer()).serializeToString(xml);
			return xmlString;
		}
		return null;
	},

	parseSaveMap : function(xml){
		var result = $(xml).find("SaveMap")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ows\\:ExceptionText").text();
		return exception;
	},

	// 根据名称返回地图
	getMapByName : function(name){
		if(name == null){
			return null;
		}
		if(this.maps == null){
			return null;
		}
		var obj = null;
		var objName = null;
		for(var i = 0; i < this.maps.length; ++i){
			obj = this.maps[i];
			if(obj == null){
				continue;
			}
			objName = obj.name;
			if(objName == name){
				return obj;
			}
		}
		return null;	
	},

	// 根据前几个字符查询地图
	getMapByNameChar : function(name){
		if(name == null){
			return [];
		}
		if(this.maps == null){
			return [];
		}
		var obj = null;
		var objName = null;
		var maps = [];
		for(var i = 0; i < this.maps.length; ++i){
			obj = this.maps[i];
			if(obj == null){
				continue;
			}
			objName = obj.name;
			if(objName.indexOf(name) == 0){
				maps.push(obj); 
			}
		}
		return maps;
	},

	getMapObj : function(name,callback,callback_u){
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=describeMap&"
					+ "name=" + name;
		var that = this;
		that.getMapObj_u = callback_u;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var mapObj = that.parseMapObj(xml);
				if(callback != undefined){
					callback(mapObj,that.refreshMapObj,that.getMapObj_u);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error : function(){
			}
		});					
	},

	parseMapObj : function(xml){
		var exception = $(xml).find("ows\\:ExceptionText").text();
		if(exception != ""){
			console.log(exception);
			return null;
		}	
		var that = this;
		var name = $(xml).find("Name:first").text();
		var srid = $(xml).find("Srid:first").text();
		var envelopeXML = $(xml).find("BoundingBox:first");
		var extent = this.parseBoundingBox(envelopeXML);
		var viewerXML = $(xml).find("Viewer:first");
		var viewer = this.parseBoundingBox(viewerXML);
		var thumbnail = $(xml).find("Thumbnail").attr("xlink");

		var layers = [];	
		var baseLayer = null;
		var groupLayer = null;
		$(xml).find("Capability>Layer").each(function(){
			var layer = that.parseLayer(this);
			if(layer instanceof GeoBeans.Layer.GroupLayer){
				// map.groupLayer = layer;
				var dbLayers = layer.getLayers();
				for(var i = 0; i < dbLayers.length;++i){
					var dbLayer = dbLayers[i];
					layers.push(dbLayer);
				}
			}else if(layer instanceof GeoBeans.Layer.TileLayer){
				baseLayer = layer;
			}
		});

		return {
			name : name,
			srid : srid,
			extent : extent,
			viewer : viewer,
			groupLayer : groupLayer,
			layers 	: layers,
			baseLayer : baseLayer,
			thumbnail : thumbnail
		};
	},

	refreshMap : function(map,callback){
		if(map == null){
			if(callback != null){
				callback("map is null");
			}
			return;
		}

		this.refreshMapObj = map;

		var mapObj = this.getMapObj(map.name,this.refreshMap_callback,callback);
	},

	refreshMap_callback : function(mapObj,map,callback_u){
		// var map = this.refreshMapObj;
		if(mapObj == null){
			callback_u("refreshMap failed");
			return;
		}

		var layersObj = mapObj.layers;
		if(layersObj == null){
			callback_u("refreshMap failed");
			return;
		}
		var baseLayerObj = mapObj.baseLayer;
		var layers = map.getLayers();
		var layer = null;
		var layerObj = null;

		var groupLayer = new GeoBeans.Layer.GroupLayer(map.server,map.name);
		groupLayer.setMap(map);
		for(var i = 0; i < layersObj.length; ++i){
			layerObj = layersObj[i];
			for(var j = 0; j < layers.length; ++j){
				layer = layers[j];
				if(layer.name == layerObj.name){
					layer.styleName = layerObj.styleName;
					layer.extent = layerObj.extent;
					groupLayer.addLayer(layer);
					break;
				}
			}
			if(!groupLayer.hasLayer(layerObj.name)){
				layerObj.setMap(map);
				groupLayer.addLayer(layerObj);
			}
		}
		map.groupLayer = groupLayer;

		// var baseLayer = map.baseLayer;
		if(map.baseLayer != null){
			map.baseLayer.renderer.clearRect();
			map.baseLayerCanvas.remove();
			map.baseLayerCanvas = null;
			map.baseLayerSnap = null;
			map.baseLayer.destroy();
		}
		map.setBaseLayer(baseLayerObj);


		map.extent = mapObj.extent;
		if(callback_u != null){
			callback_u("success");
		}
	},


	zoomToGlobeMap : function(map,callback){
		if(map == null){
			if(callback != null){
				callback("map is null");
			}
			return;
		}
		if(map.baseLayer != null){
			map.zoomToBaseLayer();
			callback("success");
			return;
		}
		this.refreshMapObj = map;

		this.getMapObj(map.name,this.zoomToGlobeMap_callback,callback);
	},

	zoomToGlobeMap_callback :function(mapObj,map,callback_u){
		if(mapObj == null){
			callback_u("zoom to  map failed");
			return;
		}

		var layersObj = mapObj.layers;
		if(layersObj == null){
			callback_u("zoom to  map  failed");
			return;
		}
		var layers = map.getLayers();
		var layer = null;
		var layerObj = null;


		var groupLayer = new GeoBeans.Layer.GroupLayer(map.server,map.name);
		groupLayer.setMap(map);
		for(var i = 0; i < layersObj.length; ++i){
			layerObj = layersObj[i];
			for(var j = 0; j < layers.length; ++j){
				layer = layers[j];
				if(layer.name == layerObj.name){
					layer.styleName = layerObj.styleName;
					layer.extent = layerObj.extent;
					groupLayer.addLayer(layer);
					break;
				}
			}
			if(!groupLayer.hasLayer(layerObj.name)){
				layerObj.setMap(map);
				groupLayer.addLayer(layerObj);
			}
		}
		map.groupLayer = groupLayer;

		map.extent = mapObj.extent;		
		map.setViewer(map.extent);
		map.draw();

		callback_u("success");
	}
});