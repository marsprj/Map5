GeoBeans.MapWorkspace = GeoBeans.Class({
	server : null,
	service : "ims",
	version : "1.0.0",
	mapName : null,
	map : null,
	registerLayer_layer : null,
	registerLayer_callback_m : null,
	registerLayer_callback_u : null,

	setStyle_typeName : null,
	setStyle_style : null,
	setStyle_callback_m : null,
	setStyle_callback_u : null,

	initialize : function(server,map){
		this.server = server;
		this.map = map;
	},

	registerLayer : function(layer,callback,callback_u){
		if(layer == null){
			if(callback != null){
				callback("layer in null");
			}
			return;
		}
		var type = layer.type;
		// 暂时定为类内的
		this.type = type;
		if(type == GeoBeans.Layer.DBLayer.Type.Feature){
			this.registerFeatureDBLayer(layer,callback,callback_u);
		}else if(type == GeoBeans.Layer.DBLayer.Type.Raster){
			this.registerRasterDBLayer(layer,callback,callback_u);
		}
	},

	registerFeatureDBLayer : function(layer,callback,callback_u){
		if(layer == null){
			return;
		}
		var name = layer.name;
		var dbName = layer.dbName;
		var typeName = layer.typeName;
		if(name == null || dbName == null
			|| typeName == null ){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		this.registerLayer_layer = layer;
		this.registerLayer_callback_m = callback;
		this.registerLayer_callback_u = callback_u;
		var that = this;
		var mapName = this.map.name;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RegisterLayer"
					+ "&mapName=" + mapName 
					+ "&datasource=" + dbName
					+ "&layerName=" + name
					+ "&tableName=" + typeName
					+ "&layertype=Feature";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRegisterLayer(xml);
				// that.registerLayer_callback(result);
				if(that.registerLayer_callback_m != null){
					that.registerLayer_callback_m(result,
						that.map,
						that.registerLayer_layer,
						that.registerLayer_callback_u);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});

	},

	registerRasterDBLayer : function(layer,callback,callback_u){
		if(layer == null){
			if(callback != null){
				callback("layer in null");
			}
			return;
		}
		var name = layer.name;
		var rasterName = layer.typeName;
		var rasterPath = layer.rasterPath;
		var dbName = layer.dbName;
		if(name == null || rasterName == null || rasterPath == null || dbName == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		this.registerLayer_layer = layer;
		this.registerLayer_callback_m = callback;
		this.registerLayer_callback_u = callback_u;

		var mapName = this.map.name;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=RegisterLayer"
					+ "&mapName=" + mapName 
					+ "&datasource=" + dbName
					+ "&rasterName=" + rasterName
					+ "&rasterPath=" + rasterPath
					+ "&layerName=" + name
					+ "&layerType=Raster";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRegisterLayer(xml);
				// that.registerLayer_callback(result);
				if(that.registerLayer_callback_m != null){
					that.registerLayer_callback_m(result,
						that.map,
						that.registerLayer_layer,
						that.registerLayer_callback_u);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	unRegisterLayer : function(name,callback,callback_u){
		if(name == null ){
			return;
		}
		this.unRegisterLayer_name = name;
		this.unRegisterLayer_callback_m = callback;
		this.unRegisterLayer_callback_u = callback_u;
		
		var that = this;
		var mapName = this.map.name;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=UnRegisterLayer"
					+ "&mapName=" + mapName
					+ "&layerName=" + name
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseUnRegisterLayer(xml);
				if(that.unRegisterLayer_callback_m != null){
					that.unRegisterLayer_callback_m(result,
						that.map,
						that.unRegisterLayer_name,
						that.unRegisterLayer_callback_u);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	// parseRegisterLayer : function(xml){
	// 	var result = $(xml).find("RegisterLayer")
	// 				.text();
	// 	if(result.toLowerCase() == "success"){
	// 		return "success";
	// 	}
	// 	var exception = $(xml).find("ExceptionText").text();
	// 	return exception;
	// },
	// 修改之后为返回图层的信息
	parseRegisterLayer : function(xml){
		var exception = $(xml).find("ExceptionText").text();
		if(exception != null && exception != ""){
			return exception;
		}


		var dbLayer = null;
		var id = $(xml).find("ID").text();;
		var name = $(xml).find("Name:first").text();
		var queryable = null;
		var type = $(xml).find("Type").first().text();
		var type = this.type;
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
			dbLayer = new GeoBeans.Layer.RasterDBLayer(name,parseInt(id),null,null,queryable,null);
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
			dbLayer = new GeoBeans.Layer.FeatureDBLayer(name,parseInt(id),null,null,queryable,styleName);
			dbLayer.extent = extent;
			dbLayer.geomType = geomFeatureType;
		}

		// dbLayer = new GeoBeans.Layer.DBLayer(name,parseInt(id),null,null,null);

		return dbLayer;
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

	parseUnRegisterLayer : function(xml){
		var result = $(xml).find("UnRegisterLayer")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	},

	setStyle : function(typeName,style,callback,callback_u){
		if(typeName == null || style == null){
			return;
		}
		this.setStyle_typeName = typeName;
		this.setStyle_style = style;
		this.setStyle_callback_m = callback;
		this.setStyle_callback_u = callback_u;

		var styleName = style.name;
		var that = this;
		var mapName = this.map.name;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=SetStyle"
					+ "&map=" + mapName
					+ "&layer=" + typeName
					+ "&style=" + styleName;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseSetStyle(xml);
				if(that.setStyle_callback_m != null){
					that.setStyle_callback_m(result,
						that.map,
						that.setStyle_typeName,
						that.setStyle_style,
						that.setStyle_callback_u);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	parseSetStyle : function(xml){
		var result = $(xml).find("SetStyle")
					.text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;
	}

});