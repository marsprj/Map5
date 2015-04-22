GeoBeans.StyleWriter = GeoBeans.Class({
	filterWriter : null,


	initialize : function(){
		this.filterWriter = new GeoBeans.FilterWriter();
	},

	write : function(style){
		if(style == null){
			return null;
		}
		var xml = null;
		if(style.type == GeoBeans.Style.Type.FeatureType){
			xml = this.writeFeature(style);
		}else if(style.type == GeoBeans.Style.Type.RasterType){
			xml = this.writeRaster(style);
		}
		if(xml != null){
			var xmlString = (new XMLSerializer()).serializeToString(xml);
			return xmlString ;
		}
		return null;
	},

	writeFeature : function(style){

		var xml = $.parseXML('<?xml version="1.0" encoding="UTF-8"?>'
				+ '<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" '
				+ 'xmlns:sld="http://www.opengis.net/sld" '
				+ 'xmlns:ogc="http://www.opengis.net/ogc" '
				+ 'xmlns:gml="http://www.opengis.net/gml" version="1.0.0"/>');
		var userLayerNode = xml.createElement("sld:UserLayer");
		var layerFeatureConstraintsNode = xml.createElement("sld:LayerFeatureConstraints");
		var FeatureTypeConstraintNode = xml.createElement("sld:FeatureTypeConstraint");
		$(layerFeatureConstraintsNode).append(FeatureTypeConstraintNode);
		$(userLayerNode).append(layerFeatureConstraintsNode);

		var userStyleNode = this.writeUserStyle(xml,style);
		$(userLayerNode).append(userStyleNode);
		$('StyledLayerDescriptor',xml).append(userLayerNode);
		return xml;
	},

	writeRaster : function(style){
		return null;
	},

	writeUserStyle: function(xml,style){
		var userStyleXML = xml.createElement("sld:UserStyle");
		var name = style.name;
		var nameXML = xml.createElement("sld:Name");
		$(nameXML).text(name);
		$(userStyleXML).append(nameXML);
		var featureTypeXML = this.writeFeatureType(xml,style);
		$(userStyleXML).append(featureTypeXML);
		return userStyleXML;
	},

	writeFeatureType:function(xml,style){
		var featureTypeXML = xml.createElement("sld:FeatureTypeStyle");
		var rules = style.rules;
		for(var i = 0; i < rules.length;++i){
			var rule = rules[i];
			if(rule != null){
				var ruleXML = this.writeRule(xml,rule);
				$(featureTypeXML).append(ruleXML);				
			}

		}
		return featureTypeXML;
	},

	writeRule:function(xml,rule){
		var ruleXML = xml.createElement("sld:Rule");
		var name = rule.name;
		if(name != null){
			var ruleNameXML = xml.createElement("sld:Name");
			$(ruleNameXML).text(name);
			$(ruleXML).append(ruleNameXML);
		}

		var filter = rule.filter;
		if(filter != null){
			var filterXML = this.filterWriter.write(xml,filter);
			$(ruleXML).append(filterXML);
		}
		var symbolizer = rule.symbolizer;
		if(symbolizer != null){
		var type = symbolizer.type;
			if(type == GeoBeans.Symbolizer.Type.Point){
				var pointSymbolizerXML = this.writePointSymbolizer(xml,symbolizer);
				$(ruleXML).append(pointSymbolizerXML);
			}else if(type == GeoBeans.Symbolizer.Type.Line){
				var lineSymbolizerXML = this.writeLineSymbolizer(xml,symbolizer);
				$(ruleXML).append(lineSymbolizerXML);
			}else if(type == GeoBeans.Symbolizer.Type.Polygon){
				var polygonXML = this.writePolygonSymbolizer(xml,symbolizer);
				$(ruleXML).append(polygonXML);
			}			
		}


		var textSymbolizer = rule.textSymbolizer;
		if(textSymbolizer != null){
			var textSymbolizerXML = this.writeTextSymbolizer(xml,textSymbolizer);
			$(ruleXML).append(textSymbolizerXML);
		}

		return ruleXML;
	},

	writePointSymbolizer : function(xml,pointSymbolizer){
		var pointSymbolizerXML = xml.createElement("sld:PointSymbolizer");
		var graphicXML = xml.createElement("sld:Graphic");
		var markXML = xml.createElement("sld:Mark");
		var fill = pointSymbolizer.fill;
		if(fill != null){
			var fillXML = this.writeFill(xml,fill);
			$(markXML).append(fillXML);
		}
		var stroke = pointSymbolizer.stroke;
		if(stroke != null){
			var strokeXML = this.writeStroke(xml,stroke);
			$(markXML).append(strokeXML);
		}
		$(graphicXML).append(markXML);

		var size = pointSymbolizer.size;
		// if(size != null){
		// 	var sizeXML = this.writeSize(xml,size);
		// 	$(markXML).append(sizeXML);
			// $(graphicXML).append(sizeXML);
		// }
		
		var sizeXML = xml.createElement("sld:Size");
		$(sizeXML).text(size);
		$(graphicXML).append(sizeXML);

		
		
		$(pointSymbolizerXML).append(graphicXML);
		return pointSymbolizerXML;
	},


	writeLineSymbolizer : function(xml,lineSymbolizer){
		var lineSymbolizerXML = xml.createElement("sld:LineSymbolizer");
		var stroke = lineSymbolizer.stroke;
		if(stroke != null){
			var strokeXML = this.writeStroke(xml,stroke);
			$(lineSymbolizerXML).append(strokeXML);
		}
		return lineSymbolizerXML;
	},

	writePolygonSymbolizer: function(xml,polygonSymbolizer){
		var polygonSymbolizerXML = xml.createElement("sld:PolygonSymbolizer");
		var geomName = polygonSymbolizer.geomName;
		if(geomName != null){
			 var geomXML = this.writeGeom(xml,geomName);
			 $(polygonSymbolizerXML).append(geomXML);
		}
		var fill = polygonSymbolizer.fill;
		if(fill != null){
			var fillXML = this.writeFill(xml,fill);
			$(polygonSymbolizerXML).append(fillXML);
		}
		var stroke = polygonSymbolizer.stroke;
		if(stroke != null){
			var strokeXML = this.writeStroke(xml,stroke);
			$(polygonSymbolizerXML).append(strokeXML);
		}
		return polygonSymbolizerXML;
	},

	writeFill : function(xml,fill){
		var fillXML = xml.createElement("sld:Fill");
		var color = fill.color;
		var hex = color.getHex();
		var colorXML = xml.createElement("sld:CssParameter");
		$(colorXML).attr("name","fill").text(hex);
		$(fillXML).append(colorXML);
		var opacityXML = xml.createElement("sld:CssParameter");
		var opacity = color.getOpacity();
		$(opacityXML).attr("name","fill-opacity").text(opacity);
		$(fillXML).append(opacityXML);
		return fillXML;
	},

	writeStroke:function(xml,stroke){
		var strokeXML = xml.createElement("sld:Stroke");
		var color = stroke.color;
		var hex = color.getHex();
		var colorXML = xml.createElement("sld:CssParameter");
		$(colorXML).attr("name","stroke").text(hex);
		$(strokeXML).append(colorXML);

		var opacity = color.getOpacity();
		var opacityXML = xml.createElement("sld:CssParameter");
		$(opacityXML).attr("name","stroke-opacity").text(opacity);
		$(strokeXML).append(opacityXML);

		var width = stroke.width;
		var widthXML = xml.createElement("sld:CssParameter");
		$(widthXML).attr("name","stroke-width").text(width);
		$(strokeXML).append(widthXML);
		return strokeXML;
	},

	writeSize : function(xml,size){
		var sizeXML = xml.createElement("sld:Size");
		var valueXML = xml.createElement("ogc:Literal");
		$(valueXML).text(size);
		$(sizeXML).append(valueXML);
		return sizeXML;
	},

	writeGeom : function(xml,geom){
		var geomXML = xml.createElement("sld:Geometry");
		var propXML = xml.createElement("ogc:PropertyName");
		$(propXML).text(geom);
		$(geomXML).append(propXML);
		return geomXML;
	},

	writeTextSymbolizer:function(xml,textSymbolizer){
		var textSymbolizerXML = xml.createElement("sld:TextSymbolizer");
		var labelText = textSymbolizer.labelText;
		if(labelText != null){
			var labelTextXML = xml.createElement("sld:Label");
			$(labelTextXML).text(labelText);
			$(textSymbolizerXML).append(labelTextXML);
		}
		var labelProp = textSymbolizer.labelProp;
		if(labelProp != null){
			var labelXML = xml.createElement("sld:Label");
			var labelPropXML = xml.createElement("ogc:PropertyName");
			$(labelPropXML).text(labelProp);
			$(labelXML).append(labelPropXML);
			$(textSymbolizerXML).append(labelXML);
		}
		var font = textSymbolizer.font;
		if(font != null){
			var fontXML = this.writeFont(xml,font);
			$(textSymbolizerXML).append(fontXML);
		}
		var fill = textSymbolizer.fill;
		if(fill != null){
			var fillXML = this.writeFill(xml,fill);
			$(textSymbolizerXML).append(fillXML);
		}
		var stroke = textSymbolizer.stroke;
		if(stroke != null){
			var strokeXML = this.writeStroke(xml,stroke);
			$(textSymbolizerXML).append(strokeXML);
		}
		// sld:LabelPlacement
		// 未完待续
		return textSymbolizerXML;
	},

	writeFont : function(xml,font){
		var fontXML = xml.createElement("sld:Font");
		var family = font.family;
		if(family != null){
			var familyXML = xml.createElement("sld:CssParameter");
			$(familyXML).attr("name","font-family").text(family);
			$(fontXML).append(familyXML);
		}

		var size = font.size;
		if(size != null){
			var sizeXML = xml.createElement("sld:CssParameter");
			$(sizeXML).attr("name","font-size").text(size);
			$(fontXML).append(sizeXML);
		}

		var style = font.style;
		if(style != null){
			var styleXML = xml.createElement("sld:CssParameter");
			$(styleXML).attr("name","font-style").text(style);
			$(fontXML).append(styleXML);
		}

		var weight = font.weight;
		if(weight != null){
			var weightXML = xml.createElement("sld:CssParameter");
			$(weightXML).attr("name","font-weight").text(weight);
			$(fontXML).append(weightXML);
		}
		return fontXML;
	}

});