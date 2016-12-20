CoEditor.Notify = CoEditor.Class({

	_loadingPanel : null,

	_panel :  null,

	_container : null,
	
	initialize : function(id,loadingID){
		this._loadingPanel = $("#" + loadingID);
		this._panel = $("#" + id);

		this._container = this._panel.notify();	
	}
});

// 显示加载框
CoEditor.Notify.prototype.loading = function(){
	this._loadingPanel.show();
};

// 隐藏加载框
CoEditor.Notify.prototype.hideLoading = function(){
	this._loadingPanel.hide();
}

// 显示提示信息
CoEditor.Notify.prototype.showInfo = function(info,result){
	this.hideLoading();
	var params = {
		title : info,
		text : result
	};
	if(result == null){
		result = "";
	}
	if(result.toLowerCase() == "success"){
		this._container.notify("create","default",params,{expires:3000});
	}else{
		this._container.notify("create","default",params,{expires:5000});
	}	
}