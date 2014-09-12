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
		var r = 20;

		spt = transformation.toScreenPoint(point.x, point.y);
		
		r = symbolizer.size;
		this.context.fillStyle = symbolizer.fillColor;
		if(symbolizer.showOutline){
			if(symbolizer.outLineWidth != null){
				this.context.lineWidth   = symbolizer.outLineWidth;
			}
			if(symbolizer.outLineColor != null){
				this.context.strokeStyle = symbolizer.outLineColor;
			}
		}	

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
							
		context.strokeStyle = symbolizer.color;
		context.lineWidth   = symbolizer.width;
		if(symbolizer.outLineCap != null){
			context.lineCap = symbolizer.outLineCap;
		}
		if(symbolizer.outLineJoin != null){
			context.lineJoin = symbolizer.outLineJoin;
		}
		
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
		context.closePath();
	},
	
	drawPolygon : function(polygon, symbolizer, transformation){

		var pt = null;
		var ring = null;
		var numRing = 0;
		var numPoints = 0;		
		var context = this.context;
		var i, j;

		if(symbolizer.fillColor!=null){			
			context.fillStyle = symbolizer.fillColor;
		}
		if(symbolizer.showOutline){
			if(symbolizer.outLineWidth != null){
				context.lineWidth   = symbolizer.outLineWidth;
			}
			if(symbolizer.outLineColor != null){
				context.strokeStyle = symbolizer.outLineColor;
			}
			if(symbolizer.outLineCap != null){
				context.lineCap = symbolizer.outLineCap;
			}
			if(symbolizer.outLineJoin != null){
				context.lineJoin = symbolizer.outLineJoin;
			}
		}	
		
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
	
	/************************************************************/
	/*	Label Geometry											*/
	/************************************************************/
	label : function(geometry, text, symbolizer, transformation){
		
		switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:
			this.labelPoint(geometry,text, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOINT:
			this.labelMultiPoint(geometry,text, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.LINESTRING:
			this.labelLineString(geometry, text, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:
			this.labelMultiLineString(geometry, text, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.POLYGON:
			this.labelPolygon(geometry, text, symbolizer, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:
			this.labelMultiPolygon(geometry, text, symbolizer, transformation);
			break;
		};
	},
	
	labelPoint : function(point, text, symbolizer, transformation){
		var spt;
		var r = 20;

		spt = transformation.toScreenPoint(point.x, point.y);
		
		this.context.font="30px Verdana";
		//this.fillText("Hello World!",10,50);
		this.context.fillText(text, spt.x, spt.y);
		
	},
	
	labelLineString : function(line, text, symbolizer, transformation){
		
		if(line.points.length<1){
			return;
		}
		
		var pt = null;
		var spt = null;		
		var context = this.context;
							
		context.strokeStyle = symbolizer.color;
		context.lineWidth   = symbolizer.width;
		if(symbolizer.outLineCap != null){
			context.lineCap = symbolizer.outLineCap;
		}
		if(symbolizer.outLineJoin != null){
			context.lineJoin = symbolizer.outLineJoin;
		}
		
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
		context.closePath();
	},
	
	labelPolygon : function(polygon, text, symbolizer, transformation){

		var pt = null;
		var ring = null;
		var numRing = 0;
		var numPoints = 0;		
		var context = this.context;
		var i, j;

		if(symbolizer.fillColor!=null){			
			context.fillStyle = symbolizer.fillColor;
		}
		if(symbolizer.showOutline){
			if(symbolizer.outLineWidth != null){
				context.lineWidth   = symbolizer.outLineWidth;
			}
			if(symbolizer.outLineColor != null){
				context.strokeStyle = symbolizer.outLineColor;
			}
			if(symbolizer.outLineCap != null){
				context.lineCap = symbolizer.outLineCap;
			}
			if(symbolizer.outLineJoin != null){
				context.lineJoin = symbolizer.outLineJoin;
			}
		}	
		
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
	
	labelMultiPoint : function(geometry, text, symbolizer, transformation){
		points = geometry.points;
		
		var pt = null;
		for(var i=0, len=points.length; i<len; i++){
			pt = points[i];
			this.drawPoint(pt, symbolizer,transformation);
		}
	},
	
	labelMultiLineString : function(geometry, text, symbolizer, transformation){
		lines = geometry.lines;		
		var line = null;
		for(var i=0, len=lines.length; i<len; i++){
			line = lines[i];
			this.drawLineString(line, symbolizer,transformation);
		}
	},
	
	labelMultiPolygon : function(geometry, text, symbolizer, transformation){
		polygons = geometry.polygons;		
		var polygon = null;
		for(var i=0, len=polygons.length; i<len; i++){
			polygon = polygons[i];
			this.drawPolygon(polygon, symbolizer,transformation);
		}
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
	
	fillCircle : function(x, y, r, fill){

	},
	
	strokeCircle : function(x, y, r, stroke){
		
	}
	
});