CoEditor.RegisterDialog = CoEditor.Class({
	_panel : null,


	initialize : function(id){
		this._panel = $("#" + id);
		this.registerPanelEvent();
	}	
});

CoEditor.RegisterDialog.prototype.show = function(){
	this.cleanup();
	this._panel.modal();
	var that = this;
	that._panel.on('shown.bs.modal',function(){
		that._panel.find("input[name='username']").focus();
	});
};

CoEditor.RegisterDialog.prototype.hide = function(){
	this._panel.modal("hide");
}

CoEditor.RegisterDialog.prototype.cleanup  = function(){
	this._panel.find("input").val("");
	this._panel.find("input").next().removeClass("active");
}

CoEditor.RegisterDialog.prototype.registerPanelEvent = function(){
	var that = this;

	this._panel.find(".register-btn").click(function(){
		that.register();
	});

	this._panel.find("input[name='repassword']").keypress(function(e){
		if(e.which == 13){
			that.register();
		}
	});
}

// 注册
CoEditor.RegisterDialog.prototype.register = function(){
	var name = this._panel.find("input[name='username']").val();
	if(name == ""){
		this._panel.find("input[name='username']").next().addClass("active");
		this._panel.find("input[name='username']").focus();
		return;
	}
	this._panel.find("input[name='username']").next().removeClass("active");

	var password = this._panel.find("input[name='password']").val();
	if(password == ""){
		this._panel.find("input[name='password']").next().addClass("active");
		this._panel.find("input[name='password']").focus();
		return;
	}
	this._panel.find("input[name='password']").next().removeClass("active");

	var repassword = this._panel.find("input[name='repassword']").val();
	if(repassword == "" || repassword != password){
		this._panel.find("input[name='repassword']").next().html("请重新输入密码").addClass("active");
		this._panel.find("input[name='repassword']").focus();
		return;
	}
	CoEditor.notify.loading();
	this._panel.find("input").next().removeClass("active");
	authManager.createUser(name,name,password,null,"bh",this.register_callbacks);	
}


// 注册回调
CoEditor.RegisterDialog.prototype.register_callbacks = function(result){
	CoEditor.notify.hideLoading();
	var that = CoEditor.register_dialog;
	if(result == "success"){
		var name = that._panel.find("input[name='username']").val();
		var loginDialog = CoEditor.login_dialog;
		that.hide();
		loginDialog.loginUser(name);
		that.registerDBSource();
	}else{
		that._panel.find("input[name='repassword']").next().html(result).addClass("active");
		that._panel.find("input[name='repassword']").focus();
	}
}

// 注册数据源
CoEditor.RegisterDialog.prototype.registerDBSource = function(){
	var dbsManager = user.getDBSManager();
	var name = "bhdb";
	var engine = "Postgres";
	var constr = "server=192.168.111.155;instance=5432;database=bhdb;user=postgres;password=qwer1234;encoding=GBK"
	var type = "feature";
	dbsManager.registerDataSource(name,engine,constr,type,this.registerDBSource_callback);
}

CoEditor.RegisterDialog.prototype.registerDBSource_callback = function(result){
	console.log(result);
}