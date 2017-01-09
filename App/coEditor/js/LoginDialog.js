CoEditor.LoginDialog = CoEditor.Class({
	_panel : null,


	initialize : function(id){
		this._panel = $("#" + id);
		this.registerPanelEvent();
	}
});


// 显示
CoEditor.LoginDialog.prototype.show = function(){
	this.cleanup();
	this._panel.modal();
}

// 隐藏
CoEditor.LoginDialog.prototype.hide =function(){
	this._panel.modal("hide");
}

CoEditor.LoginDialog.prototype.cleanup = function(){
	this._panel.find("input[name='username'],input[name='password']").val("");
}
CoEditor.LoginDialog.prototype.registerPanelEvent = function(){
	var that = this;

	this._panel.find(".login-btn").click(function(){
		that.login();
	});

	// enter　登录
	this._panel.find("input[name='password']").keypress(function(e){
		if(e.which == 13){
			that.login();
		}
	});
}

// 登录
CoEditor.LoginDialog.prototype.login = function(){
	var name = this._panel.find("input[name='username']").val();
	if(name == ""){
		this._panel.find("input[name='username']").next().addClass("active");
		this._panel.find("input[name='username']").focus();
		return;
	}

	var password = this._panel.find("input[name='password']").val();
	if(password == ""){
		this._panel.find("input[name='password']").next().html("请输入密码").addClass("active");
		this._panel.find("input[name='password']").focus();
		return;
	}

	CoEditor.notify.loading();
	this._panel.find("input[name='username'],input[name='password']").next().removeClass("active");
	authManager.login(name,password,this.login_callback);
}

// 登录回调
CoEditor.LoginDialog.prototype.login_callback = function(result){
	console.log(result);
	CoEditor.notify.hideLoading();
	var that = CoEditor.login_dialog;
	if(result == "success"){
		var username = that._panel.find("input[name='username']").val();
		that.loginUser(username);
	}else{
		that._panel.find("input[name='password']").next().html("密码错误").addClass("active");
		that._panel.find("input[name='password']").focus();
	}
}

// 初始化登录用户
CoEditor.LoginDialog.prototype.loginUser = function(username){
	if(username == null){
		return;
	}
	this.hide();
	user = new GeoBeans.User(username);
	$("#user_title").show();
	$("#user_login").hide();
	$("#user_title_name").html(username);
	$(".tab-panel").removeClass("active");
	$("#content_panel").addClass("active");
	$(".content-panel").removeClass("active");
	$("#maps_panel").addClass("active");

	CoEditor.cookie.setCookie("username",username,"/Map5/App/coEditor/");

	// 区分是展示所有任务，还是加入某个任务
	var taskObj = CoEditor.allMapsPanel.getJoinTaskObj();
	if(taskObj == null){
		CoEditor.mapsPanel.getMaps();
	}else{
		var taskID = taskObj.taskID;
		taskManager.joinTask(username,taskID,joinTask_callback);
	}
}