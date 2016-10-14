/**
 * @classdesc
 * KML数据格式类
 * @class
 */
GeoBeans.Format.KML = GeoBeans.Class(GeoBeans.Format,{
	
	geometryName : "geometry",

	initialize : function(options){
		if(isValid(options.geometryName)){
			this.geometryName = options.geometryName;
		}
	},
});


/**
 * 读取Features
 * @param  {tetxt} text geojson字符串
 * @return {Array.<GeoBeans.Feature>}      Feature数组
 */
GeoBeans.Format.KML.prototype.readFeatures = function(kml){
	if(!isValid(kml)){
		return [];
	}

	var features = [];	
	try{
		var styles = this.readStyle(kml);
		this.styles = styles;

		var documentKML = $(kml).find("Document");

		var that = this;
		documentKML.children().each(function(){
			var tagName = this.tagName;

			switch(tagName){
				case "Folder":{
					var folderFeatures = that.readFolder(this);
					features = features.concat(folderFeatures);
					break;
				}
				case "Placemark":{
					var feature = that.readPlacemark(this);
					if(isValid(feature)){
						features.push(feature);
					}
				}
			}
		});
	}
	catch(e){
		console.log(e.message);
	}
	finally{
		return features;
	}
};

/**
 * 读取文件夹
 * @private
 */
GeoBeans.Format.KML.prototype.readFolder = function(kml){
	if(!isValid(kml)){
		return [];
	}
	var that = this;
	var features = [];
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "Folder":{
				var array = that.readFolder(this);
				if(isValid(array)){
					features = features.concat(array);
				}
			}
			case "Placemark":{
				var feature = that.readPlacemark(this);
				if(isValid(feature)){
					features.push(feature);
				}
			}
		}
	});

	return features;
};

/**
 * 读取样式的列表
 * @private
 */
GeoBeans.Format.KML.prototype.readStyle = function(kml){
	if(!isValid(kml)){
		return [];
	}


	var that = this;
	var styles = [];
	var documentKML = $(kml).find("Document");
	documentKML.children().each(function(){
		var tagName = this.tagName;

		switch(tagName){
			case "Folder":{
				break;
			}
			case "Style":{
				var style = that.readStyleNode(this);
				styles.push(style);
				break;
			}
			case "StyleMap":{
				break;
			}
			default:
				break;
		}
	});
	return styles;
}

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
// 
/**
 * 读取样式
 * @private
 */
GeoBeans.Format.KML.prototype.readStyleNode = function(kml){
	if(!isValid(kml)){
		return null;
	}

	var name = $(kml).attr("id");
	if(!isValid(name)){
		return null;
	}
	var style = {
		name : name
	};

	var that = this;
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "IconStyle":{
				var iconStyle = that.readIconStyle(this);
				style.iconStyle = iconStyle;
				break;
			}
			case "LabelStyle":{
				var labelStyle = that.readLabelStyle(this);
				style.labelStyle = labelStyle;
				break;
			}
			case "LineStyle":{
				var lineStyle = that.readLineStyle(this);
				style.lineStyle = lineStyle;
				break;
			}
			case "PolyStyle":{
				var polyStyle = that.readPolyStyle(this);
				style.polyStyle = polyStyle;
				break;
			}
			default :
				break;
		}
	});

	return style;
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
	if(!isValid(kml)){
		return {};
	}

	var iconStyle = {};
	var that = this;
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "Icon":{
				var url = that.readIcon(this);
				iconStyle.icon = url;
				break;
			}
			case "scale":{
				var scale = that.readScale(this);
				iconStyle.scale = scale;
				break;
			}
		}
	});
	return iconStyle;
};


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
	if(!isValid(kml)){
		return {};
	}

	var that = this;
	var labelStyle = {};
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "color":{
				var color = that.readColor(this);
				labelStyle.color = color;
				break;
			}
			case "scale":{
				var scale = that.readScale(this);
				labelStyle.scale = scale;
				break;
			}
			default :
				break;
		}
	});

	return labelStyle;
};

// <color>ffffffff</color>,abgr
GeoBeans.Format.KML.prototype.readColor = function(kml){
	if(!isValid(kml)){
		return null;
	}
	var colorStr = $(kml).text();
	if(colorStr.length == 8){
		var color = new GeoBeans.Color();
		color.setAbgr(colorStr);
		return color;
	}

	if(colorStr.length == 9 && colorStr.indexOf("#") == 0){
		var color = new GeoBeans.Color();
		color.setAbgr(colorStr.slice(1,colorStr.length));
		return color;
	}
	return (new GeoBeans.Color());
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
	if(!isValid(kml)){
		return null;
	}	

	var that = this;
	var lineStyle = {};
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "color":{
				var color = that.readColor(this);
				lineStyle.color = color;
				break;
			}
			case "width":{
				var width = that.readWidth(this);
				lineStyle.width = width;
				break;
			}
		}
	});
	return lineStyle;
};

