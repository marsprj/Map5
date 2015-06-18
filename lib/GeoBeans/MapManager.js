GeoBeans.MapManager = GeoBeans.Class({
	service : "ims",
	version : "1.0.0",
	server : null,
	maps : null,

	getMap_u_id : null,
	getMap_u_map : null,

	createMap_u_id : null,
	createMap_u_name : null,
	createMap_u_extent : null,
	createMap_u_srid : null,

	removeMap_u_callback : null,

	initialize : function(server){
		this.server = server;
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
				// if(callback != undefined){
				// 	callback(map);
				// }
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error : function(){
			}
		});
		return that.getMap_u_map;
	},

	// 创建地图
	createMap : function(id,name,extent,srid,callback){
		if(name == null || extent == null 
			|| srid == null){
			return;
		}
		this.createMap_u_id = id;
		this.createMap_u_name = name;
		this.createMap_u_extent = extent;
		this.createMap_u_srid = srid;
		this.createMap_u_callback = callback;
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
				that.createMap_callback(result);
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
				// that.removeMap_callback(result);
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
			if(thumbnail.length - thumbnail.lastIndexOf("png").length){
				
			}

			map.name = name;
			map.srid = srid;
			map.extent = extent;
			maps.push(map);
		});
		return maps;
	},

	parseMap : function(xml){
		var that = this;
		var name = $(xml).find("Name:first").text();
		var srid = $(xml).find("Srid:first").text();
		var envelopeXML = $(xml).find("BoundingBox:first");
		var extent = that.parseBoundingBox(envelopeXML);

		// var srid = "4326";
		// var extent = new GeoBeans.Envelope(-180,-90,180,90);
		var map = new GeoBeans.Map(that.server,
					that.getMap_u_id,
					name,
					extent,
					srid);
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
			}else{
				map.addLayer(layer);
			}
		});
		return map;
		// var layerXML = $(xml).find("Layer:first");
		// var layer = that.parseLayers(layersXML);
	},

	parseBoundingBox : function(xml){
		if(xml == null){
			return null;
		}
		var xmin = parseFloat($(xml).attr("minx"));
		var ymin = parseFloat($(xml).attr("miny"));
		var xmax = parseFloat($(xml).attr("maxx"));
		var ymax = parseFloat($(xml).attr("maxy"));

		return (new GeoBeans.Envelope(xmin, ymin, xmax, ymax));
	},

	parseLayer : function(xml){
		if(xml == null){
			return null;
		}
		var layer = null;
		
		var type = $(xml).find("Type").text();
		if(type == "Group"){
			layer = this.parseGroupLayer(xml);
		}else{

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
		// groupLayer.name = name;
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
		
		var name = $(xml).find("Name:first").text();
		var queryable = parseInt($(xml).attr("queryable"));
		var geomType = $(xml).find("GeometryType").text();

		var extentXML = $(xml).find("BoundingBox:first");
		var extent = this.parseBoundingBox(extentXML);
		var styleName = $(xml).find("Style>Name").text();

		var dbLayer = new GeoBeans.Layer.DBLayer(name);
		// dbLayer.name = name;
		dbLayer.queryable = queryable;
		dbLayer.extent = extent;
		dbLayer.styleName = styleName;
		// dbLayer.geomType = geomType;
		var type = null;
		switch(geomType.toUpperCase()){
			case "POINT":{
				type = GeoBeans.Geometry.Type.POINT;
				break;
			}
			case "LINESTRING":{
				type = GeoBeans.Geometry.Type.LINESTRING;
				break;
			}
			case "POLYGON":{
				type = GeoBeans.Geometry.Type.POLYGON;
				break;
			}
			case "MULTIPOINT":{
				type = GeoBeans.Geometry.Type.MULTIPOINT;
				break;
			}
			case "MULTILINESTRING":{
				type = GeoBeans.Geometry.Type.MULTILINESTRING;
				break;
			}
			case "MULTIPOLYGON":{
				type = GeoBeans.Geometry.Type.MULTIPOLYGON;
				break;
			}
			default:
				break;
		}

		dbLayer.geomType = type;
		return dbLayer;
	},

	parseCreateMap : function(xml){
		var result = $(xml).find("CreateMap")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	createMap_callback : function(result){
		if(this.createMap_u_callback == null){
			return;
		}
		if(result != "success"){
			this.createMap_u_callback(null,result);
			return;
		}
		var map = new GeoBeans.Map(this.server,
					this.createMap_u_id,
					this.createMap_u_name,
					this.createMap_u_extent,
					this.createMap_u_srid);
		this.createMap_u_callback(map,result);
	},

	parseRemoveMap : function(xml){
		var result = $(xml).find("RemoveMap")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	removeMap_callback : function(result){
		if(this.removeMap_u_callback != null){
			this.removeMap_u_callback(result);
		}
	}

});