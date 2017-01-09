function addAccountEvent(){
	// 查看cookie
	initUserByCookie();

	$("#user_login_panel input[name='username']").focus();

	$(".user-tab-panel input").on("input",function(e){
		var text = $(this).val();
		if(text.length > 0){
			$(this).next().removeClass("active");
		}
	});

	// 登录切换注册页面
	$("#user_login_panel .register-btn").click(function(){
		showRegisterPanel();
	});

	// 注册切换登录页面
	$("#user_register_panel .return-login").click(function(){
		showLoginPanel();
	});


	// 登录
	$("#user_login_panel .login-btn").click(function(){
		login();
	});

	// 注册
	$("#user_register_panel .register-btn").click(function(){
		register();
	});

	// 退出
	$("#user_logout").click(function(){
		logout();
	});

	// enter 登录
	$("#user_login_panel input[name='password']").keypress(function(e){
		if(e.which == 13){
			login();
		}
	});

	// enter 注册
	$("#user_register_panel input[name='repassword']").keypress(function(e){
		if(e.which == 13){
			register();
		}
	});
}

// 查看cookie
function initUserByCookie(){
	var username = CoEditor.cookie.getCookie("username");
	if(username != null){
		initUser(username);
	}else{
		$(".tab-panel").removeClass("active");
		$("#user_panel").addClass("active");
		showLoginPanel();
	}
}


// 显示注册页面
function showRegisterPanel(){
	$(".user-tab-panel").removeClass("active");	
	$("#user_register_panel").addClass("active");
	$("#user_register_panel input[name='username']").focus();
	$("#user_register_panel").css("transform","rotateY(0deg)");
	$("#user_login_panel").css("transform","rotateY(-180deg)");
}

// 显示登录页面
function showLoginPanel(){
	$(".user-tab-panel").removeClass("active");	
	$("#user_login_panel").addClass("active");
	$("#user_login_panel input[name='username']").focus();
	$("#user_register_panel").css("transform","rotateY(-180deg)");
	$("#user_login_panel").css("transform","rotateY(0deg)");
}

// 登录
function login(){
	var name = $("#user_login_panel input[name='username']").val();
	if(name == ""){
		$("#user_login_panel input[name='username']").next().addClass("active");
		$("#user_login_panel input[name='username']").focus();
		return;
	}

	var password = $("#user_login_panel input[name='password']").val();
	if(password == ""){
		$("#user_login_panel input[name='password']").next().html("请输入密码").addClass("active");
		$("#user_login_panel input[name='password']").focus();
		return;
	}

	CoEditor.notify.loading();
	authManager.login(name,password,login_callback);
}

function login_callback(result){
	CoEditor.notify.showInfo("用户登录",result);

	var name = $("#user_login_panel input[name='username']").val();
	if(result == "success"){
		initUser(name);
	}else{
		$("#user_login_panel input[name='password']").next().html(result).addClass("active");
		$("#user_login_panel input[name='password']").focus();
	}
}

// 注册
function register(){
	var name = $("#user_register_panel input[name='username']").val();
	if(name == ""){
		$("#user_register_panel input[name='username']").next().addClass("active");
	$("#user_register_panel input[name='username']").focus();
		return;
	}

	var password = $("#user_register_panel input[name='password']").val();
	if(password == ""){
		$("#user_register_panel input[name='password']").next().addClass("active");
		$("#user_register_panel input[name='password']").focus();
		return;
	}

	var repassword = $("#user_register_panel input[name='repassword']").val();
	if(repassword == "" || repassword != password){
		$("#user_register_panel input[name='repassword']").next().addClass("active");
		$("#user_register_panel input[name='repassword']").focus();
		return;
	}
	CoEditor.notify.loading();
	authManager.createUser(name,name,password,null,"bh",register_callbacks);
}

// 初始化用户
function initUser(username){
	if(username == "admin"){
		window.location.href = "./admin.html";
		return;
	}

	user = new GeoBeans.User(username);
	$(".tab-panel").removeClass("active");
	$("#info_panel").addClass("active");
	$("#user_title_name").html(username);
	$(".user-name-title").html("[" + username + "]");


	CoEditor.cookie.setCookie("username",username,"/Map5/App/coEditor/");

	CoEditor.userCatalogPanel.setUserTabShow();

}


// 退出
function logout(){
	if(!confirm("确定退出当前账户么?")){
		return;
	}
	authManager.logout(user.name,logout_callback);
}

function logout_callback(result){
	CoEditor.notify.showInfo("注销",result);
	if(result == "success"){
		user = null;
		$(".tab-panel").removeClass("active");
		$("#user_panel").addClass("active");
		showLoginPanel();
		$("#user_panel input[type='text'],#user_panel input[type='password']").val("");
		$("#user_login_panel input[name='username']").focus();

		CoEditor.cookie.delCookie("username","/Map5/App/coEditor/");		
	}
}

function register_callbacks(result){
	CoEditor.notify.showInfo("注册用户",result);
	var name = $("#user_register_panel input[name='username']").val();
	if(result == "success"){
		// 注册数据源
		initUser(name);
		registerDBSource();
	}else{
		$("#user_register_panel input[name='username']").next().html(result).addClass("active");
		$("#user_register_panel input[name='username']").focus();
	}
}

// 注册数据源
function registerDBSource(){
	var dbsManager = user.getDBSManager();
	var name = "bhdb";
	var engine = "Postgres";
	var constr = "server=192.168.111.160;instance=5432;database=bhdb;user=postgres;password=qwer1234;encoding=GBK"
	var type = "feature";
	dbsManager.registerDataSource(name,engine,constr,type,registerDBSource_callback);
}

// 注册数据源回调函数
function registerDBSource_callback(result){
	console.log(result);
}
