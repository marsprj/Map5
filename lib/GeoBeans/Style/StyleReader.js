GeoBeans.StyleReader = GeoBeans.Class({
	filterReader : null,

	initialize : function(){
		this.filterReader = new GeoBeans.FilterReader();
	},
	read : function(xml){
		var style = null;
		var xmlDoc = $(xml);
		var StyledLayerDescriptorXml = xmlDoc.find("StyledLayerDescriptor");
		if(StyledLayerDescriptorXml.length != 1){
			return null;
		}
		var tagName = StyledLayerDescriptorXml.children()[0].tagName;
		tagName = tagName.slice(tagName.lastIndexOf(":")+1
			,tagName.length);
		if(tagName == "UserLayer"){
			style = this.parseUserLayer(StyledLayerDescriptorXml.children());
		}else if(tagName == "NamedLayer"){
			style = this.parseNamedLayer(StyledLayerDescriptorXml.children());
		}

		return style;
	},

	parseUserLayer : function(xml){
		var userStyleXML = xml.find("UserStyle");
		if(userStyleXML.length != 1){
			return null;
		}
		var style = this.parseUserStyle(xml);
		return style;
	},

	parseUserStyle : function(xml){
		var name = xml.find("Name:first").text();
		var featureTypeXML = xml.find("FeatureTypeStyle");
		if(featureTypeXML.length != 1){
			return null;
		}
		var style = this.parseFeatureTypeXML(xml);

		style.name = name;
		return style;
	},

	parseFeatureTypeXML : function(xml){
		// var rules = [];
		var style = new GeoBeans.Style.FeatureStyle();
		var that = this;
		xml.find("Rule").each(function(){
			var rule = that.parseRule($(this));
			style.addRule(rule);
		});		
		return style;
	},

	parseRule : function(xml){
		var that = this;
		var rule = new GeoBeans.Rule();
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "Name"){
				rule.name = $(this).text();
			}else if(tagName == "PointSymbolizer"){
				var pointSymbolizer = that.parsePointSymbolizer($(this));
				rule.symbolizer = pointSymbolizer;
			}else if(tagName == "LineSymbolizer"){
				var lineSymbolizer = that.parseLineSymbolizer($(this));
				rule.symbolizer = lineSymbolizer;
			}else if(tagName == "PolygonSymbolizer"){
				var polygonSymbolizer = that.parsePolygonSymbolizer($(this));
				rule.symbolizer = polygonSymbolizer;
			}else if(tagName == "TextSymbolizer"){
				var textSymbolizer = that.parseTextSymbolizer($(this));
				rule.textSymbolizer = textSymbolizer;
			}else if(tagName == "MinScaleDenominator"){
				var minScale = $(this).text();
				rule.minScale = minScale;
			}else if(tagName == "MaxScaleDenominator"){
				var maxScale = $(this).text();
				rule.maxScale = maxScale;
			}else if(tagName == "Filter"){
				var filter = that.filterReader.read($(this));
				rule.filter = filter;
			}
		});
		var name = xml.find("Name:first").text();
		var title = xml.find("Title:first").text();

		return rule;
	},

	parsePointSymbolizer : function(xml){
		var that = this;
		var pointSymbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		pointSymbolizer.stroke = null;
		pointSymbolizer.fill = null;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "Graphic"){
				that.parseGraphic($(this),pointSymbolizer);
			}else if(tagName == "Geometry"){

			}
		});

		return pointSymbolizer;
	},

	parseLineSymbolizer : function(xml){
		var that = this;
		var lineSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		lineSymbolizer.fill = null;
		lineSymbolizer.stroke = null;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "Stroke"){
				var stroke = that.parseStroke($(this));
				lineSymbolizer.stroke = stroke;
			}else if(tagName == "Geometry"){
				//未完待续
			}else if(tagName == "WellKnownName"){
				var symbol = that.parseSymbol($(this));
				lineSymbolizer.symbol = symbol;
			}else if(tagName == "Fill"){
				var fill = that.parseFill($(this));
				lineSymbolizer.fill = fill;
			}
		});
		return lineSymbolizer;
	},

	parsePolygonSymbolizer : function(xml){
		var that = this;
		var polygonSymbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		polygonSymbolizer.stroke = null;
		polygonSymbolizer.fill = null;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "Fill"){
				var fill = that.parseFill($(this));
				polygonSymbolizer.fill = fill;
			}else if(tagName == "Stroke"){
				var stroke = that.parseStroke($(this));
				polygonSymbolizer.stroke = stroke;
			}else if(tagName == "Geometry"){
				var geomName = that.parseGeometry($(this));
				polygonSymbolizer.geomName = geomName;
			}else if(tagName == "WellKnownName"){
				var symbol = that.parseSymbol($(this));
				polygonSymbolizer.symbol = symbol;
			}
		});
		return polygonSymbolizer;
	},

    // <sld:Graphic>
    //     <sld:Mark>
    //         <sld:Fill>
    //             <sld:CssParameter name="fill">#00BFBF</sld:CssParameter>
    //             <sld:CssParameter name="fill-opacity">0.5</sld:CssParameter>
    //         </sld:Fill>
    //         <sld:Stroke>
    //             <sld:CssParameter name="stroke">#FFFF00</sld:CssParameter>
    //             <sld:CssParameter name="stroke-opacity">0.15</sld:CssParameter>
    //             <sld:CssParameter name="stroke-width">3.0</sld:CssParameter>
    //         </sld:Stroke>
    //     </sld:Mark>
    //     <sld:Size>6.0</sld:Size>
    // </sld:Graphic>	
	parseGraphic : function(xml,pointSymbolizer){
		var that = this;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "Size"){
				var size = parseFloat($(this).text());
				pointSymbolizer.size = size;
				// that.parseSize($(this),pointSymbolizer);
			}else if(tagName == "Mark"){
				that.parseMark($(this),pointSymbolizer);
			}

		});
	},
    // <sld:Mark>
    //     <sld:Fill>
    //         <sld:CssParameter name="fill">#00BFBF</sld:CssParameter>
    //         <sld:CssParameter name="fill-opacity">0.5</sld:CssParameter>
    //     </sld:Fill>
    //     <sld:Stroke>
    //         <sld:CssParameter name="stroke">#FFFF00</sld:CssParameter>
    //         <sld:CssParameter name="stroke-opacity">0.15</sld:CssParameter>
    //         <sld:CssParameter name="stroke-width">3.0</sld:CssParameter>
    //     </sld:Stroke>
    // </sld:Mark>
	parseMark : function(xml,pointSymbolizer){
		var that = this;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "WellKnownName"){
				var symbol = that.parseSymbol($(this));
				pointSymbolizer.symbol = symbol;
			}
			if(tagName == "Fill"){
				var fill = that.parseFill($(this));
				pointSymbolizer.fill = fill;
			}else if(tagName == "Stroke"){
				var stroke = that.parseStroke($(this));
				pointSymbolizer.stroke = stroke;
			}			
		});
	},

	parseSize : function(xml,pointSymbolizer){
		var that = this;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			if(tagName == "Literal"){
				var size = $(this).text();
				pointSymbolizer.size = parseFloat(size);
			}
		});
	},

	parseStroke : function(xml){
		var stroke = new GeoBeans.Stroke();
		var strokeColr = null;
		var opacity = null;
		var strokeWidth = null;
		xml.children().each(function(){
			var name = $(this).attr("name");
			if(name == "stroke"){
				strokeColr = $(this).text();
			}else if(name == "stroke-opacity"){
				opacity = $(this).text();
			}else if(name == "stroke-width"){
				strokeWidth = parseFloat($(this).text());
			}
		});
		var color = new GeoBeans.Color();
		color.setByHex(strokeColr,opacity);
		stroke.color = color;
		stroke.width = strokeWidth;
		return stroke;
	},

	parseFill : function(xml){
		var fill = new GeoBeans.Fill();
		var value = null;
		var opacity = null;
		xml.children().each(function(){
			var name = $(this).attr("name");
			if(name == "fill")	{
				value = $(this).text();
			}else if(name == "fill-opacity"){
				opacity = $(this).text();
			}
		});

		var color = new GeoBeans.Color();
		color.setByHex(value,opacity);
		fill.color = color;
		return fill;
	},

	parseSymbol : function(xml){
		var text = xml.text();
		if(text != null || text != ""){
			var symbol = new GeoBeans.Symbol(text,null);
			return symbol;
		}
		return null;
	},

	parseNamedLayer : function(xml){
		return null;
	},

	parseTextSymbolizer : function(xml){
		var that = this;
		var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
		textSymbolizer.fill = null;
		textSymbolizer.stroke = null;
		xml.children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);

			if(tagName == "Label"){
				that.parseLabel($(this),textSymbolizer);
			}else if(tagName == "Font"){
				var font = that.parseFont($(this));
				textSymbolizer.font = font;
			}else if(tagName == "LabelPlacement"){
				/****未完待续***/
			}else if(tagName == "Fill"){
				var fill = that.parseFill($(this));
				textSymbolizer.fill = fill;
			}else if(tagName == "Stroke"){
				var stroke = that.parseStroke($(this));
				textSymbolizer.stroke = stroke;
			}
		});
		return textSymbolizer;
	},

	parseLabel : function(xml,textSymbolizer){
		var propertyNameXml = $(xml).find("PropertyName");
		if(propertyNameXml.length == 1){
			var prop = propertyNameXml.text();
			textSymbolizer.labelProp = prop;
		}else{
			var name = xml.text();
			textSymbolizer.labelText = name;
		}
	},

	parseFont : function(xml){
		var font = new GeoBeans.Font();
		xml.children().each(function(){
			var name = $(this).attr("name");
			if(name == "font-family"){
				var family = $(this).text();
				font.family = family;
			}else if(name == "font-size"){
				var size = parseFloat($(this).text());
				font.size = size;
			}else if(name == "font-style"){
				var style = $(this).text();
				if(style == "normal"){
					font.style = GeoBeans.Font.StyleType.Normal;
				}else if(style == "italic"){
					font.style = GeoBeans.Font.StyleType.Italic;
				}else if(style == "oblique"){
					font.style = GeoBeans.Font.StyleType.Oblique;
				}
			}else if(name == "font-weight"){
				var weight = $(this).text();
				if(weight == "normal"){
					font.weight = GeoBeans.Font.WeightType.Normal;
				}else if(weight == "bold"){
					font.weight = GeoBeans.Font.WeightType.Bold;
				}
			}
		});
		return font;
	},

	parseGeometry : function(xml){
		var propertyNameXml = $(xml).find("PropertyName");
		if(propertyNameXml.length == 1){
			var prop = propertyNameXml.text();
			return prop;
		}
		return null;
	}

});