GeoBeans.Format.KML.prototype.readWidth = function(kml){
	if(!isValid(kml)){
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
	if(!isValid(kml)){
		return null;
	}
	var that = this;
	var polyStyle = {};
	$(kml).children().each(function(){
		var tagName = this.tagName;
		switch(tagName){
			case "color":{
				var color = that.readColor(this);
				polyStyle.color = color;
				break;
			}
			case "fill":{
				var fill = that.readFill(this);
				polyStyle.fill = fill;
				break;
			}
			case "outline":{
				var outline = that.readOutline(this);
				polyStyle.outline = outline;
				break;
			}
			default :
				break;
		}
	});
	return polyStyle;	
};

// <fill>1</fill>
GeoBeans.Format.KML.prototype.readFill = function(kml){
	if(!isValid(kml)){
		return true;
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
	if(!isValid(kml)){
		return true;
	}
	var text = $(kml).text();
	var flag = parseInt(text);
	if(flag == 1){
		return true;
	}else{
		return false;
	}	
};



GeoBeans.Format.KML.prototype.readPlacemark = function(kml){
	if(!isValid(kml)){
		return null;
	}

	var name = null,styleName = null,geometry = null;
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

	var values = {
		name : name,
		geometry : geometry
	};

	var feature = new GeoBeans.Feature({
		properties : values,
		geometry : geometry
	});

	var style = this.getStyleByName(styleName);
	var symbolizers = this.getSymbolizersByGeometry(style,geometry);
	if(isValid(symbolizers)){
		if(isValid(symbolizers.symbolizer)){
			feature.symbolizer = symbolizers.symbolizer;
		}
		if(isValid(symbolizers.textSymbolizer)){
			feature.textSymbolizer = symbolizers.textSymbolizer;
		}
	}

	return feature;
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

GeoBeans.Format.KML.prototype.getStyleByName = function(styleName){
	if(!isValid(styleName) || !isValid(this.styles)){
		return null;
	}
	for(var i = 0; i < this.styles.length;++i){
		var style = this.styles[i];
		if(style.name == styleName){
			return style;
		}
	}
	return null;
};
// 按照空间类型返回样式
GeoBeans.Format.KML.prototype.getSymbolizersByGeometry = function(style,geometry){
	if(!isValid(geometry) || !isValid(style)){
		return null;
	}

	var type = geometry.type;
	var result = {};
	switch(type){
		case GeoBeans.Geometry.Type.POINT:{
			if(isValid(style.pointSymbolizer)){
				result.symbolizer = style.pointSymbolizer;
			}else{
				if(isValid(style.iconStyle)){
					var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
					var symbol = new GeoBeans.Style.Symbol();
					if(isValid(style.iconStyle.icon)){
						symbol.icon = style.iconStyle.icon;
					}else{
						symbol.icon = "../images/ylw-pushpin.png";
					}
					if(isValid(style.iconStyle.scale)){
						symbol.scale = style.iconStyle.scale;
					}
					symbolizer.symbol = symbol;
					result.symbolizer = symbolizer;
					style.pointSymbolizer = symbolizer;
				}else{
					var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
					var symbol = new GeoBeans.Style.Symbol();
					symbol.icon = "../images/ylw-pushpin.png";
					symbolizer.symbol = symbol;
					result.symbolizer = symbolizer;
					style.pointSymbolizer = symbolizer;
				}
			}
			if(isValid(style.textSymbolizer)){
				result.textSymbolizer = style.textSymbolizer;
			}else{
				if(isValid(style.labelStyle)){
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
					if(isValid(style.labelStyle.color)){
						textSymbolizer.fill.color = style.labelStyle.color;
					}
					if(isValid(style.labelStyle.scale)){
						textSymbolizer.font.size = textSymbolizer.font.size * style.labelStyle.scale;
					}
					result.textSymbolizer = textSymbolizer;
					style.textSymbolizer = textSymbolizer;
				}else{
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
					result.textSymbolizer = textSymbolizer;
					style.textSymbolizer = textSymbolizer;
				}
			}
			break;
		}
		case GeoBeans.Geometry.Type.LINESTRING:{
			if(isValid(style.lineSymbolizer)){
				result.symbolizer = style.lineSymbolizer;
			}else{
				if(isValid(style.lineStyle)){
					var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
					if(isValid(style.lineStyle.color)){
						symbolizer.stroke.color = style.lineStyle.color;
					}else{
						symbolizer.stroke.color.set(255,0,0,1);
					}
					if(isValid(style.lineStyle.width)){
						symbolizer.stroke.width = style.lineStyle.width;
					}
					result.symbolizer = symbolizer;
					style.lineSymbolizer = symbolizer;
				}else{
					var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
					symbolizer.stroke.color.set(255,0,0,1);
					result.symbolizer = symbolizer;
					style.lineSymbolizer = symbolizer;
				}
			}
			break;
		}
		case GeoBeans.Geometry.Type.POLYGON:{
			if(isValid(style.polygonSymbolizer)){
				result.symbolizer = style.polygonSymbolizer;
			}else{
				if(isValid(style.polyStyle)){
					var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
					if(isValid(style.polyStyle.color)){
						symbolizer.fill.color = style.polyStyle.color;
					}else{
						symbolizer.fill.color.set(255,0,0,1);
					}
					if(isValid(style.polyStyle.fill)){
						if(!style.polyStyle.fill){
							symbolizer.fill = null;
						}
					}
					if(isValid(style.polyStyle.outline)){
						if(!style.polygonSymbolizer.outline){
							symbolizer.stroke = null;
						}
					}
					if(isValid(style.lineStyle)){
						if(isValid(style.lineStyle.color)){
							symbolizer.stroke.color = style.lineStyle.color;
						}else{
							symbolizer.stroke.color.set(255,0,0,1);
						}
						if(isValid(style.lineStyle.width)){
							symbolizer.stroke.width = style.lineStyle.width;
						}
					}else{
						symbolizer.stroke.color.set(0,0,255,1);
					}
					style.polygonSymbolizer = symbolizer;
					result.symbolizer = symbolizer;
				}else{
					var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
					symbolizer.fill.color.set(255,0,0,1);
					symbolizer.stroke.color.set(0,0,255,1);
					style.polygonSymbolizer = symbolizer;
					result.symbolizer = symbolizer;
				}
			}
			break;
		}
	}

	return result;
};