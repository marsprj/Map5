/**
 * @classdesc
 * KML数据格式类
 * @class
 */
GeoBeans.Format.KML = GeoBeans.Class(GeoBeans.Format,{
	
	initialize : function(){
		
	},
});


GeoBeans.Format.KML.prototype.read = function(kml,style,fields){
	if(kml == null || fields == null){
		return null;
	}


	var features = [];
	var documentKML = $(kml).find("Document");

	this.createDefaultRules(documentKML);

	var that = this;
	documentKML.children().each(function(){
		var tagName = this.tagName;

		switch(tagName){
			case "Folder":{
				break;
			}
			case "Placemark":{
				var feature = that.readPlacemark(this,style,fields);
				if(feature != null){
					features.push(feature);
				}
			}
		}
	});

	return features;
};


GeoBeans.Format.KML.prototype.readFields = function(kml){
	if(kml == null){
		return null;
	}
	var featureType = new GeoBeans.FeatureType();
	featureType.fields = [];

	var field = new GeoBeans.Field("name",GeoBeans.Field.Type.STRING,featureType,null);
	featureType.fields.push(field);

	var field = new GeoBeans.Field("geometry",GeoBeans.Field.Type.GEOMETRY,featureType,null);

	var geomType = this.readGeometryType(kml);
	field.setGeomType(geomType);

	featureType.fields.push(field);
	return featureType.fields;
};

GeoBeans.Format.KML.prototype.readGeometryType = function(kml){
	if(kml == null){
		return null;
	}
	var placemark = $(kml).find("Placemark").first();

	var that = this;
	var geomType = null;

	placemark.children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "Point":{
				geomType = GeoBeans.Geometry.Type.POINT;
				break;
			}
			case "LineString":{
				geomType = GeoBeans.Geometry.Type.LINESTRING;
				break;
			}
			case "Polygon":{
				geomType = GeoBeans.Geometry.Type.POLYGON;
				break;
			}
			case "MultiGeometry":{
				geomType = GeoBeans.Geometry.Type.COLLECTION;
				break;
			}
			default:
				break;
		}
	});
	return geomType;
};

GeoBeans.Format.KML.prototype.readStyle = function(kml){
	if(kml == null){
		return null;
	}
	console.log(kml);
	var style = new GeoBeans.Style.FeatureStyle();
	var that = this;

	var documentKML = $(kml).find("Document");
	documentKML.children().each(function(){
		var tagName = this.tagName;

		switch(tagName){
			case "Folder":{
				var rules = that.readRuleByFolderNode(this);
				if(rules != null){
					$(rules).each(function(){
						style.addRule(this);
					});
				}
				break;
			}
			case "Style":{
				var rule = that.readRuleByStyleNode(this);
				if(rule != null){
					style.addRule(rule);
				}
				break;
			}
			case "StyleMap":{
				break;
			}
			default:
				break;
		}
	});

	return style;
};


GeoBeans.Format.KML.prototype.readRuleByFolderNode = function(kml){
	if(kml == null){
		return;
	}

	var rule = null;
	var that = this;
	var rules = [];
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			// 嵌套循环
			case "Folder":{
				var rules_c = that.readRuleByFolderNode(this);
				if(rules_c != null){
					$(rules_c).each(function(){
						rules.push(this);
					});
				}
			}
			case "Style":{
				rule = that.readRuleByStyleNode(this);
				if(rule != null){
					rules.push(rule);
				}
				break;
			}
			default:
				break;
		}
	});

	return rules;
};

