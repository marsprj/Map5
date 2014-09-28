GeoBeans.Renderer = GeoBeans.Class({
	
	context : null,
	
	initialize : function(context){
		this.context = context
	},
	
	draw : function(feature, symbolizer, transformation){
		
		var geometry = feature.geometry;		
		this.drawGeometry(geometry,symbolizer, transformation);
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
		if(symbolizer.showOutline){
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
		if(symbolizer.fillColor!=null){
			context.fill();
		}
		if(symbolizer.showOutline){
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
	
	drawIcons : function(features, symbolizer, transformation){		
		if(features.length==0){
			return;
		}
		
		if(symbolizer.icon==null){
			symbolizer.icon = new Image();
			symbolizer.icon.src = symbolizer.icon_url;			
		}
		else{
			if(symbolizer.icon.src!=symbolizer.icon_url){
				symbolizer.icon = null;
				symbolizer.icon = new Image();
				symbolizer.icon.src = symbolizer.icon_url;			
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
	
	//drawIcons : function(feature, symbolizer, transformation){
//		var pt = feature.geometry;
//		var spt = transformation.toScreenPoint(pt.x, pt.y);	
//		//if(symbolizer.icon==null){
//		//	
//		//}
//		
//		var icon = new Image();
//		icon.src = this.url;
//		if(this.image.complete){
//			renderer.drawImage(this.image, x, y, w, h);	
//		}
//		else{
//			var tile = this;
//			this.image.onload = function(){
//				renderer.drawImage(tile.image, x, y, w, h);
//			};
//		}
//	},
	
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
		
		if(symbolizer.showFill){
			this.context.fillText(text, spt.x, spt.y);
		}
		if(symbolizer.showOutline){
			this.context.strokeText(text, spt.x, spt.y);
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

	/************************************************************/
	/*	Draw Image												*/
	/************************************************************/	
	drawImage : function(image, x, y, w, h){
		//x = 434;
		this.context.drawImage(image, x, y, w, h);
		//console.log("x=" + x + ",y=" + y );

		//this.context.strokeStyle = 'rgba(255,0,0,1)';
		//this.context.strokeRect(x, y, w, h);
	},
	
	setSymbolizer : function(symbolizer){
		
		if(symbolizer instanceof GeoBeans.Style.PointSymbolizer){
			
			this.context.fillStyle = symbolizer.fillColor;
			if(symbolizer.showOutline){
				if(symbolizer.outLineWidth != null){
					this.context.lineWidth   = symbolizer.outLineWidth;
				}
				if(symbolizer.outLineColor != null){
					this.context.strokeStyle = symbolizer.outLineColor;
				}
			}
		}
		else if(symbolizer instanceof GeoBeans.Style.LineSymbolizer){
			this.context.strokeStyle = symbolizer.color;
			this.context.lineWidth   = symbolizer.width;
			if(symbolizer.outLineCap != null){
				this.context.lineCap = symbolizer.outLineCap;
			}
			if(symbolizer.outLineJoin != null){
				this.context.lineJoin = symbolizer.outLineJoin;
			}
		}
		else if(symbolizer instanceof GeoBeans.Style.PolygonSymbolizer){
			if(symbolizer.fillColor!=null){			
				this.context.fillStyle = symbolizer.fillColor;
			}
			if(symbolizer.showOutline){
				if(symbolizer.outLineWidth != null){
					this.context.lineWidth   = symbolizer.outLineWidth;
				}
				if(symbolizer.outLineColor != null){
					this.context.strokeStyle = symbolizer.outLineColor;
				}
				if(symbolizer.outLineCap != null){
					this.context.lineCap = symbolizer.outLineCap;
				}
				if(symbolizer.outLineJoin != null){
					this.context.lineJoin = symbolizer.outLineJoin;
				}
			}
		}
		else if(symbolizer instanceof GeoBeans.Style.TextSymbolizer){
			
			this.context.font 			= symbolizer.fontStyle  + " " +
										  symbolizer.fontSize + "px " + 
										  symbolizer.fontFamily + " " +
										  symbolizer.fontWeight;
			
			this.context.fillStyle		= symbolizer.fillColor;
			this.context.lineWidth		= symbolizer.outLineWidth;
			this.context.strokeStyle	= symbolizer.outLineColor;
			this.context.lineCap		= symbolizer.outLineCap;
			this.context.lineJoin		= symbolizer.outLineJoin;		
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
	}
	
});