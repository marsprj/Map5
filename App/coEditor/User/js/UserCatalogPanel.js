CoEditor.UserCatalogPanel = CoEditor.Class({
	_panel : null,

	initialize : function(id){
		this._panel = $("#" + id);
		this.registerPanelEvent();
	}
});

CoEditor.UserCatalogPanel.prototype.registerPanelEvent = function(){
	var that = this;

	this._panel.find(".catalog-item").click(function(){
		if($(this).hasClass("active")){
			return;
		}

		// that._panel.find(".catalog-item").removeClass("active");
		// $(this).addClass("active");

		var iname = $(this).attr("iname");
		if(iname == "用户管理"){
			// $(".content-tab-panel").removeClass("active");
			// $("#user_content_panel").addClass("active");
			that.setUserTabShow();
		}else if(iname == "任务管理"){
			// $(".content-tab-panel").removeClass("active");
			// $("#task_content_panel").addClass("active");
			that.setTaskTabShow();
		}
	});
}


// 设置用户管理
CoEditor.UserCatalogPanel.prototype.setUserTabShow = function(){
	this._panel.find(".catalog-item").removeClass("active");
	this._panel.find(".catalog-item[iname='用户管理']").addClass("active");
	$(".content-tab-panel").removeClass("active");
	$("#user_content_panel").addClass("active");
	CoEditor.userInfoPanel.initUserInfo();
}

// 设置任务管理
CoEditor.UserCatalogPanel.prototype.setTaskTabShow = function(){
	this._panel.find(".catalog-item").removeClass("active");
	this._panel.find(".catalog-item[iname='任务管理']").addClass("active");
	$(".content-tab-panel").removeClass("active");
	$("#task_content_panel").addClass("active");
	CoEditor.userTaskPanel.initUserTask();
}