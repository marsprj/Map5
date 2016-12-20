CoEditor.CreateDataSetDialog = CoEditor.Class({
	
	_panel : null,

	_db : "bhdb",


	initialize : function(id){
		this._panel = $("#"+ id);
		this.registerPanelEvent();
	}
});

// 显示
CoEditor.CreateDataSetDialog.prototype.show = function(){
	this.cleanup();
	this._panel.modal();
}

// 隐藏
CoEditor.CreateDataSetDialog.prototype.hide =function(){
	this._panel.modal("hide");
}

CoEditor.CreateDataSetDialog.prototype.cleanup = function(){
	this._panel.find(".form-field").remove();
	this._panel.find("#dataset_name").val("");

}

CoEditor.CreateDataSetDialog.prototype.registerPanelEvent = function(){
	var that = this;
	// 新建字段
	that._panel.find(".create-field-btn").click(function(){
		that.createFieldDiv();
	});

	// 确定
	that._panel.find(".create-dataset-btn").click(function(){
		that.createDataSet();
	});	
};

// 新建字段div
CoEditor.CreateDataSetDialog.prototype.createFieldDiv = function(){
	var formDiv = this._panel.find("#dataset_fields_form");
	var html = '<div class="form-group form-group-sm form-field">'
			+'		<div class="col-md-4 col-xs-4">'
			+'			<input class="form-control field-name" type="text">'
			+'		</div>'
			+'		<div class="col-md-4 col-xs-4">'
			+'			<select class="form-control field-type">'
			+'				<option>int</option>'
			+'				<option>string</option>'
			+'				<option>double</option>'
			+'			</select>'
			+'		</div>'
			+'		<div class="col-md-2 col-xs-2">'
			+'			<input class="form-control field-length" value="32" type="text" disabled>'
			+'		</div>'
			+'		<div class="col-md-2 col-xs-2">'
			+'			<button class="btn btn-link btn-remove-field">删除</button>'
			+'		</div>'
			+'	</div>';
	formDiv.append(html);
	
	var formFieldDiv = formDiv.find(".form-field:last");
	formDiv.find(".field-type").change(function(){
		var value = $(this).val();
		if(value == "string"){
			$(this).parents(".form-field").find(".field-length").removeAttr("disabled");
		}else{
			$(this).parents(".form-field").find(".field-length").prop("disabled","true");
		}
	});

	formDiv.find(".btn-remove-field").click(function(){
		$(this).parents(".form-field").remove();
	});
}

// 新建dataset
CoEditor.CreateDataSetDialog.prototype.createDataSet = function(){
	var dataSetName = this._panel.find("#dataset_name").val();
	if(dataSetName == null || dataSetName == ""){
		CoEditor.notify.showInfo("提示","请输入图层名称");
		this._panel.find("#dataset_name").focus();
		return;
	}

	var nameReg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
	if(!nameReg.test(dataSetName)){
		CoEditor.notify.showInfo("提示","请输入有效的图层名称");
		this._panel.find("#dataset_name").focus();
		return;
	}

	
	var fields = this.getFields();

	var dbsManager = user.getDBSManager();
	CoEditor.notify.loading();
	dbsManager.createDataSet(this._db,dataSetName,fields,this.createDataset_callback)
}

// 获取字段
CoEditor.CreateDataSetDialog.prototype.getFields = function(){
	var fields = [];
	this._panel.find(".form-field").each(function(){
		var name = $(this).find(".field-name").val();
		if(name == null || name == ""){
			return;
		}
		var length = null;
		var type = $(this).find(".field-type").val();
		if(type == "string"){
			length = $(this).find(".field-length").val();
		}
		
		var field = new GeoBeans.GField(name,type,length);
		fields.push(field);		
	});

	var geomType = this._panel.find("#dataset_type").val();

	var geometryDef = {
		type : geomType,
		srid : "4326",
		extent : new GeoBeans.Envelope(-180,-90,180,90)
	};
	var geometryField = new GeoBeans.GField("shape","geometry",null,geometryDef);
	fields.push(geometryField);

	var usernameField = new GeoBeans.GField("username","string",32);
	fields.push(usernameField);

	var updatetimeField = new GeoBeans.GField("updatetime","timestamp",null);
	fields.push(updatetimeField);
	return fields;
}

CoEditor.CreateDataSetDialog.prototype.createDataset_callback = function(result){
	if(result != "success"){
		CoEditor.notify.showInfo("创建表格",result);
		return;
	}

	var that = CoEditor.create_dataset_dlg;
	that.registerLayer();
	
}

// 注册图层
CoEditor.CreateDataSetDialog.prototype.registerLayer = function(){
	var mapWorkspace = new GeoBeans.MapWorkspace(user.getServer(),mapObj);
	var name = this._panel.find("#dataset_name").val();
	var layer = new GeoBeans.Layer.FeatureDBLayer(name,null,this._db,name);

	mapWorkspace.registerLayer(layer,this.registerLayer_callback);
}


// 注册图层回调
CoEditor.CreateDataSetDialog.prototype.registerLayer_callback = function(result){

	if(result instanceof GeoBeans.Layer.FeatureDBLayer){
		CoEditor.notify.showInfo("新建图层","success");
		var mapManager = user.getMapManager();
		var that = CoEditor.mapsPanel;
		mapManager.getMapObj(mapObj.name,that.initMap_callback);
		CoEditor.create_dataset_dlg.hide();
	}else{
		CoEditor.notify.showInfo("新建图层",result.toString());
	}
}