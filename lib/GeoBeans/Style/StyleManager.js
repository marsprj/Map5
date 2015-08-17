GeoBeans.StyleManager = GeoBeans.Class({
	name 		: "",
	server 		: null,
	styles 		: null,
	colorMaps 	: null,
	service 	: "ims",
	version 	: "1.0.0",
	reader  	: null,
	writer 		: null,

	initialize : function(server){
		// this.server = server;
		this.server = server + "/mgr";
		this.styles = [];
		this.colorMaps = [];
		this.reader = new GeoBeans.StyleReader();
		this.writer = new GeoBeans.StyleWriter();
	},

	getStyles : function(){
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
				// if(callback != undefined){
				// 	callback(that.styles);
				// }
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return this.styles;
	},

	getStyle : function(name){
		if(this.styles == null){
			return null;
		}
		for(var i = 0; i<this.styles.length;++i){
			var style = this.styles[i];
			if(style.name == name){
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
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				// callback($(xml));
				var style = that.parseStyleXML(xml);
				if(style == null){
					if(callback != null){
						callback(null);
						return;
					}
				}
				var styleThis = that.getStyle(name);
				if(styleThis == null){
					if(callback != undefined){
						callback(style);
					}
					return;
				}
				var rules = style.rules;
				styleThis.rules = [];
				for(var i = 0; i < rules.length;++i){
					styleThis.addRule(rules[i]);
				}
				if(callback != undefined){
					callback(styleThis);
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
			var geomType = style.geomType;
			if(geomType == type){
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
			async : true,
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


	updateStyle : function(xml,name,callback){
		var that = this;
		var params = "service=" + this.service+ "&version="
					+ this.version + "&request=UpdateStyle&name="
					+ name  + "&style=" + xml;
		$.ajax({
			type 	: "POST",
			url 	: this.server,
			data 	: encodeURI(params),
			contentType :"application/x-www-form-urlencoded",
			// contentType: "text/plain",
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(resultXml, textStatus){
				var result = that.parseUpdateStyleXml(resultXml);
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
			async : true,
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

	// 获取色阶表
	getColorMaps : function(callback){
		if(callback != null){
			this.getColorMapsAsync(callback);
		}else{
			var colorMaps = this.getColorMapsSyn();
			return colorMaps;
		}
	},

	getColorMapsAsync : function(callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetColorMap";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.colorMaps = that.parseColorMaps(xml);
				if(callback != undefined){
					callback(that.colorMaps);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	// 同步
	getColorMapsSyn : function(){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetColorMap";
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.colorMaps = that.parseColorMaps(xml);
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.colorMaps;
	},

	// 按照id获取色阶
	getColorMapByID : function(id,callback){
		if(callback != null){
			this.getColorMapByIDAsync(id,callback);
		}else{
			var colorMap = this.getColorMapByIDSyn(id);
			return colorMap;
		}
	},

	// 异步
	getColorMapByIDAsync : function(id,callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetColorMap"
					+ "&id=" + id;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.colorMap = that.parseColorMapID(xml);
				if(callback != undefined){
					callback(that.colorMap);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	// 同步
	getColorMapByIDSyn : function(id){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetColorMap"
					+ "&id=" + id;
		this.colorMapID = id;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.colorMap = that.parseColorMapID(xml);
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.colorMap;
	},

	// 获取某个色阶指定个数的颜色
	getColorMap : function(id,count,callback){
		if(callback != null){
			this.getColorMapAsync(id,count,callback);
		}else{
			var colors = this.getColorMapSyn(id,count);
			return colors;
		}
	},

	// 同步
	getColorMapSyn : function(id,count){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetColorMap"
					+ "&id=" + id + "&count=" + count;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var colors = that.parseColorMap(xml);
				that.colors = colors;
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.colors;
	},

	// 异步
	getColorMapAsync : function(id,count,callback){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetColorMap"
					+ "&id=" + id + "&count=" + count;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var colors = that.parseColorMap(xml);
				if(callback != undefined){
					callback(colors);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
	},

	// 符号列表
	getSymbols : function(type,callback){
		if(type == null){
			if(callback != null){
				callback("params is invalid");
			}
			return;
		}

		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetSymbol"
					+ "&type=" + type;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var symbols = that.parseGetSymbol(xml);
				if(callback != undefined){
					callback(symbols);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	// 某个符号
	getSymbol : function(type,name){
		var that = this;
		var params = "service=" + this.service + "&version="
					+ this.version + "&request=GetSymbol"
					+ "&type=" + type + "&name=" + name;
		$.ajax({
			type 	: "get",
			url 	: this.server,
			data 	: encodeURI(params),
			dataType:"xml",
			async : false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var symbols = that.parseGetSymbol(xml);
				if(callback != undefined){
					callback(symbols);
				}
			},			 
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
	},

	getSymbolIcon : function(type,name){
		var url = this.server + "?" + "service=" + this.service + "&version="
				+ this.version + "&request=GetSymbolIcon"
				+ "&type=" + type + "&name=" + name;
		return url;
	},


	parseStyles : function(xml){
		var that = this;
		var styles = new Array();
		$(xml).find("Style").each(function(){
			var name = $(this).attr("name");
			var type = $(this).attr("type");
			var styleType = that.readStyleType(type);
			var style = new GeoBeans.Style.FeatureStyle(name,styleType);
			styles.push(style);
		});
		return styles;
	},

	readStyleType : function(type){
		var styleType = null;
		type = type.toLowerCase();
		switch(type){
			case "point":
			styleType = GeoBeans.Style.FeatureStyle.GeomType.Point;
			break;
			case "linestring":
			styleType = GeoBeans.Style.FeatureStyle.GeomType.LineString;
			break;
			case "polygon":
			styleType = GeoBeans.Style.FeatureStyle.GeomType.Polygon;
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

	parseUpdateStyleXml : function(xml){
		var result = "";
		
		var text = $(xml).find("UpdateStyle").text();
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
	},

	parseColorMaps : function(xml){
		var that = this;
		var colorMaps = [];
		$(xml).find("ColorMap").each(function(){
			var id = $(this).attr("id");
			var start = $(this).find("Start:first").text();
			var end = $(this).find("End:first").text();
			var url = $(this).find("OnlineResource")
				.attr("xlink:href");
			var colorMap = new GeoBeans.ColorMap(id,
				start,end,url);
			colorMaps.push(colorMap);
		});
		return colorMaps;
	},

	parseColorMapID : function(xml){
		// var id = $(xml).attr("id");
		var id = this.colorMapID;
		var start = $(xml).find("Start:first").text();
		var end = $(xml).find("End:first").text();
		var url = $(xml).find("OnlineResource")
			.attr("xlink:href");
		var colorMap = new GeoBeans.ColorMap(id,
			start,end,url);
		return colorMap;
	},

	parseColorMap : function(xml){
		var colors = [];
		$(xml).find("Color").each(function(){
			var value = $(this).text();
			colors.push(value);
		});
		return colors;
	},

	parseGetSymbol : function(xml){
		var symbols = [];
		var that = this;
		$(xml).find("Symbol").each(function(){
			var symbol = that.parseSymbol(this);
			if(symbol != null){
				symbols.push(symbol);
			} 
		});
		return symbols;
	},

	parseSymbol : function(xml){
		var name = $(xml).find("Name").text();
		var icon = $(xml).find("Icon").attr("xlink:href");
		var symbol = null;
		if(name != null ||icon != null){
			symbol = new GeoBeans.Symbol(name,icon);
		}
		return symbol;
	},
})