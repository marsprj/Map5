GeoBeans.InfoWindow = GeoBeans.Class({
	width 		: 300,
	height 		: 200,
	// x 			: null,
	// y 			: null,
	title 		: "Info",
	content 	: null,

	initialize : function(content,options){
		this.content = content;
		if(options != null){
			var width = options.width;
			if(width != null){
				this.width = width;
			}
			var height = options.height;
			if(height != null){
				this.height = height;
			}
			var title = options.title;
			if(title != null){
				this.title = title; 
			}
		}
	},

	getContent : function(){
		return this.content;
	},

	getTitle : function(){
		return this.title;
	}


});