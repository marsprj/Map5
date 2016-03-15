GeoBeans.Renderer = GeoBeans.Class({
	
	canvas  : null,
	context : null,
	
	initialize : function(canvas){
		this.canvas  = canvas;
		this.context = canvas.getContext('2d');
	},
	
	draw : function(feature, symbolizer, transformation){
		
		var geometry = feature.geometry;
		if(geometry != null)		{
			this.drawGeometry(geometry,symbolizer, transformation);
		}
	},

	save : function(){
		this.canvas.save();
	},

	restore : function(){
		this.canvas.restore();
	},

	getGlobalAlpha : function(){
		return this.context.globalAlpha;
	},

	setGlobalAlpha : function(alpha){
		this.context.globalAlpha = alpha;
	},
	
	/************************************************************/
	/*	Draw Geometry											*/
	/************************************************************/
	drawGeometry : function(geometry, symbolizer, transformation){
		
		switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:
			this.drawPoint(geometry,symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOINT:
			this.drawMultiPoint(geometry,symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.LINESTRING:
			this.drawLineString(geometry,symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:
			this.drawMultiLineString(geometry,symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.POLYGON:
			this.drawPolygon(geometry, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:
			this.drawMultiPolygon(geometry, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.CIRCLE:
			this.drawCircle(geometry,symbolizer,transformation);
			break;
		default: 
			break;			
		};
	},
	
	drawPoint : function(point, symbolizer, transformation){
		var spt;
		var r = symbolizer.size;
		
		// draw vector point
		spt = transformation.toScreenPoint(point.x, point.y);			
		this.context.beginPath();
		this.context.arc(spt.x, spt.y, r, 0, 2 * Math.PI, false);  
		this.context.closePath();
				
		//this.context.fillStyle = 'rgba(0,255,0,0.25)';
		this.context.fill();
		if(symbolizer.stroke != null){
			this.context.stroke();
		}	
	},
	
	drawLineString : function(line, symbolizer, transformation){
		
		if(line.points.length<1){
			return;
		}
		
		var pt = null;
		var spt = null;		
		var context = this.context;
		
		context.beginPath();
		pt = line.points[0];
		spt = transformation.toScreenPoint(pt.x, pt.y);
		context.moveTo(spt.x, spt.y);
		
		for(var i=1, len=line.points.length; i<len; i++){
			pt = line.points[i];
			spt = transformation.toScreenPoint(pt.x, pt.y);
			context.lineTo(spt.x, spt.y);
		}		 
		context.stroke();
	},
	
	drawPolygon : function(polygon, symbolizer, transformation){

		var pt = null;
		var ring = null;
		var numRing = 0;
		var numPoints = 0;		
		var context = this.context;
		var i, j;

		context.beginPath();		
		numRing = polygon.rings.length;
		for(i=0; i<numRing; i++){
			ring = polygon.rings[i];
			
			numPoints = ring.points.length;
			pt = ring.points[0];
			spt = transformation.toScreenPoint(pt.x, pt.y);
			context.moveTo(spt.x, spt.y);
			for(j=1; j<numPoints; j++){
				pt = ring.points[j];
				spt = transformation.toScreenPoint(pt.x, pt.y);				
				context.lineTo(spt.x, spt.y);
			}
		}
		if(symbolizer.fill!=null){
			context.fill();
		}
		if(symbolizer.stroke){
			context.stroke();
		}
		context.closePath();		
	},
	
	drawMultiPoint : function(geometry,symbolizer, transformation){
		points = geometry.points;
		
		var pt = null;
		for(var i=0, len=points.length; i<len; i++){
			pt = points[i];
			this.drawPoint(pt, symbolizer,transformation);
		}
	},
	
	drawMultiLineString : function(geometry,symbolizer, transformation){
		lines = geometry.lines;		
		var line = null;
		for(var i=0, len=lines.length; i<len; i++){
			line = lines[i];
			this.drawLineString(line, symbolizer,transformation);
		}
	},
	
	drawMultiPolygon : function(geometry, symbolizer, transformation){
		polygons = geometry.polygons;		
		var polygon = null;
		for(var i=0, len=polygons.length; i<len; i++){
			polygon = polygons[i];
			this.drawPolygon(polygon, symbolizer,transformation);
		}
	},
	
	drawCircle : function(geometry, symbolizer, transformation){
		var center = geometry.center;
		var radius = geometry.radius;
		if(radius <= 0){
			return;
		}
		var context = this.context;
		context.beginPath();
		var spt = transformation.toScreenPoint(center.x, center.y);	
		var spt_2 = transformation.toScreenPoint(center.x + radius, center.y);	
		var sradius = Math.sqrt((spt.x - spt_2.x)*(spt.x - spt_2.x)
							+ (spt.y - spt_2.y)*(spt.y - spt_2.y));
		context.arc(spt.x,spt.y,sradius,0,Math.PI*2,true);
		if(symbolizer.fill!=null){
			context.fill();
		}
		if(symbolizer.stroke){
			context.stroke();
		}
		context.closePath();			
	},
	drawIcons : function(features, symbolizer, transformation){		
		if(features.length==0){
			return;
		}
		
		if(symbolizer.icon==null){
			symbolizer.icon = new Image();
			// symbolizer.icon.crossOrigin="anonymous";
			symbolizer.icon.src = symbolizer.symbol.icon;			
		}
		else{
			if(symbolizer.icon.src!=symbolizer.symbol.icon){
				symbolizer.icon = null;
				symbolizer.icon = new Image();
				// symbolizer.icon.crossOrigin="anonymous"	
				symbolizer.icon.src = symbolizer.symbol.icon;
			}
		}
		
		if(symbolizer.icon.complete){
			var num = features.length;
			for(var i=0; i<num; i++){
				var pt = features[i].geometry;
				var sp = transformation.toScreenPoint(pt.x, pt.y);
				this.drawIcon(symbolizer.icon, sp.x, sp.y, symbolizer);
			}
		}
		else{
			var that = this;
			symbolizer.icon.onload = function(){
				var num = features.length;
				for(var i=0; i<num; i++){
					var pt = features[i].geometry;
					var sp = transformation.toScreenPoint(pt.x, pt.y);
					that.drawIcon(symbolizer.icon, sp.x, sp.y, symbolizer);
				}
				mapObj.drawLayersAll();
			};
		}
	},
	
	drawIcon : function(icon, px, py, symbolizer){
		var w, h;
		w = (symbolizer.icon_width>0)  ? symbolizer.icon_width  : icon.width;
		h = (symbolizer.icon_height>0) ? symbolizer.icon_height : icon.height;
		
		// anchor x,y
		var ax = Math.ceil(px - w / 2) + symbolizer.icon_offset_x;
		var ay = Math.ceil(py - h / 2) + symbolizer.icon_offset_y;
	
		this.context.drawImage(icon, ax, ay, w, h);
	},
	

	drawRing : function(point,radiusInnter,radiusOuter,color,opacityInner,opacityOuter,transformation){
		var spt = null;
		spt = transformation.toScreenPoint(point.x, point.y);

		var colorOuter = new GeoBeans.Color();
		colorOuter.setByHex(color,opacityOuter);
		this.context.fillStyle = colorOuter.getRgba();
		this.context.beginPath();
		this.context.arc(spt.x, spt.y, radiusOuter, 0, 2 * Math.PI, false);  
		this.context.closePath();

		this.context.fill();

		var colorInner = new GeoBeans.Color();
		colorInner.setByHex(color,opacityInner);
		this.context.fillStyle = colorInner.getRgba();

		this.context.beginPath();
		this.context.arc(spt.x, spt.y, radiusInnter, 0, 2 * Math.PI, false);  
		this.context.closePath();

		this.context.fill();
	},
	
	/************************************************************/
	/*	Label Geometry											*/
	/************************************************************/
	label : function(geometry, text, symbolizer, transformation){
		
		switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:
			this.labelPoint(geometry,text, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOINT:
			this.labelMultiPoint(geometry,text, transformation);
			break;
		case GeoBeans.Geometry.Type.LINESTRING:
			this.labelLineString(geometry, text, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:
			this.labelMultiLineString(geometry, text, transformation);
			break;
		case GeoBeans.Geometry.Type.POLYGON:
			this.labelPolygon(geometry, text, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:
			this.labelMultiPolygon(geometry, text, transformation);
			break;
		};
	},
	
	labelPoint : function(point, text, symbolizer, transformation){
		var spt;
		var r = 20;

		spt = transformation.toScreenPoint(point.x, point.y);
		
		if(symbolizer.fill != null){
			this.context.fillText(text, spt.x, spt.y);
		}

		
	},

	drawLabel : function(label){
		var pos = label.pos;
		var symbolizer = label.textSymbolizer;
		if(symbolizer.fill != null){
			this.context.fillText(label.text,pos.x,pos.y);
		}
		if(symbolizer.stroke != null){
			this.context.strokeText(label.text,pos.x,pos.y);
		}
	},
	
	labelLineString : function(line, text, symbolizer, transformation){
		
		
	},
	
	labelPolygon : function(polygon, text, symbolizer, transformation){

		
	},
	
	labelMultiPoint : function(geometry, text, symbolizer, transformation){
		
	},
	
	labelMultiLineString : function(geometry, text, symbolizer, transformation){
		
	},
	
	labelMultiPolygon : function(geometry, text, symbolizer, transformation){
		
	},

	getTextExtent : function(text,fontSize){
		var width = this.context.measureText(text).width;
		if(fontSize == null){
			fontSize = 12;
		}
		var envelope = new GeoBeans.Envelope(0,0,width,fontSize);
		return envelope;
	},
	/************************************************************/
	/*	Draw Image												*/
	/************************************************************/	
	drawImage : function(image, x, y, w, h){
		try{
			this.context.drawImage(image, x, y, w, h);	
		}
		catch (e) {
            console.log("drawImage failed: " + e);                
        }
	},

	drawImageParms : function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		try{
			this.context.drawImage(image, sx,sy,sw,sh,dx,dy,dw,dh);	
		}
		catch (e) {
            console.log("drawImage failed: " + e);                
        }
	},
	
	setSymbolizer : function(symbolizer){
		
		if(symbolizer instanceof GeoBeans.Symbolizer.PointSymbolizer){
			
			this.context.fillStyle = symbolizer.fill.color.getRgba();
			if(symbolizer.stroke != null){
				if(symbolizer.stroke.width != null){
					this.context.lineWidth   = symbolizer.stroke.width;
				}
				if(symbolizer.stroke.color != null){
					this.context.strokeStyle = symbolizer.stroke.color.getRgba();
				}
			}
		}
		else if(symbolizer instanceof GeoBeans.Symbolizer.LineSymbolizer){
			var stroke = symbolizer.stroke;
			if(stroke != null){
				this.context.strokeStyle = stroke.color.getRgba();
				if(stroke.width != null){
					this.context.lineWidth = stroke.width;
				}
				if(stroke.lineCap != null){
					this.context.lineCap = stroke.lineCap;
				}
				if(stroke.lineJoin != null){
					this.context.lineJoin = stroke.lineJoin;
				}
			}
		}
		else if(symbolizer instanceof GeoBeans.Symbolizer.PolygonSymbolizer){
			var fill = symbolizer.fill;
			if(fill != null){
				this.context.fillStyle = fill.color.getRgba();
			}
			var stroke = symbolizer.stroke;
			if(stroke != null){
				this.context.strokeStyle = stroke.color.getRgba();
				if(stroke.width != null){
					this.context.lineWidth = stroke.width;
				}
				if(stroke.lineCap != null){
					this.context.lineCap = stroke.lineCap;
				}
				if(stroke.lineJoin != null){
					this.context.lineJoin = stroke.lineJoin;
				}
			}
		}
		else if(symbolizer instanceof GeoBeans.Symbolizer.TextSymbolizer){
			
			var font = symbolizer.font;
			if(font != null){
				this.context.font = font.style + " " + 
									font.weight + " " + 
									font.size + "px " + 
									font.family ;
				// this.context.font = "italic small-caps bold 12px arial";

			}
			var fill = symbolizer.fill;
			if(fill != null){
				this.context.fillStyle = fill.color.getRgba();
			}
			var stroke = symbolizer.stroke;
			if(stroke != null){
				this.context.strokeStyle = stroke.color.getRgba();
				if(stroke.width != null){
					this.context.lineWidth = stroke.width;
				}
				if(stroke.lineCap != null){
					this.context.lineCap = stroke.lineCap;
				}
				if(stroke.lineJoin != null){
					this.context.lineJoin = stroke.lineJoin;
				}
			}
			// this.context.font 			= symbolizer.fontStyle  + " " +
			// 							  symbolizer.fontSize + "px " + 
			// 							  symbolizer.fontFamily + " " +
			// 							  symbolizer.fontWeight;
			
			// this.context.fillStyle		= symbolizer.fillColor;
			// this.context.lineWidth		= symbolizer.outLineWidth;
			// this.context.strokeStyle	= symbolizer.outLineColor;
			// this.context.lineCap		= symbolizer.outLineCap;
			// this.context.lineJoin		= symbolizer.outLineJoin;		
		}
		
		if(symbolizer.showShadow){
			this.context.shadowBlur		= symbolizer.shadowBlur;
			this.context.shadowColor	= symbolizer.shadowColor;
			this.context.shadowOffsetX	= symbolizer.shadowOffsetX;
			this.context.shadowOffsetY	= symbolizer.shadowOffsetY;
		}
	},
	
	fillCircle : function(x, y, r, fill){

	},
	
	strokeCircle : function(x, y, r, stroke){
		
	},
	
	/************************************************************/
	/*	Draw Geometry											*/
	/************************************************************/
	clear : function(geometry, fill_color, r, transformation){
		
		switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:
			this.clearPoint(geometry,fill_color, r, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOINT:
			this.clearMultiPoint(geometry,fill_color, r, transformation);
			break;
		case GeoBeans.Geometry.Type.LINESTRING:
			this.clearLineString(geometry,fill_color, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:
			this.clearMultiLineString(geometry,fill_color, transformation);
			break;
		case GeoBeans.Geometry.Type.POLYGON:
			this.clearPolygon(geometry, fill_color, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:
			this.clearMultiPolygon(geometry, fill_color, transformation);
			break;
		};
	},
	
	clearPoint : function(point, fill_color, r, transformation){
		var spt;
		
		spt = transformation.toScreenPoint(point.x, point.y);	
		this.context.fillStyle = fill_color;
		this.context.beginPath();
		this.context.arc(spt.x, spt.y, r, 0, 2 * Math.PI, false);  
		this.context.closePath();
		this.context.fill();
	},
	
	clearLineString : function(line, fill_color, transformation){
		
		if(line.points.length<1){
			return;
		}
		
		var pt = null;
		var spt = null;		
		var context = this.context;
		
		context.strokeStyle = fill_color;
		context.beginPath();
		pt = line.points[0];
		spt = transformation.toScreenPoint(pt.x, pt.y);
		context.moveTo(spt.x, spt.y);
		
		for(var i=1, len=line.points.length; i<len; i++){
			pt = line.points[i];
			spt = transformation.toScreenPoint(pt.x, pt.y);
			context.lineTo(spt.x, spt.y);
		}		 
		context.stroke();
	},
	
	clearPolygon : function(polygon, fill_color, transformation){

		var pt = null;
		var ring = null;
		var numRing = 0;
		var numPoints = 0;		
		var context = this.context;
		var i, j;

		context.fillStyle = fill_color;
		context.beginPath();		
		numRing = polygon.rings.length;
		for(i=0; i<numRing; i++){
			ring = polygon.rings[i];
			
			numPoints = ring.points.length;
			pt = ring.points[0];
			spt = transformation.toScreenPoint(pt.x, pt.y);
			context.moveTo(spt.x, spt.y);
			for(j=1; j<numPoints; j++){
				pt = ring.points[j];
				spt = transformation.toScreenPoint(pt.x, pt.y);				
				context.lineTo(spt.x, spt.y);
			}
		}
		context.closePath();	
		context.fill();	
	},
	
	clearMultiPoint : function(geometry,fill_color, r, transformation){
		points = geometry.points;
		
		var pt = null;
		for(var i=0, len=points.length; i<len; i++){
			pt = points[i];
			this.clearPoint(pt, symbolizer,r, transformation);
		}
	},
	
	clearMultiLineString : function(geometry,fill_color, transformation){
		lines = geometry.lines;		
		var line = null;
		for(var i=0, len=lines.length; i<len; i++){
			line = lines[i];
			this.clearLineString(line, fill_color,transformation);
		}
	},
	
	clearMultiPolygon : function(geometry, fill_color, transformation){
		polygons = geometry.polygons;		
		var polygon = null;
		for(var i=0, len=polygons.length; i<len; i++){
			polygon = polygons[i];
			this.clearPolygon(polygon, fill_color,transformation);
		}
	},
	
	save : function(){
		this.context.save();
	},
	
	restore : function(){
		this.context.restore();
	},

	//清空图层
	clearRect : function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	},

	//绘制overlay

	drawOverlay : function(overlay,symbolizer,transformation){
		var ret = false;
		var type = overlay.type;
		switch(type){
			case GeoBeans.Overlay.Type.MARKER:
				ret = this.drawMarker(overlay,symbolizer,transformation);
				break;
			default:
				this.drawGeometry(overlay.geometry,symbolizer,
								transformation);
				ret = true;
				break;
		}
		return ret;
	},

	drawMarker : function(marker,symbolizer,transformation){
		var that = this;
		var icon = symbolizer.icon_url;
		var x = marker.geometry.x;
		var y = marker.geometry.y;

		// var transformation = this.layer.map.transformation;
		var sp = transformation.toScreenPoint(x,y);
		// this.setSymbolizer(symbolizer);

		if(symbolizer.image == null){
			symbolizer.image = new Image();
			symbolizer.image.src = icon;
		}
		if(symbolizer.image.complete){
			marker.loadFlag = GeoBeans.Overlay.Flag.LOADED;
			this.drawIcon(symbolizer.image,sp.x,sp.y,symbolizer);
			return true;
		}else{
			symbolizer.image.onload = function(){
				marker.loadFlag = GeoBeans.Overlay.Flag.LOADED;
				that.drawIcon(symbolizer.image,sp.x,sp.y,symbolizer);
				marker.layer.draw();
				// that.layer.map.drawLayersAll();	
			}
		}	
	},

	drawTip : function(point,transformation,rule,labelRule){
		if(point == null || transformation == null 
			|| rule == null){
			return null;
		}

		var symbolizer = rule.symbolizer;
		if(symbolizer == null){
			return null;
		}
		this.setSymbolizer(symbolizer);
		var fontSize = 12;
		var textSymbolizer = rule.textSymbolizer;
		if(textSymbolizer != null && textSymbolizer.font != null
			&& textSymbolizer.font.size != null){
			fontSize = textSymbolizer.font.size;
		}
			
		var text = textSymbolizer.labelText;
		if(text == null){
			return null;
		}

		var tipWidth = 34;
		var tipHeight = 26;
		var textWidth = this.context.measureText(text).width;
		if(textWidth > 40){
			tipWidth = textWidth + 10;
		}


		var x = point.x;
		var y = point.y;
		var point_s = transformation.toScreenPoint(x,y);
		var space = 6;
		var arc = 5;
		var point_1 	= new GeoBeans.Geometry.Point(point_s.x - space,point_s.y - space);
		var point_2_1 	= new GeoBeans.Geometry.Point(point_s.x - tipWidth/2 + arc,point_s.y - space);
		var point_2 	= new GeoBeans.Geometry.Point(point_s.x - tipWidth/2,point_s.y - space);
		var point_2_2	= new GeoBeans.Geometry.Point(point_s.x - tipWidth/2,point_s.y - space - arc);
		var point_3_1 	= new GeoBeans.Geometry.Point(point_s.x - tipWidth/2,point_s.y - tipHeight + arc);
		var point_3 	= new GeoBeans.Geometry.Point(point_s.x - tipWidth/2,point_s.y - tipHeight);
		var point_3_2 	= new GeoBeans.Geometry.Point(point_s.x - tipWidth/2 + arc,point_s.y - tipHeight);
		var point_4_1 	= new GeoBeans.Geometry.Point(point_s.x + tipWidth/2 - arc,point_s.y - tipHeight);
		var point_4 	= new GeoBeans.Geometry.Point(point_s.x + tipWidth/2,point_s.y - tipHeight);
		var point_4_2 	= new GeoBeans.Geometry.Point(point_s.x + tipWidth/2,point_s.y - tipHeight + arc);
		var point_5_1 	= new GeoBeans.Geometry.Point(point_s.x + tipWidth/2,point_s.y - space - arc);
		var point_5 	= new GeoBeans.Geometry.Point(point_s.x + tipWidth/2,point_s.y - space);
		var point_5_2 	= new GeoBeans.Geometry.Point(point_s.x + tipWidth/2 - arc,point_s.y - space);
		var point_6 	= new GeoBeans.Geometry.Point(point_s.x + space,point_s.y - space);
		
		var context = this.context;
		
		// 画线
		context.beginPath();
		context.moveTo(point_s.x, point_s.y);
		context.lineTo(point_1.x,point_1.y);
		context.lineTo(point_2_1.x,point_2_1.y);
		// context.lineTo(point_2.x,point_2.y);
		context.arcTo(point_2.x,point_2.y,point_2_2.x,point_2_2.y,arc);
		context.lineTo(point_3_1.x,point_3_1.y);
		context.arcTo(point_3.x,point_3.y,point_3_2.x,point_3_2.y,arc);
		context.lineTo(point_4.x,point_4.y);
		context.lineTo(point_5.x,point_5.y);

		context.lineTo(point_6.x,point_6.y);
		context.lineTo(point_s.x,point_s.y);
		if(symbolizer.stroke != null){
			context.stroke();
		}
		if(symbolizer.fill != null){
			context.fill();
		}
			

		var textSymbolizer = rule.textSymbolizer;
		if(textSymbolizer != null){
			this.setSymbolizer(textSymbolizer);
		}

		// 写字
		var textPos_x = point_s.x - textWidth/2;
		var textPos_y = point_s.y - space - 6;
		if(textSymbolizer.fill != null){
			context.fillText(text,textPos_x,textPos_y);
		}
		


		// 写标注
		if(labelRule == null){
			return null;
		}
		var labelTextSymbolizer = labelRule.textSymbolizer;
		var labelSymbolizer = labelRule.symbolizer;
		if(labelSymbolizer != null){
			this.setSymbolizer(labelSymbolizer);
		}

		var label = labelTextSymbolizer.labelText;
		if(label == null){
			return null;
		}
		var maxTextCount = 5;
		if(label.length >= 5){
			label = label.slice(0,5);
		}

		var paddingLabel = 4;
		var labelWidth = this.context.measureText(label).width;
		labelWidth = labelWidth + paddingLabel *2;

		var point_a_1 	= new GeoBeans.Geometry.Point(point_4.x + labelWidth - arc, point_4.y); 
		var point_a 	= new GeoBeans.Geometry.Point(point_4.x + labelWidth, point_4.y);
		var point_a_2 	= new GeoBeans.Geometry.Point(point_4.x + labelWidth, point_4.y + arc);
		var point_b_1 	= new GeoBeans.Geometry.Point(point_5.x + labelWidth, point_5.y - arc);
		var point_b 	= new GeoBeans.Geometry.Point(point_5.x + labelWidth, point_5.y);
		var point_b_2 	= new GeoBeans.Geometry.Point(point_5.x + labelWidth - arc, point_5.y);


		context.beginPath();
		context.moveTo(point_4.x,point_4.y);
		context.lineTo(point_a_1.x,point_a_1.y);
		context.arcTo(point_a.x,point_a.y,point_a_2.x,point_a_2.y,arc);
		context.lineTo(point_b_1.x,point_b_1.y);
		context.arcTo(point_b.x,point_b.y,point_b_2.x,point_b_2.y,arc);
		context.lineTo(point_5.x,point_5.y);
		context.lineTo(point_4.x,point_4.y);

		if(labelSymbolizer.stroke != null){
			context.stroke();
		}
		if(labelSymbolizer.fill != null){
			context.fill();
		}

		if(labelTextSymbolizer != null){
			this.setSymbolizer(labelTextSymbolizer);
		}
		var labelPos_x = point_s.x + tipWidth/2 + paddingLabel;
		var labelPos_y = point_s.y - space - 6;
		context.fillText(label,labelPos_x,labelPos_y,labelWidth);

		var viewer = new GeoBeans.Envelope(point_3.x,point_3.y,point_b.x,point_b.y);
		return viewer;
	},
	
});