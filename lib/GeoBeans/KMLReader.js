GeoBeans.KMLReader = GeoBeans.Class({

	// 自增id
	incrementID : 0,
	

	styles : null,
	initialize : function(){
		
	},


	read : function(name,xml){
		
		// var layer = new GeoBeans
		this.layerName = name;
		this.styles = [];
		this.load(xml);
		return this.layer;
		// return this.load(xml);
		// 'Document': ol.xml.makeArrayExtender(this.readDocumentOrFolder_, this),
  //       'Folder': ol.xml.makeArrayExtender(this.readDocumentOrFolder_, this),
  //       'Placemark': ol.xml.makeArrayPusher(this.readPlacemark_, this),
  //       'Style': this.readSharedStyle_.bind(this),
	},

	load : function(xml){
		var that = this;
		$.ajax({
			url : xml,
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.readXML(xml);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(a,b){
				console.log(b);
			}
		});
		// return that.layer;
	},

	readXML : function(xml){
		// console.log(xml);
		var documentXML = $(xml).find("Document");
		if(documentXML.length == 0){
			return null;
		}
		var featureType = new GeoBeans.FeatureType(null,this.layerName);
		var fields = [];
		var field = new GeoBeans.Field("name","string",featureType,null);
		fields.push(field);
		var field = new GeoBeans.Field("shape","geometry",featureType,null);
		fields.push(field);
		featureType.geomFieldName = "shape";
		featureType.fields = fields;

		var featureLayer = new GeoBeans.Layer.FeatureLayer(this.layerName);
		featureLayer.featureType = featureType;
		featureLayer.features = [];

		this.layer = featureLayer;

		var style = new GeoBeans.Style.FeatureStyle();
		featureLayer.setStyle(style);


		this.createDefaultRules(documentXML);

		var that = this;
		documentXML.children().each(function(){
			var tagName = this.tagName;
			switch(tagName){
				case "Folder":{
					that.parseFolder(this);
					break;
				}
				case "Style":{
					// var rule = that.parseStyle(this);
					// if(rule != null){
					// 	that.addRule(rule);
					// }
					that.parseStyle(this);
					break;
				}
				case "Placemark":{
					var feature = that.parsePlacemark(this);
					that.layer.addFeature(feature);
					break;
				}
				default:
					break;
			}
		});

		

	},

	getFid : function(){
		if(this.layer == null){
			return null;
		}
		var id = this.layerName + "_" + this.incrementID;
		while(this.layer.getFeatureByID(id) != null){
			this.incrementID++;
			id = this.layerName + "_" + this.incrementID;
		}
		return id;
		// var length = this.layer.features.length;
		// return length;
	},
	addRule : function(rule){
		if(this.layer == null || rule == null){
			return;
		}
		var style = this.layer.style;
		if(style == null){
			return;
		}
		// var rules = style.rules;
		// for(var i = 0; i < rules.length;++i){
		// 	var r = rules[i];
		// 	if(r == null){
		// 		continue;
		// 	}
		// 	if(r.name == rule.name){
		// 		// r = rule;
		// 		if(rule.symbolizer != null){
		// 			r.symbolizer = rule.symbolizer;
		// 		}
		// 		if(rule.textSymbolizer != null){
		// 			r.textSymbolizer = rule.textSymbolizer;
		// 		}
		// 		return;
		// 	}
		// }

		style.addRule(rule);
	},

	getRule : function(name){
		if(name == null || this.layer == null || this.layer.style == null){
			return null;
		}
		var rules = this.layer.style.rules;
		for(var i = 0; i < rules.length;++i){
			var r = rules[i];
			if(r == null){
				continue;
			}
			if(r.name == name){
				return r;
			}
		}
		return null;
	},

	// 添加id
	addFilterByID : function(rule,id){
		if(rule == null || id == null){
			return;
		}

		var filter = rule.filter;
		if(filter == null){
			filter = new GeoBeans.IDFilter();
			rule.filter = filter;
		}
		filter.addID(id);
	},

	parseFolder : function(xml){

	},


	parseStyle : function(xml){
		// 'IconStyle': ol.format.KML.IconStyleParser_,
  //     	'LabelStyle': ol.format.KML.LabelStyleParser_,
  //     	'LineStyle': ol.format.KML.LineStyleParser_,
  //     	'PolyStyle': ol.format.KML.PolyStyleParser_\
  		if(xml == null){
  			return;
  		}
  		var name = $(xml).attr("id");
  		var style = {

  		};
  		style.name = name;
  		// var rule = new GeoBeans.Rule();
  		// rule.name = name;
  		var that = this;
  		$(xml).children().each(function(){
  			var tagName = this.tagName;
  			switch(tagName){
  				case "IconStyle":{
  					var pointSymbolizer = that.parseIconStyle(this);
  					if(pointSymbolizer != null){
  						style.pointSymbolizer = pointSymbolizer;
  					}
  					break;
  				}
  				case "LabelStyle":{
  					var textSymbolizer = that.parseLabelStyle(this);
  					if(textSymbolizer != null){
  						style.textSymbolizer = textSymbolizer;	
  					}
  					break;
  				}
  				case "LineStyle":{
  					var lineSymbolizer = that.parseLineStyle(this);
  					if(lineSymbolizer != null){
  						style.lineSymbolizer = lineSymbolizer;	
  					}
  					break;
  				}
  				case "PolyStyle":{
  					var polygonSymbolizer = that.parsePolyStyle(this);
  					if(polygonSymbolizer != null){
  						style.polygonSymbolizer = polygonSymbolizer;
  					}
  					break;
  				}
  				default :
  					break;
  			}
  		});

  		// return rule;
  		this.styles.push(style);
  		// style.addRule(rule);

	},


	// 只解析了icon和scale
	// <IconStyle id="ID">
	//   <!-- inherited from ColorStyle -->
	//   <color>ffffffff</color>            <!-- kml:color -->
	//   <colorMode>normal</colorMode>      <!-- kml:colorModeEnum:normal or random -->

	//   <!-- specific to IconStyle -->
	//   <scale>1</scale>                   <!-- float -->
	//   <heading>0</heading>               <!-- float -->
	//   <Icon>
	//     <href>...</href>
	//   </Icon>
	//   <hotSpot x="0.5"  y="0.5"
	//     xunits="fraction" yunits="fraction"/>    <!-- kml:vec2 -->
	// </IconStyle>
	parseIconStyle : function(xml){
		if(xml == null){
			return null;
		}

		var that = this;
		// var pointSymbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		var pointSymbolizer = this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POINT);
		// var symbol = new GeoBeans.Symbol();
		$(xml).children().each(function(){
			var tagName = this.tagName;
			switch(tagName){
				// 暂不设置颜色
				// case "color":{
				// 	var color = that.parseColor(this);
				// 	break;
				// }
				case "Icon":{
					var url = that.parseIcon(this);
					if(url != null){
						pointSymbolizer.symbol.icon = url;
						// symbol.icon = url;
					}
					break;
				}
				case "scale":{
					var scale = that.parseScale(this);
					if(scale != null){
						// symbol.scale = scale;
						pointSymbolizer.symbol.scale = scale;
					}
					break;
				}
			}
		});
		// pointSymbolizer.symbol = symbol;
		return pointSymbolizer;
	},


	// 颜色模式没有考虑，如果不设置颜色，则为默认的颜色
	// <LabelStyle id="ID">
	//   <!-- inherited from ColorStyle -->
	//   <color>ffffffff</color>            <!-- kml:color -->
	//   <colorMode>normal</colorMode>      <!-- kml:colorModeEnum: normal or random -->

	//   <!-- specific to LabelStyle -->
	//   <scale>1</scale>                   <!-- float -->
	// </LabelStyle>	

	parseLabelStyle : function(xml){
		if(xml == null){
			return null;
		}
		var that = this;
		var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
		textSymbolizer.fill.color.set(255,0,0,1);
		textSymbolizer.stroke = null;
		$(xml).children().each(function(){
			var tagName = this.tagName;
			switch(tagName){
				case "color":{
					var color = that.parseColor(this);
					textSymbolizer.fill.color = color;
					break;
				}
				case "scale":{
					var scale = that.parseScale(this);
					textSymbolizer.font.size = textSymbolizer.font.size*scale;
					break;
				}
				default :
					break;
			}
		});

		textSymbolizer.labelProp = "name";
		return textSymbolizer;
	},


	// <LineStyle id="ID">
	//   <!-- inherited from ColorStyle -->
	//   <color>ffffffff</color>            <!-- kml:color -->
	//   <colorMode>normal</colorMode>      <!-- colorModeEnum: normal or random -->

	//   <!-- specific to LineStyle -->
	//   <width>1</width>                            <!-- float -->
	//   <gx:outerColor>ffffffff</gx:outerColor>     <!-- kml:color -->
	//   <gx:outerWidth>0.0</gx:outerWidth>          <!-- float -->
	//   <gx:physicalWidth>0.0</gx:physicalWidth>    <!-- float -->
	//   <gx:labelVisibility>0</gx:labelVisibility>  <!-- boolean -->
	// </LineStyle>
	parseLineStyle : function(xml){
		if(xml == null){
			return null;
		}

		var that = this;
		var lineSymbolizer = this.getDefaultSymbolizer(GeoBeans.Geometry.Type.LINESTRING);
		// var lineSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		// lineSymbolizer.stroke.color.set(255,0,0,1);
		$(xml).children().each(function(){
			var tagName = this.tagName;
			switch(tagName){
				case "color":{
					var color = that.parseColor(this);
					lineSymbolizer.stroke.color = color;
					break;
				}
				case "width":{
					var width = that.parseWidth(this);
					lineSymbolizer.stroke.width = width;
					break;
				}
			}
		});
		return lineSymbolizer;
	},

	// <PolyStyle id="ID">
	//   <!-- inherited from ColorStyle -->
	//   <color>ffffffff</color>            <!-- kml:color -->
	//   <colorMode>normal</colorMode>      <!-- kml:colorModeEnum: normal or random -->

	//   <!-- specific to PolyStyle -->
	//   <fill>1</fill>                     <!-- boolean -->
	//   <outline>1</outline>               <!-- boolean -->
	// </PolyStyle>
	parsePolyStyle : function(xml){
		if(xml == null){
			return null;
		}
		var that = this;
		// var polygonSymbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		var polygonSymbolizer = this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POLYGON);
		$(xml).children().each(function(){
			var tagName = this.tagName;
			switch(tagName){
				case "color":{
					var color = that.parseColor(this);
					polygonSymbolizer.fill.color = color;
					break;
				}
				case "fill":{
					var fill = that.parseFill(this);
					if(!fill){
						polygonSymbolizer.fill = null;
					}
					break;
				}
				case "outline":{
					var outline = that.parseOutline(this);
					if(!outline){
						polygonSymbolizer.stroke = null;
					}
					break;
				}
				default :
					break;
			}
		});
		// if(polygonSymbolizer.stroke != null){
		// 	polygonSymbolizer.stroke.color.set(255,0,0,1);
		// }
		return polygonSymbolizer;
	},

	// <color>ffffffff</color>,abgr
	parseColor : function(xml){
		if(xml == null){
			return null;
		}
		var colorStr = $(xml).text();
		if(colorStr.length == 8){
			var color = new GeoBeans.Color();
			color.setByABGR(colorStr);
			return color;
		}
		return (new GeoBeans.Color());
	},

	parseIcon : function(xml){
		if(xml == null){
			return null;
		}

		var href = $(xml).find("href").text();
		return href;
	},

	parseScale : function(xml){
		if(xml == null){
			return null;
		}
		var scale = $(xml).text();
		return parseFloat(scale);
	},

	parseWidth : function(xml){
		if(xml == null){
			return null;
		}
		var width = $(xml).text();
		return parseFloat(width);
	},

	// <fill>1</fill>
	parseFill : function(xml){
		if(xml == null){
			return null;
		}
		var text = $(xml).text();
		var flag = parseInt(text);
		if(flag == 1){
			return true;
		}else{
			return false;
		}
	},

	parseOutline : function(xml){
		if(xml == null){
			return null;
		}
		var text = $(xml).text();
		var flag = parseInt(text);
		if(flag == 1){
			return true;
		}else{
			return false;
		}
	},	

	parsePlacemark : function(xml){
		// console.log(xml);
		if(xml == null){
			return null;
		}

		// var feature = 
		var name = null;
		var that = this;
		var styleName = null;
		var geometry = null;
		$(xml).children().each(function(){
			var tagName = this.tagName;
			switch(tagName){
				case "name":{
					name = $(this).text();
					break;
				}
				case "styleUrl":{
					// name = $(this)
					styleName = that.parseStyleUrl(this);
					break;
				}
				case "Point":{
					geometry = that.parsePoint(this);
					break;
				}
				case "LineString":{
					geometry = that.parseLineString(this);
					break;
				}
				case "Polygon":{
					geometry = that.parsePolygon(this);
					break;
				}
				default :
					break;
			}
		});


		var fid = $(this).attr("id");
		if(fid == null){
			fid = this.getFid();
		}
		// var fid = this.getFid();
		if(fid == null){
			return null;
		}

		var x = Math.random() * 180;
		var y = Math.random()* 90;
		
		var values = [name,geometry];
		var feature = new GeoBeans.Feature(this.layer.featureType,fid,geometry,values);
		if(styleName != null){
			// var rule = this.getRule(styleName);
			// if(rule == null){
			// 	rule = new GeoBeans.Rule(styleName);
			// 	this.addRule(rule);

			// }
			// this.addFilterByID(rule,fid);
			if(geometry != null){
				var geomType = geometry.type;
				// 先去图层里面看，有么有匹配的
				var rule = this.getLayerRule(styleName,geomType);
				if(rule == null){
					// 再去kml里的是style找
					rule = this.getRuleByStyle(styleName,geomType);
					if(rule != null){
						this.addRule(rule);
						this.addFilterByID(rule,fid);
					}
				}else{
					this.addFilterByID(rule,fid);
				}

			}
		}else{

		}
		return feature;
	},

	getLayerRule : function(styleName,geomType){
		if(this.layer == null || this.layer.style == null || geomType == null){
			return null;
		}
		var rules = this.layer.style.rules;
		for(var i = 0; i < rules.length;++i){
			var rule = rules[i];
			if(rule == null){
				continue;
			}
			if(rule.name != styleName){
				continue;
			}
			var symbolizer = rule.symbolizer;
			if(symbolizer == null){
				continue;
			}
			var type = symbolizer.type;
			switch(geomType){
				case GeoBeans.Geometry.Type.POINT:{
					if(type == GeoBeans.Symbolizer.Type.Point){
						return rule;
					}
					break;
				}
				case GeoBeans.Geometry.Type.LINESTRING:{
					if(type == GeoBeans.Symbolizer.Type.Line){
						return rule;
					}
					break;
				}
				case GeoBeans.Geometry.Type.POLYGON:{
					if(type == GeoBeans.Symbolizer.Type.Polygon){
						return rule;
					}
					break;
				}
				default:
					break;
			}
		}
		return null;
	},

	getRuleByStyle : function(styleName,geomType){
		if(styleName == null || geomType == null){
			return null;
		}
		var style = null;
		var pointSymbolizer = null, textSymbolizer = null, lineSymbolizer = null, polygonSymbolizer = null;
		for(var i = 0; i < this.styles.length;++i){
			style =  this.styles[i];
			if(style == null){
				continue;
			}

			switch(geomType){
				case GeoBeans.Geometry.Type.POINT:{
					pointSymbolizer = style.pointSymbolizer;
					textSymbolizer = style.textSymbolizer;
					var rule = new GeoBeans.Rule();
					rule.name = styleName;
					if(pointSymbolizer != null){
						rule.symbolizer = pointSymbolizer;
					}else{
						rule.symbolizer = this.getDefaultSymbolizer(geomType);
					}
					if(textSymbolizer != null){
						rule.textSymbolizer = textSymbolizer;
					}
					return rule;
					break;
				}
				case GeoBeans.Geometry.Type.LINESTRING:{
					lineSymbolizer = style.lineSymbolizer;
					var rule = new GeoBeans.Rule();
					rule.name = styleName;
					if(lineSymbolizer != null){
						rule.symbolizer = lineSymbolizer;
					}else{
						rule.symbolizer = this.getDefaultSymbolizer(geomType);
					}
					return rule;
					break;
				}
				case GeoBeans.Geometry.Type.POLYGON:{
					polygonSymbolizer = style.polygonSymbolizer;
					lineSymbolizer = style.lineSymbolizer;
					var rule = new GeoBeans.Rule();
					rule.name = styleName;
					if(polygonSymbolizer != null){
						if(polygonSymbolizer.stroke != null && lineSymbolizer != null){
							polygonSymbolizer.stroke = lineSymbolizer.stroke;
						}
						rule.symbolizer = polygonSymbolizer;
					}else{
						rule.symbolizer = this.getDefaultSymbolizer(geomType);
						if(lineSymbolizer != null){
							rule.symbolizer.stroke = lineSymbolizer.stroke;
						}
					}
					return rule;
					break;
				}
				default:
					break;
			}
		}
		return null;
	},


	parseStyleUrl: function(xml){
		if(xml == null){
			return null;
		}
		var url = $(xml).text();
		if(url.indexOf("#") == 0){
			return url.slice(1,url.length);
		}
		return null;

	},

	// <coordinates>...</coordinates> 
	parsePoint : function(xml){
		if(xml == null){
			return null;
		}

		var coordinates = $(xml).find("coordinates").text();
		var point = this.parsePointCoords(coordinates);
		return point;
	},

	parseLineString: function(xml){
		if(xml == null){
			return null;
		}

		var coordinates = $(xml).find("coordinates").text();
		var lineString = this.parseLineStringCoords(coordinates);
		return lineString;

	},

	parsePointCoords : function(coordinates){
		if(coordinates == null || coordinates.trim() == ""){
			return null;
		}

		var coordArray = coordinates.split(",");
		var x = parseFloat(coordArray[0].trim());
		var y = parseFloat(coordArray[1].trim());
		if(x != null && y != null){
			return new GeoBeans.Geometry.Point(x,y);
		}
		return null;
	},

	parseLineStringCoords : function(coordinates){
		if(coordinates == null || coordinates.trim() == ""){
			return null;
		}
		var points = [];
		var array = coordinates.replace(/\n/g," ").trim().split(/[ ]+/);
		for(var i = 0; i < array.length;++i){
			var point  = this.parsePointCoords(array[i]);
			if(point != null){
				points.push(point);
			}
		}

		if(points.length <= 1){
			return null;
		}
		var lineString = new GeoBeans.Geometry.LineString(points);
		return lineString;
	},


	parsePolygon : function(xml){
		if(xml == null){
			return null;
		}

		var coordinates_out = $(xml).find("outerBoundaryIs>LinearRing>coordinates").text();
		var lineString_out = this.parseLineStringCoords(coordinates_out);

		var coordinates_in = $(xml).find("innerBoundaryIs>LinearRing>coordinates").text(); 
		var lineSring_in = this.parseLineStringCoords(coordinates_in);

		var rings = [];

		if(lineString_out != null){
			rings.push(lineString_out);
		}
		if(lineSring_in != null){
			rings.push(lineSring_in);
		}
		

		if(rings.length == 0){
			return null;
		}
		return (new GeoBeans.Geometry.Polygon(rings));
	},


	getDefaultRule : function(geomType){

		var symbolizer = this.getDefaultSymbolizer(geomType);
		if(symbolizer == null){
			return null;
		}


	},

	//  设定点、线、面的默认样式，如果没有设定样式，则从这里面查找
	createDefaultRules : function(documentXML){
		if(documentXML == null){
			return;
		}
		var xmlStyleNames = [];
		var xmlStyleArray = $(documentXML).find("Style");
		xmlStyleArray.each(function(){
			var name = $(this).attr("id");
			xmlStyleNames.push(name);
		});
		
	},
	

	getDefaultSymbolizer : function(geomType){
		var symbolizer = null;
		switch(geomType){
			case GeoBeans.Geometry.Type.POINT:{
				symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				var symbol = new GeoBeans.Symbol();
				symbol.icon = "images/marker.png";
				symbolizer.symbol = symbol;
				break;
			}
			case GeoBeans.Geometry.Type.LINESTRING:{
				symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				symbolizer.stroke.color.set(255,0,0,1);
				break;
			}
			case GeoBeans.Geometry.Type.POLYGON:{
				symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
				symbolizer.fill.color.set(255,0,0,1);
				symbolizer.stroke.color.set(0,0,255,1);
				break;
			}
			default:
				break;
		}
		return symbolizer;
	},	


});