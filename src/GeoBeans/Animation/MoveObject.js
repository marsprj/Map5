GeoBeans.MoveObject = GeoBeans.Class({
	
	flag : false,


	id : null,
	initalize : function(){

	},

	start : function(){
		this.flag = true;
	},

	stop : function(){
		this.flag = false;
	},

	destroy : function(){
		
	},

});

GeoBeans.MoveType = {
	POINT : "point"
};