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


	// 获取用户列表
	getUserList : function(count,offset,callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetUser";
		if(count != null){
			params += "&count=" + count;
		}
		if(offset != null){
			params += "&offset=" + offset;
		}
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseGetUserList(xml);
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

	parseGetUserList : function(xml){
		var users = [];
		$(xml).find("Users>User").each(function(){
			var name = $(this).find("Name").text();
			var alias = $(this).find("Alias").text();
			var email = $(this).find("Email").text();
			var role = $(this).find("Role").text();
			if(name != null){
				var userObj = {
					name : name,
					alias : alias,
					email : email,
					role : role
				};
				users.push(userObj);

			}
		});
		return users;
	},

	// 用户数
	getUserCount : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetUserCount";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseGetUserCount(xml);
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

	parseGetUserCount : function(xml){
		var result = $(xml).find("UserCount").text();
		return result;
	},

	// 在线用户列表
	getOnlineUser : function(count,offset,callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetOnlineUser";
		if(count != null){
			params += "&count=" + count;
		}
		if(offset != null){
			params += "&offset=" + offset;
		}

		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseGetOnlineUserList(xml);
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

	parseGetOnlineUserList : function(xml){
		var users = [];
		$(xml).find("Users>User").each(function(){
			var name = $(this).find("Name").text();
			users.push(name);
		});
		return users;
	},

	removeUser : function(name,callback){
		if(name == null){
			if(callback != null){
				callback("name is null");
				return;
			}
		}
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=RemoveUser&name=" + name;
		
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseRemoveUser(xml);
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


	parseRemoveUser : function(xml){
		var text = $(xml).find("RemoveUser").text();
		var result = "";
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;		
	},

	// 在线用户个数
	getLoginCount : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version=" + this.version
				+ "&request=GetLoginCount";
		
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseGetLoginCount(xml);
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

	parseGetLoginCount : function(xml){
		var result = $(xml).find("LoginCount").text();
		return result;
	},
});