function addAccountEvent(){
	// 查看cookie
	initUserByCookie();

	// 退出
	$("#user_logout").click(function(){
		logout();
	});

	// 登录
	$("#user_login").click(function(){
		CoEditor.login_dialog.show();
	});

	// 注册
	$("#user_register").click(function(){
		CoEditor.register_dialog.show();
	})
}

// 查看cookie
function initUserByCookie(){
	var username = CoEditor.cookie.getCookie("username");
	if(username != null){
		CoEditor.login_dialog.loginUser(username);
	}else{
		CoEditor.allMapsPanel.show();
	}
}

// 退出
function logout(){
	if(!confirm("确定退出当前账户么?")){
		return;
	}
	CoEditor.notify.loading();
	authManager.logout(user.name,logout_callback);
}

function logout_callback(result){
	CoEditor.notify.showInfo("注销",result);
	if(result == "success"){
		user = null;
		CoEditor.allMapsPanel.show();
		CoEditor.cookie.delCookie("username","/Map5/App/coEditor/");
	}
}