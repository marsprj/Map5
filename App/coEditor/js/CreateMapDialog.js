CoEditor.CreateMapDialog = CoEditor.Class({
	_panel : null,


	initialize : function(id){
		this._panel = $("#" + id);
		this.registerPanelEvent();
	}
});

CoEditor.CreateMapDialog.prototype.registerPanelEvent = function(){
	

	var that = this;
	// 确定
	this._panel.find(".btn-confirm").click(function(){
		var mapName = that._panel.find("#task_name").val();
		if(mapName == null || mapName == ""){
			CoEditor.notify.showInfo("提示","请输入地图名称");
			return;
		}
		that.createMap(mapName);
	});

	// 切换底图
	this._panel.find(".thumbnail").click(function(){
		that._panel.find(".thumbnail").removeClass("selected");
		$(this).addClass("selected");
	});
}

// 显示
CoEditor.CreateMapDialog.prototype.show = function(){
	this.cleanup();
	this._panel.modal();
	var that = this;
	this._panel.on("shown.bs.modal",function(){
		that._panel.find("#task_name").focus();
	});
}

// 隐藏
CoEditor.CreateMapDialog.prototype.hide =function(){
	this._panel.modal("hide");
}


CoEditor.CreateMapDialog.prototype.cleanup = function(){
	this._panel.find("#task_name").val("");
	this._panel.find("#task_description").val("");
}

// 创建地图
CoEditor.CreateMapDialog.prototype.createMap = function(mapName){
	if(mapName == null){
		return;
	}

	var mapManager = user.getMapManager();
	var srid = 4326;
	var extent = new GeoBeans.Envelope(-180,-90,180,90);
	CoEditor.notify.loading();
	mapManager.createMap(mapName,extent,srid,this.createMap_callback);
	
};

CoEditor.CreateMapDialog.prototype.createMap_callback = function(result){
	if(result != "success"){
		return;
	}
	var that = CoEditor.create_map_dialog;
	that.createTask();
}

CoEditor.CreateMapDialog.prototype.createTask = function(){
	var taskName = this._panel.find("#task_name").val();
	var description = this._panel.find("#task_description").val();
	taskManager.createTask(user.name,taskName,taskName,description,this.createTask_callback);
}

CoEditor.CreateMapDialog.prototype.initNewMap = function(){
	this.hide();
	var that = CoEditor.mapPanel;
	that.showMapPanel();
	that.setOwner(user.name);

	var name = this._panel.find("#task_name").val();

	var bname = this._panel.find(".thumbnail.selected").attr("bname");
	var imageSetName = "world_vector";
	if(bname == "vector"){
		imageSetName = "world_vector";
	}else if(bname == "image"){
		imageSetName = "world_image";
	}

	var baseLayer = new GeoBeans.Layer.TileLayer({
			"name" : "base",
			"source" : new GeoBeans.Source.Tile.QuadServer({
	 			"url" : "/QuadServer/maprequest",
	 			"imageSet" : imageSetName
	 		}),
	 		"opacity" : 1.0,
	 		"visible" : true
		});
	if(mapObj != null){
		mapObj.close();
	}
	mapObj = new GeoBeans.Map({
		target : "map_div",
		name : name,
		srs  : GeoBeans.Proj.WGS84,
		baselayer : "base",
		layers : [
			baseLayer
		],
		viewer : {
            center : new GeoBeans.Geometry.Point(0,0),
            zoom : 3,
        }
	});

	that.setBaseLayerDivChoose(imageSetName);


	$("#layers_tab .list-type-div").empty();
}


CoEditor.CreateMapDialog.prototype.createTask_callback = function(result){
	// console.log(result);
	CoEditor.notify.showInfo("新建任务",result.toString());
	var that = CoEditor.create_map_dialog;
	that.initNewMap();
}