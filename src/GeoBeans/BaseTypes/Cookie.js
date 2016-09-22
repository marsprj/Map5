/**
 * @classdesc
 * Cookie对象
 * @class
 */
GeoBeans.Cookie = GeoBeans.Class({
	
	initialize : function(){

	},

	setCookie : function(name,value,path){
	    var exp  = new Date();  
	    exp.setTime(exp.getTime() + 1*24*60*60*1000);
	    var cookieStr = name + "="+ escape (value) + ";expires=" + exp.toGMTString() 
	    if(path != null){
	    	cookieStr+= ";path=" + path;
	    }
	    document.cookie = cookieStr;
	},
 	getCookie: function(name){
    	var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
     	if(arr != null) return unescape(arr[2]); return null;
	},

 	delCookie: function(name,path){
    	var exp = new Date();
    	exp.setTime(exp.getTime() - 1);
    	var cval = this.getCookie(name);

    	if(cval!=null) {
    		var cookieStr = name + "="+cval+";expires="+exp.toGMTString();
    		if(path != null){
		    	cookieStr+= ";path=" + path;
		    }
    		document.cookie= cookieStr;
    	}
	}
});