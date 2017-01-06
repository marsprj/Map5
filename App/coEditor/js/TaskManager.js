CoEditor.TaskManager = CoEditor.Class({
	
	service : "csm",
	version : "1.0.0",	

	initialize : function(){

	}
});

// 创建任务
CoEditor.TaskManager.prototype.createTask = function(userName,taskName,mapName,description,callback){
	if(userName == null || taskName == null || mapName == null){
		if(callback != null){
			callback("params is invalid");
		}
		return;
	}

	var server = "/ows/" + userName + "/mgr?";

	var params = "service=" + this.service + "&version=" + this.version + "&request=CreateTask"
		+ "&name=" + taskName + "&mapName=" + mapName + "&description=" + description;


	var that = this;
	$.ajax({
		type 	: "get",
		url 	: server,
		data 	: encodeURI(params),
		dataType:"xml",
		async : true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseCreateTask(xml);
			if(callback != null){
				callback(result);
			}
		},			 
		complete: function(XMLHttpRequest, textStatus){
		},
		error	: function(){
		}
	});
}

CoEditor.TaskManager.prototype.parseCreateTask = function(xml){
	var result = $(xml).find("CreateTask").text();
	if(result.toLowerCase() == "success"){
		return "success";
	}
	var exception = $(xml).find("ExceptionText").text();
	return exception;	
}

// 描述任务
CoEditor.TaskManager.prototype.describeTask = function(userName,role,callback){
	var server = null;
	if(userName != null){
		server = "/ows/" + userName + "/mgr?";
	}else{
		server = "/ows/public/mgr?";
	}

	var params = "service=" + this.service + "&version=" + this.version + "&request=DescribeTask";
	if(role != null){
		params += "&role=" + role;
	}

	var that = this;
	$.ajax({
		type 	: "get",
		url 	: server,
		data 	: encodeURI(params),
		dataType:"xml",
		async : true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseDescribeTask(xml);
			if(callback != null){
				callback(result);
			}
		},			 
		complete: function(XMLHttpRequest, textStatus){
		},
		error	: function(){
		}
	});	

}


CoEditor.TaskManager.prototype.parseDescribeTask = function(xml){
	var tasks = [];
	var that = this;
	$(xml).find("Tasks>Task").each(function(){
		var task = that.parseTask(this);
		tasks.push(task);
	});

	return tasks;
}

CoEditor.TaskManager.prototype.parseTask = function(xml){
	var task = new Object();
	var name = $(xml).find("Name:first").text();
	var description = $(xml).find("Description").text();
	var owner = $(xml).find("Owner").text();
	var mapXML = $(xml).find("Map");
	var mapObj = this.parseMapObj(mapXML);
	return {
		name : name,
		description : description,
		owner : owner,
		map : mapObj
	};
}
CoEditor.TaskManager.prototype.parseMapObj = function(xml){
	var exception = $(xml).find("ExceptionText").text();
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
}

CoEditor.TaskManager.prototype.parseBoundingBox = function(xml){
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
}

CoEditor.TaskManager.prototype.parseLayer = function(xml){
	if(xml == null){
		return null;
	}
	var layer = null;
	
	var type = $(xml).find("Type").first().text();
	if(type == "Group"){
		layer = this.parseGroupLayer(xml);
	}
	return layer;
}

CoEditor.TaskManager.prototype.parseGroupLayer = function(xml){
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
}

CoEditor.TaskManager.prototype.parseDBLayer = function(xml){
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
}

// 加入任务
CoEditor.TaskManager.prototype.joinTask = function(userName,taskID,callback){
	if(userName == null || taskID == null){
		if(callback != null){
			callback("params is invalid");
		}
		return;
	}
	var server = "/ows/" + userName + "/mgr?";
	var params = "service=" + this.service + "&version=" + this.version + "&request=JoinTask"
		+ "&taskID=" + taskID;
	var that = this;

	$.ajax({
		type 	: "get",
		url 	: server,
		data 	: encodeURI(params),
		dataType:"xml",
		async : true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseJoinTask(xml);
			if(callback != null){
				callback(result);
			}
		},			 
		complete: function(XMLHttpRequest, textStatus){
		},
		error	: function(){
		}
	});
}

CoEditor.TaskManager.prototype.parseJoinTask = function(xml){
	var result = $(xml).find("JoinTask").text();
	if(result.toLowerCase() == "success"){
		return "success";
	}
	var exception = $(xml).find("ExceptionText").text();
	return exception;		
}

// 按照名称描述任务
CoEditor.TaskManager.prototype.getTaskInfo = function(userName,taskName,callback){
	if(userName == null || taskName == null){
		if(callback != null){
			callback("params is invalid");
		}
		return;
	}

	var server = "/ows/" + userName + "/mgr?";

	var params = "service=" + this.service + "&version=" + this.version + "&request=DescribeTask"
		+ "&name=" + taskName;

	var that = this;
	$.ajax({
		type 	: "get",
		url 	: server,
		data 	: encodeURI(params),
		dataType:"xml",
		async : true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseGetTaskInfo(xml);
			if(callback != null){
				callback(result);
			}
		},			 
		complete: function(XMLHttpRequest, textStatus){
		},
		error	: function(){
		}
	});	
}

CoEditor.TaskManager.prototype.parseGetTaskInfo = function(xml){
	var task = this.parseTask(xml);
	return task;
}
