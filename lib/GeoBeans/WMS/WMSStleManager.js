GeoBeans.WMSStleManager = GeoBeans.Class({
	name 		: "",
	server 		: null,
	styles 		: null,
	service 	: "ims",
	version 	: "1.0.0",
	reader  	: null,
	writer 		: null,

	initialize : function(server){
		this.server = server;
		this.styles = [];
		this.reader = new GeoBeans.StyleReader();
		this.wirter = new GeoBeans.StyleWriter();
	},

	getStyles : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetStyle";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.styles = that.parseStyles(xml);
				if(callback != undefined){
					callback(that.styles);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	getStyle : function(name){
		if(this.styles == null){
			return null;
		}
		for(var i = 0; i<this.styles.length;++i){
			var style = this.styles[i];
			if(style.name = name){
				return style;
			}
		}
		return null;
	},

	getStyleXML : function(name,callback){
		if(name == null){
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetStyle&name="
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
				// callback($(xml));
				var style = that.parseStyleXML(xml);
				if(callback != undefined){
					callback(style);
				}

			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	getStyleByType : function(type){
		if(this.styles == null){
			return null;
		}

		var styles = new Array();
		for(var i = 0; i < this.styles.length;++i){
			var style = this.styles[i];
			var wmsType = style.geomType;
			if(wmsType == type){
				styles.push(style);
			}
		}
		return styles;
	},

	addStyle : function(xml,name,type,callback){
		var that = this;
		var params = "service=" + this.service+ "&version="
					+ this.version + "&request=AddStyle&name="
					+ name + "&type=" + type + "&style=" + xml;
		$.ajax({
			type 	: "POST",
			url 	: this.server,
			data 	: encodeURI(params),
			contentType :"application/x-www-form-urlencoded",
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var result = that.parseAddStyleXml(xml);
				that.getStyles();
				if(callback != undefined){
					callback(result);
				}
				
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	removeStyle : function(name,callback){
		if(name == null){
			return;
		}
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=removeStyle&name="
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
				var result = that.parseRemoveStyleXml(xml);
				that.getStyles();
				if(callback != undefined){
					callback(result);
				}
				
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseStyles : function(xml){
		var that = this;
		var styles = new Array();
		$(xml).find("Style").each(function(){
			var name = $(this).attr("name");
			var type = $(this).attr("type");
			var styleType = that.readStyleType(type);
			var wmsStyle = new GeoBeans.WMSStyle.FeatureStyle(name,styleType);
			styles.push(wmsStyle);
		});
		return styles;
	},

	readStyleType : function(type){
		var styleType = null;
		type = type.toLowerCase();
		switch(type){
			case "point":
			styleType = GeoBeans.WMSStyle.FeatureStyle.Type.Point;
			break;
			case "linestring":
			styleType = GeoBeans.WMSStyle.FeatureStyle.Type.LineString;
			break;
			case "polygon":
			styleType = GeoBeans.WMSStyle.FeatureStyle.Type.Polygon;
			break;
			default:
			break;
		} 
		return styleType;
	},

	parseAddStyleXml : function(xml){
		var result = "";
		
		var text = $(xml).find("AddStyle").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},

	parseRemoveStyleXml : function(xml){
		var result = "";
		var text = $(xml).find("RemoveStyle").text();
		if(text.toUpperCase() == "SUCCESS"){
			result = "success";
		}else if($(xml).find("ExceptionText").text() != ""){
			result = $(xml).find("ExceptionText").text();
		}
		return result;
	},

	parseStyleXML : function(xml){
		var style = this.reader.read(xml);
		return style;
	}

})