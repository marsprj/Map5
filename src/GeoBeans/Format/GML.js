/**
 * @classdesc
 * GML数据格式类
 * @class
 */
GeoBeans.Format.GML = GeoBeans.Class(GeoBeans.Format,{
	initialize : function(name){
		this.name = name;
	},
	
	destory : function(){
		GeoBeans.Class.prototype.destory.apply(this, arguments);
	},	
});

GeoBeans.Format.GML.Version = {
	v_2_0  : "2.0",
	v_3_1_1: "3.1.1",
	v_3_2_1: "3.2.1"
};

/**
 * [Type description]
 * @type {Object}
 */
GeoBeans.Format.GML.Type = {
	Point  		: "gml:Point",
	LineString  : "gml:LineString",
	Polygon	 	: "gml:Polygon",
	MultiPoint	: "gml:MultiPoint",
	MultiLineString : "gml:MultiLineString",
	MultiPolygon: "gml:MultiPolygon"
};

/**
 * [initialize description]
 * @param  {type} version){		this.version [description]
 * @param  {type} destory                  :             function(){		GeoBeans.Class.prototype.destory.apply(this, arguments);	} [description]
 * @param  {type} write                    :             function(geometry){		if(geometry                          [description]
 * @return {type}                          [description]
 */
GeoBeans.Format.GML.Writer = GeoBeans.Class({
	version : null,
	
	initialize : function(version){
		this.version = version;
	},
	
	destory : function(){
		GeoBeans.Class.prototype.destory.apply(this, arguments);
	},	

	write : function(geometry){
		if(geometry == null){
			return null;
		}
		var gml = "";
		var type = geometry.type;
		switch(type){
		case GeoBeans.Geometry.Type.POINT:
			gml = this.writePoint(geometry);
			break;
		case GeoBeans.Geometry.Type.LINESTRING:
			gml = this.writeLineString(geometry);
			break;
		case GeoBeans.Geometry.Type.POLYGON:
			gml = this.writePolygon(geometry);
			break;
		case GeoBeans.Geometry.Type.MULTIPOINT:
			break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:
			gml = this.writeMultiLinestring(geometry);
			break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:
			gml = this.writeMultiPolygon(geometry);
			break;
		default:
			break;
		}

		return gml;		
	},

	/**
	 * [writePoint description]
	 * @param  {type} point [description]
	 * @return {type}       [description]
	 */
	writePoint : function(point){
		var gml = "";
		gml += " <gml:Point>"
			+  "<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
			+  "decimal=\".\" cs=\",\" ts=\" \">";
		gml += point.x;
		gml += ",";
		gml += point.y;
		gml += "</gml:coordinates></gml:Point>";
		return gml;
	},
	
	writeLineString : function(lineString){
		var gml = "";
		var points = lineString.points;
		gml += "<LineString><coordinates>" ;
		for(var i = 0; i < points.length; ++i){
			var point = points[i];
			var x = point.x;
			var y = point.y;
			gml += x ;
			gml += ",";
			gml += y + " ";
		}
		gml += "</coordinates></LineString>" ;
		return gml;
	},


	writePolygon : function(polygon){
		var gml = "";
		var rings = polygon.rings;
		gml += "<gml:Polygon>";
		for(var j = 0; j < rings.length; ++j){
			gml += "<gml:outerBoundaryIs>";
			gml += "<gml:LinearRing>";
			gml += "<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
				+  "decimal=\".\" cs=\",\" ts=\" \">";
			var ring = rings[j];
			var points = ring.points;
			for(var m = 0; m < points.length; ++m){
				var point = points[m];
				var x = point.x;
				var y = point.y;
				gml += x ;
				gml += ",";
				gml += y + " ";		
			}
			gml += "</gml:coordinates>";
			gml += "</gml:LinearRing>";
			gml += "</gml:outerBoundaryIs>";
		}
		gml += "</gml:Polygon>";
		return gml;
	},

	writeMultiLinestring : function(multiLineStrings){
		var gml = "";
		var lines = multiLineStrings.lines;
		gml += "<gml:MultiLineString>";
		for(var i = 0; i < lines.length; ++i){
			var points = lines[i].points;
			gml += "<gml:lineStringMember>";
			gml += "<gml:LineString>";
			gml += "<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
			+  "decimal=\".\" cs=\",\" ts=\" \">";
			for(var j = 0; j < points.length; ++j){
				var point = points[j];
				var x = point.x;
				var y = point.y;
				gml += x ;
				gml += ",";
				gml += y + " ";					
			}
			gml += "</gml:coordinates>";
			gml += "</gml:LineString></gml:lineStringMember>";

		}
		gml += "</gml:MultiLineString>";
		return gml;
	},

	writeMultiPolygon : function(multiPolygon){
		var gml = "";
		var polygons = multiPolygon.polygons;
		gml += "<gml:MultiPolygon>";
		for(var i =0; i < polygons.length;++i){
			var polygon = polygons[i];
			var rings = polygon.rings;
			gml += "<gml:polygonMember>";
			gml += "<gml:Polygon>";
			for(var j = 0; j < rings.length; ++j){
				gml += "<gml:outerBoundaryIs>";
				gml += "<gml:LinearRing>";
				gml += "<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
					+  "decimal=\".\" cs=\",\" ts=\" \">";
				var ring = rings[j];
				var points = ring.points;
				for(var m = 0; m < points.length; ++m){
					var point = points[m];
					var x = point.x;
					var y = point.y;
					gml += x ;
					gml += ",";
					gml += y + " ";		
				}
				gml += "</gml:coordinates>";
				gml += "</gml:LinearRing>";
				gml += "</gml:outerBoundaryIs>";
			}
			gml += "</gml:Polygon>";
			gml += "</gml:polygonMember>";
		}
		gml += "</gml:MultiPolygon>";
		return gml;
	}
});

