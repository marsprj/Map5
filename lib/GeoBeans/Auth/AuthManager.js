GeoBeans.AuthManager = GeoBeans.Class({
	server : null,
	service : "was",
	version : "1.0.0",


	initialize : function(server){
		this.server = server;
	},


	createUser : function(name,alias,password,email,role,callback){
		if(name == null || alias == null || password == null || email == null
			|| role == null){
			if(callback == null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=createUser&name=" + name
				+ "&alias=" + alias + "&password="
				+ password + "&email=" + email
				+ "&role=" + role;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseCreateUser(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});

	},

	parseCreateUser : function(xml){
		var result = $(xml).find("CreateUser").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;		
	},

	// 登录
	login : function(name,password,callback){
		if(name == null || password == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=login&name=" + name
				+ "&password="+ password;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseLogin(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseLogin : function(xml){
		var result = $(xml).find("Login").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;			
	},

	// 注销，退出
	logout : function(name,callback){
		if(name == null){
			if(callback != null){
				callback("name is null");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=logout&name=" + name;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseLogout(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},


	parseLogout : function(xml){
		var result = $(xml).find("Logout").text();
		if(result.toLowerCase() == "success"){
			return "success";
		}
		var exception = $(xml).find("ExceptionText").text();
		return exception;				
	},

	// 获得用户信息
	getUser : function(name,callback){
		if(name == null){
			if(callback != null){
				callback("name is null");
			}
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetUser&name=" + name;

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseGetUser(xml);
				if(callback != null){
					callback(result);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseGetUser : function(xml){
		var exception = $(xml).find("ExceptionText").text();
		if(exception != ""){
			return exception;
		}
		var userObj = null;
		$(xml).find("User").each(function(){
			var name = $(this).find("Name").text();
			var alias = $(this).find("Alias").text();
			var email = $(this).find("Email").text();
			var role = $(this).find("Role").text();
			if(name != null){
				userObj = {
					name : name,
					alias : alias,
					email : email,
					role : role
				};
			}
		});
		return userObj;
	},

});