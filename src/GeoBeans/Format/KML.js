GeoBeans.KMLReader = GeoBeans.Class({

	// 自增id
	incrementID : 0,
	

	styles : null,
	initialize : function(){
		
	},


	read : function(name,xml){
		this.layerName = name;
		this.styles = [];
		this.load(xml);
		return this.layer;
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
	},

	readXML : function(xml){
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

		this.parseDocumentXML(documentXML);

	},

	parseDocumentXML : function(xml){
		if(xml == null){
			return;
		}
		var that = this;
		xml.children().each(function(){
			var tagName = this.tagName;
			if(tagName == "name"){
				var text = $(this).text();
				// if(text == "Roads"){
				// 	console.log(this);
				// }
			}
			switch(tagName){
				case "Folder":{
					that.parseFolder(this);
					break;
				}
				case "Style":{
					that.parseStyle(this);
					break;
				}
				case "StyleMap":{
					that.parseStyleMap(this);
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
	},
	addRule : function(rule){
		if(this.layer == null || rule == null){
			return;
		}
		var style = this.layer.style;
		if(style == null){
			return;
		}
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
		if(xml == null){
			return;
		}
		var that = this;
		$(xml).children().each(function(){
			var tagName = this.tagName;
			if(tagName == "Folder"){
				that.parseFolder(this);
			}else if(tagName == "Style"){
				that.parseStyle(this);
			}else if(tagName == "Placemark"){
				var feature = that.parsePlacemark(this);
				that.layer.addFeature(feature);
			}
			
		});
	},
	parseStyle : function(xml){
  		if(xml == null){
  			return;
  		}
  		var name = $(xml).attr("id");
  		var style = {

  		};
  		style.name = name;
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
		var pointSymbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POINT)).clone();
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
		var textSymbolizer = this.getDefaultTextSymbolizer().clone();
		// var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
		// textSymbolizer.fill.color.set(255,0,0,1);
		// textSymbolizer.stroke = null;
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

		// textSymbolizer.labelProp = "name";
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
		var lineSymbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.LINESTRING)).clone();
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
		var polygonSymbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POLYGON)).clone();
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

		if(colorStr.length == 9 && colorStr.indexOf("#") == 0){
			var color = new GeoBeans.Color();
			color.setByABGR(colorStr.slice(1,colorStr.length));
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

	parseStyleMap : function(xml){
		if(xml == null){
			return;
		}
		var id = $(xml).attr("id");
		if(id == null){
			return;
		}

		var style = {};
		style.name = id;
		style.type = "StyleMap";
		$(xml).children().each(function(){
			var key = $(this).find("key").text();
			var styleUrl = $(this).find("styleUrl").text();
			if(styleUrl == null || styleUrl.indexOf("#") != 0){
				return;
			}
			if(key != null || key != ""){
				if(key == "normal"){
					style.normal = styleUrl.slice(1,styleUrl.length);
				}else if(key == "highlight"){
					style.highlight = styleUrl.slice(1,styleUrl.length);
				}
			}
		});

		this.styles.push(style);
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
				case "MultiGeometry":{
					geometry = that.parseMultiGeometry(this);
					break;
				}
				default :
					break;
			}
		});


		var fid = $(xml).attr("id");
		if(fid == null){
			fid = this.getFid();
		}
		if(fid == null){
			return null;
		}

		var x = Math.random() * 180;
		var y = Math.random()* 90;
		
		var values = [name,geometry];
		var feature = new GeoBeans.Feature(this.layer.featureType,fid,geometry,values);
		if(styleName != null){
			if(geometry != null){
				var geomType = geometry.type;
				if(geomType != GeoBeans.Geometry.Type.COLLECTION){
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
						// 已经有该样式了
						this.addFilterByID(rule,fid);
					}
				}else{
					var components = geometry.components;
					for(var i = 0; i < components.length;++i){
						var g = components[i];
						if(g == null){
							continue;
						}
						var gType = g.type;
						var normalStyleName = this.getNormalStyleMap(styleName);
						var rule = this.getLayerRule(normalStyleName,gType);
						if(rule == null){
							// 再去kml里的是style找
							rule = this.getRuleByStyle(styleName,gType);
							if(rule != null){
								this.addRule(rule);
								this.addFilterByID(rule,fid);
							}
						}else{
							// 已经有该样式了
							this.addFilterByID(rule,fid);
						}
					}
				}
			}
		}else{
			// 没有设定样式，则选取默认样式
			if(geometry != null){
				var rule = this.getDefaultRuleByGeomType(geometry.type);
				if(rule != null){
					// 看看是否已经添加到图层里面了
					var layerRule = this.getLayerRule(rule.name,geometry.type);
					if(layerRule != null){
						// 已经添加
						this.addFilterByID(rule,fid);
					}else{
						this.addRule(rule);
						this.addFilterByID(rule,fid);
					}
				}
			}
			
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
			if(style.name != styleName){
				continue;
			}
			if(style.type == "StyleMap"){
				// console.log(style);
				var name = style.normal;
				return this.getRuleByStyle(name,geomType);
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
						rule.symbolizer = this.getDefaultSymbolizer(geomType).clone();
					}
					if(textSymbolizer != null){
						rule.textSymbolizer = textSymbolizer;
					}else{
						rule.textSymbolizer = this.getDefaultTextSymbolizer().clone();
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
						rule.symbolizer = this.getDefaultSymbolizer(geomType).clone();
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
						rule.symbolizer = this.getDefaultSymbolizer(geomType).clone();
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

	getNormalStyleMap : function(styleName){
		if(styleName == null){
			return null;
		}
		var style = null;
		for(var i = 0; i < this.styles.length;++i){
			style = this.styles[i];
			if(style == null){
				continue;
			}
			if(style.name != styleName){
				continue;
			}

			if(style.type == "StyleMap"){
				var name = style.normal;
				return name;
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

		var rings = [];
		var coordinates_out = $(xml).find("outerBoundaryIs>LinearRing>coordinates").text();
		var lineString_out = this.parseLineStringCoords(coordinates_out);

		if(lineString_out != null){
			rings.push(lineString_out);
		}

		var that = this;
		$(xml).find("innerBoundaryIs>LinearRing>coordinates").each(function(){
			var coordinates_in = $(this).text(); 
			var lineSring_in = that.parseLineStringCoords(coordinates_in);
			if(lineSring_in != null){
				rings.push(lineSring_in);
			}
		});

		

		if(rings.length == 0){
			return null;
		}
		return (new GeoBeans.Geometry.Polygon(rings));
	},

	parseMultiGeometry : function(xml){
		if(xml == null){
			return null;
		}
		var that = this;
		var geometry = new GeoBeans.Geometry.GeometryCollection();
		$(xml).children().each(function(){
			var tagName = this.tagName;
			var g = null;
			switch(tagName){
				case "Point":{
					g = that.parsePoint(this);
					break;
				}
				case "LineString":{
					g = that.parseLineString(this);
					break;
				}
				case "Polygon":{
					g = that.parsePolygon(this);
					break;
				}
				default:
					break;
			}
			if(g != null){
				geometry.addComponent(g);				
			}
		});
		return geometry;
	},


	// 根据geometry类型来获取rule
	getDefaultRuleByGeomType : function(geomType){
		if(geomType == GeoBeans.Geometry.Type.POINT){
			return this.pointDefaultRule;
		}else if(geomType == GeoBeans.Geometry.Type.LINESTRING){
			return this.lineDefaultRule;
		}else if(geomType == GeoBeans.Geometry.Type.POLYGON){
			return this.polygonDefaultRule;
		}
		return null;
	},

	// 设置名称，设置默认样式
	getDefaultRule : function(name,geomType){
		if(name == null || geomType == null){
			return null;
		}
		var symbolizer = this.getDefaultSymbolizer(geomType).clone();
		if(symbolizer == null){
			return null;
		}
		var rule = new GeoBeans.Rule();
		rule.name = name;
		rule.symbolizer = symbolizer;
		if(geomType == GeoBeans.Geometry.Type.POINT){
			rule.textSymbolizer = this.getDefaultTextSymbolizer().clone();
		}
		return rule;

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
		var id = 0;
		var pointRuleName = "default_point";
		var lineRuleName = "default_line";
		var polygonRuleName = "default_polygon";
		var id = null;
		while(xmlStyleNames.indexOf(pointRuleName) != -1){
			id = 0;
			pointRuleName += id; 
		}
		this.pointDefaultRule = this.getDefaultRule(pointRuleName,GeoBeans.Geometry.Type.POINT);


		while(xmlStyleNames.indexOf(lineRuleName) != -1){
			id = 0;
			lineRuleName += id; 
		}
		this.lineDefaultRule = this.getDefaultRule(lineRuleName,GeoBeans.Geometry.Type.LINESTRING);


		while(xmlStyleNames.indexOf(polygonRuleName) != -1){
			id = 0;
			polygonRuleName += id; 
		}
		this.polygonDefaultRule = this.getDefaultRule(polygonRuleName,GeoBeans.Geometry.Type.POLYGON);
	},
	

	getDefaultSymbolizer : function(geomType){
		var symbolizer = null;
		switch(geomType){
			case GeoBeans.Geometry.Type.POINT:{
				symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				var symbol = new GeoBeans.Symbol();
				symbol.icon = "../images/ylw-pushpin.png";
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

	getDefaultTextSymbolizer : function(){
		var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
		textSymbolizer.fill.color.set(255,255,255,1);
		textSymbolizer.stroke.color.set(51,51,51,1);
		textSymbolizer.stroke.width = 1;
		textSymbolizer.font.family = "Helvetica";
		textSymbolizer.font.weight = GeoBeans.Font.WeightType.Bold;
		textSymbolizer.font.size = 16;
		textSymbolizer.displaceX = 8;
		textSymbolizer.displaceY = -5;		
		textSymbolizer.labelProp = "name";
		return textSymbolizer;
	},
});