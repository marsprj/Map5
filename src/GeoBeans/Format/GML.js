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

/**
 * 读取geometry
 * @public
 * @param  {string} gml  gml文本
 * @return {GeoBeans.Geometry}     geometry
 */
GeoBeans.Format.GML.prototype.read = function(gml){
	if(!isValid(gml)){
		return null;
	}
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
	default :
		break;
	}
	
	return geometry;	
};

/**
 * 写geometry
 * @param  {GeoBeans.Geometry} geometry geometry
 * @return {string}          gml字符串
 */
GeoBeans.Format.GML.prototype.write = function(geometry){
	if(!isValid(geometry))	{
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
};


GeoBeans.Format.GML.prototype.readPoint = function(gml){
	return this.parsePoint($(gml).children().first());
};

GeoBeans.Format.GML.prototype.readLineString = function(gml){
    var pts = this.parsePoints($(gml).children().first());
	if(pts.length==0){
		return null;
	}
	return (new GeoBeans.Geometry.LineString(pts));
};

GeoBeans.Format.GML.prototype.readPolygon = function(gml){
	var that = this;
	
	var ring = null;
	var rings= new Array();
	var pts  = new Array();
	$(gml).find("gml\\:LinearRing").each(function(index, element) {
        pts = that.parsePoints($(this).children().first());
		ring = new GeoBeans.Geometry.LinearRing(pts);
		rings.push(ring);
    });
	if(rings.length==0){
		return null;
	}
	return (new GeoBeans.Geometry.Polygon(rings));
};

GeoBeans.Format.GML.prototype.readMultiLineString = function(gml){
	var that = this;
	
	var l = null;
	var lines= new Array();
	$(gml).find("gml\\:LineString").each(function(index, element) {
		l = that.readLineString(this);
		lines.push(l);
    });
	if(lines.length==0){
		return null;
	}
	return (new GeoBeans.Geometry.MultiLineString(lines));
};

GeoBeans.Format.GML.prototype.readMultiPolygon = function(gml){
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
};


GeoBeans.Format.GML.prototype.parsePoint = function(gml){
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
};


GeoBeans.Format.GML.prototype.parsePoints = function(gml){
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
};


GeoBeans.Format.GML.prototype.writePoint = function(point){
	if(!isValid(point)){
		return null;
	}
	var gml = "";
	gml += "<gml:Point  xmlns:gml=\"http://www.opengis.net/gml\" >"
		+  "<gml:coordinates "
		+  "decimal=\".\" cs=\",\" ts=\" \">";
	gml += point.x;
	gml += ",";
	gml += point.y;
	gml += "</gml:coordinates></gml:Point>";
	return gml;
};

GeoBeans.Format.GML.prototype.writeLineString = function(lineString){
	if(!isValid(lineString)){
		return null;
	}

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
};

GeoBeans.Format.GML.prototype.writePolygon = function(polygon){
	if(!isValid(polygon)){
		return null;
	}
	var gml = "";
	var rings = polygon.rings;
	gml += "<gml:Polygon  xmlns:gml=\"http://www.opengis.net/gml\">";
	for(var j = 0; j < rings.length; ++j){
		gml += "<gml:outerBoundaryIs>";
		gml += "<gml:LinearRing>";
		gml += "<gml:coordinates "
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
};

GeoBeans.Format.GML.prototype.writeMultiLinestring = function(multiLineStrings){
	if(!isValid(multiLineStrings)){
		return null;
	}
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
};

GeoBeans.Format.GML.prototype.writeMultiPolygon = function(multiPolygon){
	if(!isValid(multiPolygon)){
		return null;
	}	
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
};

GeoBeans.Format.GML.Version = {
	v_2_0  : "2.0",
	v_3_1_1: "3.1.1",
	v_3_2_1: "3.2.1"
};

/**
 * [Type description]
 * @type {Object}
 */
// GeoBeans.Format.GML.Type = {
// 	Point  		: "gml:Point",
// 	LineString  : "gml:LineString",
// 	Polygon	 	: "gml:Polygon",
// 	MultiPoint	: "gml:MultiPoint",
// 	MultiLineString : "gml:MultiLineString",
// 	MultiPolygon: "gml:MultiPolygon"
// };