// <Style id="exampleStyleDocument">
//     <LabelStyle>
//       <color>ff0000cc</color>
//   	  <colorMode>normal</colorMode>
//     </LabelStyle>
//   	<IconStyle>
//         <color>ff00ff00</color>
//          <scale>1.1</scale>
//          <Icon>
//             <href>images/marker.png</href>
//          </Icon>
//       </IconStyle>
//   </Style>
GeoBeans.Format.KML.prototype.readRuleByStyleNode = function(kml){
	if(kml == null){
		return null;
	}

	var name = $(kml).attr("id");
	if(name == null){
		return null;
	}
	var rule = new GeoBeans.Style.Rule(name);
	var that = this;

	var pointSymbolizer = null;
	var lineSymbolizer = null;
	var polygonSymbolizer = null;

	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "IconStyle":{
				var pointSymbolizer = that.readIconStyle(this);
				rule.symbolizer = pointSymbolizer;
				break;
			}
			case "LabelStyle":{
				var textSymbolizer = that.readLabelStyle(this);
				rule.textSymbolizer = textSymbolizer;
				break;
			}
			case "LineStyle":{
				var lineSymbolizer = that.readLineStyle(this);
				rule.symbolizer = lineSymbolizer;
				break;
			}
			case "PolyStyle":{
				var polygonSymbolizer = that.readPolyStyle(this);
				rule.symbolizer = polygonSymbolizer;
				break;
			}
			default :
				break;
		}
	});	

	if(rule.textSymbolizer != null && rule.symbolizer == null){
		rule.symbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POINT)).clone();
	}
	return rule;
};

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
GeoBeans.Format.KML.prototype.readIconStyle = function(kml){
	if(kml == null){
		return null;
	}

	var that = this;
	var pointSymbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POINT)).clone();
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "Icon":{
				var url = that.readIcon(this);
				if(url != null){
					pointSymbolizer.symbol.icon = url;
				}
				break;
			}
			case "scale":{
				var scale = that.readScale(this);
				if(scale != null){
					pointSymbolizer.symbol.scale = scale;
				}
				break;
			}
		}
	});
	return pointSymbolizer;
};

GeoBeans.Format.KML.prototype.getDefaultSymbolizer = function(geomType){
	var symbolizer = null;
	switch(geomType){
		case GeoBeans.Geometry.Type.POINT:{
			symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
			var symbol = new GeoBeans.Style.Symbol();
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

GeoBeans.Format.KML.prototype.readIcon = function(kml){
	if(kml == null){
		return null;
	}

	var href = $(kml).find("href").text();
	return href;
};

GeoBeans.Format.KML.prototype.readScale = function(kml){
	if(kml == null){
		return null;
	}
	var scale = $(kml).text();
	return parseFloat(scale);
};


// 颜色模式没有考虑，如果不设置颜色，则为默认的颜色
// <LabelStyle id="ID">
//   <!-- inherited from ColorStyle -->
//   <color>ffffffff</color>            <!-- kml:color -->
//   <colorMode>normal</colorMode>      <!-- kml:colorModeEnum: normal or random -->

//   <!-- specific to LabelStyle -->
//   <scale>1</scale>                   <!-- float -->
// </LabelStyle>	
GeoBeans.Format.KML.prototype.readLabelStyle = function(kml){
	if(kml == null){
		return null;
	}
	var that = this;
	var textSymbolizer = this.getDefaultTextSymbolizer().clone();
	
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "color":{
				var color = that.readColor(this);
				textSymbolizer.fill.color = color;
				break;
			}
			case "scale":{
				var scale = that.readScale(this);
				textSymbolizer.font.size = textSymbolizer.font.size*scale;
				break;
			}
			default :
				break;
		}
	});

	return textSymbolizer;
};

// <color>ffffffff</color>,abgr
GeoBeans.Format.KML.prototype.readColor = function(kml){
	if(kml == null){
		return null;
	}
	var colorStr = $(kml).text();
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
};



GeoBeans.Format.KML.prototype.getDefaultTextSymbolizer = function(){
	var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
	textSymbolizer.fill.color.set(255,255,255,1);
	textSymbolizer.stroke.color.set(51,51,51,1);
	textSymbolizer.stroke.width = 1;
	textSymbolizer.font.family = "Helvetica";
	textSymbolizer.font.weight = GeoBeans.Style.Font.WeightType.Bold;
	textSymbolizer.font.size = 16;
	textSymbolizer.displaceX = 8;
	textSymbolizer.displaceY = -5;		
	textSymbolizer.labelProp = "name";
	return textSymbolizer;
};

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
GeoBeans.Format.KML.prototype.readLineStyle = function(kml){
	if(kml == null){
		return null;
	}

	var that = this;
	var lineSymbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.LINESTRING)).clone();
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "color":{
				var color = that.readColor(this);
				lineSymbolizer.stroke.color = color;
				break;
			}
			case "width":{
				var width = that.readWidth(this);
				lineSymbolizer.stroke.width = width;
				break;
			}
		}
	});
	return lineSymbolizer;	
};