GeoBeans.Format.GML.Reader = GeoBeans.Class({
	
	version : null,
	
	initialize : function(version){
		this.version = version;
	},
	
	destory : function(){
		GeoBeans.Class.prototype.destory.apply(this, arguments);
	},	
	
	read : function(gml){
		
		var geometry = null;
		
		var type = gml.tagName;
		switch(type){
		case "gml:Point":
			geometry = this.readPoint(gml);
		break;
		case "gml:LineString":
			geometry = this.readLineString(gml);
		break;
		case "gml:Polygon":
			geometry = this.readPolygon(gml);
		break;
		case "gml:MultiPoint":
		break;
		case "gml:MultiLineString":
			geometry = this.readMultiLineString(gml);
		break;
		case "gml:MultiPolygon":
			geometry = this.readMultiPolygon(gml);
		break;
		}
		
		return geometry;
	},
	
	readPoint : function(gml){
		return this.parsePoint($(gml).children().first());
	},
	
	readLineString : function(gml){
		
        var pts = this.parsePoints($(gml).children().first());
		if(pts.length==0){
			return null;
		}
		return (new GeoBeans.Geometry.LineString(pts));
	},
	
	readPolygon : function(gml){
		
		var that = this;
		
		var ring = null;
		var rings= new Array();
		var pts  = new Array();
		$(gml).find("LinearRing").each(function(index, element) {
            pts = that.parsePoints($(this).children().first());
			ring = new GeoBeans.Geometry.LinearRing(pts);
			rings.push(ring);
        });
		if(rings.length==0){
			return null;
		}
		return (new GeoBeans.Geometry.Polygon(rings));
	},
	
	readMultiLineString : function(gml){
		var that = this;
		
		var l = null;
		var lines= new Array();
		$(gml).find("LineString").each(function(index, element) {
			l = that.readLineString(this);
			lines.push(l);
        });
		if(lines.length==0){
			return null;
		}
		return (new GeoBeans.Geometry.MultiLineString(lines));
	},
	
	readMultiPolygon : function(gml){
		var that = this;
		
		var p  = null;
		var ps = new Array();
		$(gml).find("Polygon").each(function(index, element) {
			p = that.readPolygon(this);
			if(p!=null){
				ps.push(p);
			}
        });
		return (new GeoBeans.Geometry.MultiPolygon(ps));
	},
	
	parsePoint : function(gml){
		var ts = $(gml).attr("ts");
		var cs = $(gml).attr("cs");
		var dc = $(gml).attr("dc");	//decimal
		
		var coord = $(gml).text();
		var xy = coord.split(cs);
		
		var pt = new GeoBeans.Geometry.Point(
						parseFloat(xy[0]),
						parseFloat(xy[1])
					);
		return pt;
	},
	
	parsePoints : function(gml){
		var ts = $(gml).attr("ts");	//" "
		var cs = $(gml).attr("cs");	//","
		var dc = $(gml).attr("dc");	//decimal
		
		var str = $(gml).text();
		var coords = str.split(ts);
				
		var count = coords.length;
		var x, y, pt;
		var xy;		
		var pts = new Array();
		for(var i=0; i<count; i++){			
			xy = coords[i].split(cs);			
			pt = new GeoBeans.Geometry.Point(parseFloat(xy[0]),parseFloat(xy[1]));
			pts.push(pt);	
		}
		return pts;
	}

});


