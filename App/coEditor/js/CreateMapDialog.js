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
		var mapName = that._panel.find("#new_map_name").val();
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
	this._panel.find("#new_map_name").focus();
	this._panel.modal();
}

// 隐藏
CoEditor.CreateMapDialog.prototype.hide =function(){
	this._panel.modal("hide");
}


CoEditor.CreateMapDialog.prototype.cleanup = function(){
	this._panel.find("#new_map_name").val("");
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
	CoEditor.notify.showInfo("新建地图",result.toString());
	if(result != "success"){
		return;
	}
	var that = CoEditor.create_map_dialog;
	that.initNewMap();
}

CoEditor.CreateMapDialog.prototype.initNewMap = function(){
	var that = CoEditor.mapPanel;
	that.showMapPanel();

	this.hide();

	var name = this._panel.find("#new_map_name").val();

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

	
}