GeoBeans.Format.KML.prototype.readWidth = function(kml){
	if(kml == null){
		return null;
	}
	var width = $(kml).text();
	return parseFloat(width);	
};


// <PolyStyle id="ID">
//   <!-- inherited from ColorStyle -->
//   <color>ffffffff</color>            <!-- kml:color -->
//   <colorMode>normal</colorMode>      <!-- kml:colorModeEnum: normal or random -->

//   <!-- specific to PolyStyle -->
//   <fill>1</fill>                     <!-- boolean -->
//   <outline>1</outline>               <!-- boolean -->
// </PolyStyle>
GeoBeans.Format.KML.prototype.readPolyStyle = function(kml){
	if(kml == null){
		return null;
	}
	var that = this;
	var polygonSymbolizer = (this.getDefaultSymbolizer(GeoBeans.Geometry.Type.POLYGON)).clone();
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "color":{
				var color = that.readColor(this);
				polygonSymbolizer.fill.color = color;
				break;
			}
			case "fill":{
				var fill = that.readFill(this);
				if(!fill){
					polygonSymbolizer.fill = null;
				}
				break;
			}
			case "outline":{
				var outline = that.readOutline(this);
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
};

// <fill>1</fill>
GeoBeans.Format.KML.prototype.readFill = function(kml){
	if(kml == null){
		return null;
	}
	var text = $(kml).text();
	var flag = parseInt(text);
	if(flag == 1){
		return true;
	}else{
		return false;
	}
};

GeoBeans.Format.KML.prototype.readOutline = function(kml){
	if(kml == null){
		return null;
	}
	var text = $(kml).text();
	var flag = parseInt(text);
	if(flag == 1){
		return true;
	}else{
		return false;
	}	
};


GeoBeans.Format.KML.prototype.readPlacemark = function(kml,style,fields){
	if(kml == null || style == null || fields == null){
		return null;
	}


	var featureType = null;
	var field = fields[0];
	if(field != null){
		featureType = field.featureType;
	}else{
		featureType = new GeoBeans.FeatureType();
	}

	var name = null;
	var styleName = null;
	var geometry = null;
	var that = this;
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "name":{
				name = $(this).text();
				break;
			}
			case "styleUrl":{
				styleName = that.readStyleUrl(this);
				break;
			}
			case "Point":{
				geometry = that.readPoint(this);
				break;
			}
			case "LineString":{
				geometry = that.readLineString(this);
				break;
			}
			case "Polygon":{
				geometry = that.readPolygon(this);
				break;
			}
			case "MultiGeometry":{
				geometry = that.readMultiGeometry(this);
				break;
			}
			default :
				break;
		}
	});


	var fid = $(kml).attr("id");
	if(fid == null){
		fid = GeoBeans.Utility.uuid();
	}

	var values = {
		name : name,
		geometry : geometry
	};
	var feature = new GeoBeans.Feature(featureType,fid,geometry,values);

	// 备注，不考虑MultiGeometry的情况
	// 设定了样式
	if(styleName != null){
		if(geometry != null && geometry.type != GeoBeans.Geometry.Type.COLLECTION){
			this.addFilterByID(style,styleName,fid);
		}
	}else{
		// 没有设定样式，采用默认样式
		if(geometry != null && geometry.type != GeoBeans.Geometry.Type.COLLECTION){
			var rule = this.getDefaultRuleByGeomType(geometry.type);
			if(rule != null){
				var ruleInStyle = this.getRuleFromStyle(rule.name,style);
				if(ruleInStyle == null){
					style.addRule(rule)
				}
				this.addFilterByID(style,rule.name,fid);
			}
		}
	}

	return feature;
};

//看读取出来的style里面有没有该rule
GeoBeans.Format.KML.prototype.getRuleFromStyle = function(ruleName,style){
	if(ruleName == null || style == null){
		return null;
	}
	var rules = style.rules;
	for(var i = 0; i < rules.length;++i){
		if(rules[i].name == ruleName){
			return rules[i];
		}
	}
	return null;
};
GeoBeans.Format.KML.prototype.createDefaultRules = function(documentXML){
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
};

