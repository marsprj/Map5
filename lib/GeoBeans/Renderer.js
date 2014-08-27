GeoBeans.Renderer = GeoBeans.Class({
	
	contenxt : null,
	
	initialize : function(context){
		this.context = context
	},
	
	draw : function(feature, style, transformation){
		
		var geometry = feature.geometry;		
		this.drawGeometry(geometry,style, transformation);
	},
		
	drawGeometry : function(geometry, style, transformation){
		
		switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:
			this.drawPoint(geometry,style, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOINT:
			this.drawMultiPoint(geometry,style, transformation);
			break;
		case GeoBeans.Geometry.Type.LINESTRING:
			this.drawLineString(geometry,style, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:
			this.drawMultiLineString(geometry,style, transformation);
			break;
		case GeoBeans.Geometry.Type.POLYGON:
			this.drawPolygon(geometry, style, transformation);
			break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:
			this.drawMultiPolygon(geometry, style, transformation);
			break;
		};
	},
	
	drawPoint : function(point, symbolizer, transformation){
		var spt;
		var r = 20;

		spt = transformation.toScreenPoint(point.x, point.y);
		
		r = symbolizer.size;
		context.fillStyle = symbolizer.fillColor;
		if(symbolizer.showOutline){
			if(symbolizer.outLineWidth != null){
				context.lineWidth   = symbolizer.outLineWidth;
			}
			if(symbolizer.outLineColor != null){
				context.strokeStyle = symbolizer.outLineColor;
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
		
//		context.strokeStyle = '#f00';
//		context.lineWidth   = 4;
					
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
		context.moveTo(pt.x, pt.y);
		spt = transformation.toScreenPoint(pt.x, pt.y);
		context.lineTo(spt.x, spt.y);
		
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
		
//		context.fillStyle = '#00f';
//		context.lineWidth   = 1;
//		context.lineCap = 'round';
//		context.lineJoin = 'round';
//		context.strokeStyle = '#f00';

		context.fillStyle = symbolizer.fillColor;
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
		
		context.fill();
		if(symbolizer.showOutline){
			context.stroke();
		}
		context.closePath();		
	},
	
	drawMultiPoint : function(geometry,style, transformation){
		points = geometry.points;
		
		var pt = null;
		for(var i=0, len=points.length; i<len; i++){
			pt = points[i];
			this.drawPoint(pt, style);
		}
	},
	
	drawMultiLineString : function(geometry,style, transformation){
		lines = geometry.lines;		
		var line = null;
		for(var i=0, len=lines.length; i<len; i++){
			line = lines[i];
			this.drawLineString(line, style);
		}
	},
	
	drawMultiPolygon : function(geometry, style, transformation){
		polygons = geometry.polygons;		
		var polygon = null;
		for(var i=0, len=polygons.length; i<len; i++){
			polygon = polygons[i];
			this.drawPolygon(polygon, style);
		}
	},
	
	drawImage : function(image, x, y, w, h){
		
		this.context.drawImage(image, x, y, w, h);
		
//		var context = this.context;
//		
//		var url = "http://ourgis.digitalearth.cn/QuadServer/maprequest?services=world_vector&row=4&col=4&level=3";
//		var img = new GeoBeans.Tile(context, url,3, 4,3);
//		//context.drawImage(img.image, 10, 10, 200,200);
//		img.draw();
	},
	
	fillCircle : function(x, y, r, fill){

	},
	
	strokeCircle : function(x, y, r, stroke){
		
	}
	
});