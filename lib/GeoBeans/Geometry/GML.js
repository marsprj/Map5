GeoBeans.Geometry.GML = GeoBeans.Class({
	initialize : function(name){
		this.name = name;
	},
	
	destory : function(){
		GeoBeans.Class.prototype.destory.apply(this, arguments);
	},	
});

GeoBeans.Geometry.GML.Version = {
	v_2_0  : "2.0",
	v_3_1_1: "3.1.1",
	v_3_2_1: "3.2.1"
};

GeoBeans.Geometry.GML.Type = {
	Point  		: "gml:Point",
	LineString  : "gml:LineString",
	Polygon	 	: "gml:Polygon",
	MultiPoint	: "gml:MultiPoint",
	MultiLineString : "gml:MultiLineString",
	MultiPolygon: "gml:MultiPolygon"
};


GeoBeans.Geometry.GML.Reader = GeoBeans.Class({
	
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
		case GeoBeans.Geometry.GML.Type.Point:
			geometry = this.readPoint(gml);
		break;
		case GeoBeans.Geometry.GML.Type.LineString:
			geometry = this.readLineString(gml);
		break;
		case GeoBeans.Geometry.GML.Type.Polygon:
			geometry = this.readPolygon(gml);
		break;
		case GeoBeans.Geometry.GML.Type.MultiPoint:
		break;
		case GeoBeans.Geometry.GML.Type.MultiLineString:
			geometry = this.readMultiLineString(gml);
		break;
		case GeoBeans.Geometry.GML.Type.MultiPolygon:
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
			//console.log(pt.x + "," + pt.y);
		}
		return pts;
	}
	
});