GeoBeans.Format.KML.prototype.getDefaultRule = function(name,geomType){
	if(name == null || geomType == null){
		return null;
	}
	var symbolizer = this.getDefaultSymbolizer(geomType).clone();
	if(symbolizer == null){
		return null;
	}
	var rule = new GeoBeans.Style.Rule();
	rule.name = name;
	rule.symbolizer = symbolizer;
	if(geomType == GeoBeans.Geometry.Type.POINT){
		rule.textSymbolizer = this.getDefaultTextSymbolizer().clone();
	}
	return rule;	
};

GeoBeans.Format.KML.prototype.getDefaultRuleByGeomType = function(geomType){
	if(geomType == GeoBeans.Geometry.Type.POINT){
		return this.pointDefaultRule;
	}else if(geomType == GeoBeans.Geometry.Type.LINESTRING){
		return this.lineDefaultRule;
	}else if(geomType == GeoBeans.Geometry.Type.POLYGON){
		return this.polygonDefaultRule;
	}
	return null;	
};


GeoBeans.Format.KML.prototype.addFilterByID = function(style,styleName,fid){
	if(style == null || styleName == null || fid == null){
		return;
	}

	var rules = style.rules;
	for(var i = 0; i < rules.length;++i){
		var r = rules[i];
		if(r.name == styleName){
			var filter = r.filter;
			if(filter == null){
				filter = new GeoBeans.Filter.IDFilter();
				r.filter = filter;
			}	
			filter.addID(fid);
		}
	}
};

// <styleUrl>#exampleStyleDocument</styleUrl>
GeoBeans.Format.KML.prototype.readStyleUrl = function(kml){
	if(kml == null){
		return null;
	}
	var url = $(kml).text();
	if(url.indexOf("#") == 0){
		return url.slice(1,url.length);
	}
	return null;
};

GeoBeans.Format.KML.prototype.readPoint = function(kml){
	if(kml == null){
		return null;
	}

	var coordinates = $(kml).find("coordinates").text();
	var point = this.readPointCoords(coordinates);
	return point;
};

GeoBeans.Format.KML.prototype.readLineString = function(kml){
	if(kml == null){
		return null;
	}

	var coordinates = $(kml).find("coordinates").text();
	var lineString = this.readLineStringCoords(coordinates);
	return lineString;
};

GeoBeans.Format.KML.prototype.readPolygon = function(kml){
	if(kml == null){
		return null;
	}

	var rings = [];
	var coordinates_out = $(kml).find("outerBoundaryIs>LinearRing>coordinates").text();
	var lineString_out = this.readLineStringCoords(coordinates_out);

	if(lineString_out != null){
		rings.push(lineString_out);
	}

	var that = this;
	$(kml).find("innerBoundaryIs>LinearRing>coordinates").each(function(){
		var coordinates_in = $(this).text(); 
		var lineSring_in = that.readLineStringCoords(coordinates_in);
		if(lineSring_in != null){
			rings.push(lineSring_in);
		}
	});

	

	if(rings.length == 0){
		return null;
	}
	return (new GeoBeans.Geometry.Polygon(rings));
};

GeoBeans.Format.KML.prototype.readMultiGeometry = function(kml){
	if(kml == null){
		return null;
	}
	var that = this;
	var geometry = new GeoBeans.Geometry.GeometryCollection();
	$(kml).children().each(function(){
		var tagName = this.tagName;
		var g = null;
		switch(tagName){
			case "Point":{
				g = that.readPoint(this);
				break;
			}
			case "LineString":{
				g = that.readLineString(this);
				break;
			}
			case "Polygon":{
				g = that.readPolygon(this);
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
};


GeoBeans.Format.KML.prototype.readPointCoords = function(coordinates){
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
};

GeoBeans.Format.KML.prototype.readLineStringCoords = function(coordinates){
	if(coordinates == null || coordinates.trim() == ""){
		return null;
	}
	var points = [];
	var array = coordinates.replace(/\n/g," ").trim().split(/[ ]+/);
	for(var i = 0; i < array.length;++i){
		var point  = this.readPointCoords(array[i]);
		if(point != null){
			points.push(point);
		}
	}

	if(points.length <= 1){
		return null;
	}
	var lineString = new GeoBeans.Geometry.LineString(points);
	return lineString;	
};
