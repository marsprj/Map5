CoEditor.UserInfoPanel = CoEditor.Class({
	
	_panel : null,

	initialize : function(id){
		this._panel = $("#" + id);
		this.registerPanelEvent();
	}
});

CoEditor.UserInfoPanel.prototype.registerPanelEvent = function(){
	var that = this;
	
	this._panel.find('[data-toggle="tooltip"]').tooltip({
        container: "body"
    });

	// 密码面板
	that._panel.find(".info-edit").click(function(){
		that.showPasswordPanel();
	});

	// 修改密码
	this._panel.find(".btn-change-password").click(function(){
		that.changePassword();
	});

	// 返回
	this._panel.find(".btn-return").click(function(){
		that.showInfoPanel();
	});
}


// 初始化用户
CoEditor.UserInfoPanel.prototype.initUserInfo = function(){
	if(user == null){
		return;
	}

	this._panel.find(".user-name").html("");
	this._panel.find(".user-alias").html("");
	this._panel.find(".user-email").html("");
	this._panel.find(".user-role").html("");
	authManager.getUser(user.name, this.getUserInfo_callback)
}


CoEditor.UserInfoPanel.prototype.getUserInfo_callback = function(userObj){
	var that = CoEditor.userInfoPanel;
	that.showUserInfo(userObj)
}


// 展示信息
CoEditor.UserInfoPanel.prototype.showUserInfo = function(userObj){
	if(userObj == null){
		return;
	}
	var name = userObj.name;
	var alias = userObj.alias;
	var email = userObj.email;
	var role = userObj.role;

	this._panel.find(".user-name").html(name);
	this._panel.find(".user-alias").html(alias);
	this._panel.find(".user-email").html(email);
	this._panel.find(".user-role").html(role);
}

// 显示密码页面
CoEditor.UserInfoPanel.prototype.showPasswordPanel = function(){
	this._panel.find(".user-info").hide();
	this._panel.find(".user-password").show();
}

// 展示信息页面
CoEditor.UserInfoPanel.prototype.showInfoPanel = function(){
	this._panel.find(".user-password").hide();
	this._panel.find(".user-info").show();
}

// 修改密码
CoEditor.UserInfoPanel.prototype.changePassword = function(){
	var userName = user.name;
}