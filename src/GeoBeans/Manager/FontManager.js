GeoBeans.FontManager = GeoBeans.Class({
	fonts : [] ,
	server  : null,
	version : null,
	initialize : function(server,version){
		this.server = server;
		this.version = version;
	},

	getFonts : function(){
		if(this.fonts== null){
			return;
		}

		if(this.fonts.length != 0){
			return this.fonts;
		}

		var that = this;
		var params = "service=ims&version="
					+ this.version + "&request=GetFont";
					+ name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.fonts = that.parseFonts(xml);
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});

		return that.fonts;				
	},

	parseFonts : function(xml){
		var fonts = [];
		$(xml).find("font").each(function(){
			var obj = new Object();
			var face = $(this).attr("face");
			var family = $(this).attr("family");
			obj.face = face;
			obj.family = family;
			fonts.push(obj);
		});
		return fonts;
	}
});