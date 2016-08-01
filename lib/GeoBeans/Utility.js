GeoBeans.Utility  = {
	getDistance : function(x,y,x1,y1){
		return Math.sqrt((x - x1)*(x - x1) + (y - y1)*(y - y1));
	},


	distance2segment : function(x, y, x0, y0, x1, y1){
		
		var d = 0;
		if(Math.abs(x0-x1)<Math.ESPLON){
			// vertical
			var miny = y0 < y1 ? y0 : y1;
			var maxy = y0 > y1 ? y0 : y1;
			if((y>miny)&&(y<maxy)){
				d = Math.abs(x-x0);
			}
			else if(y<miny){
				d = Math.sqrt(Math.pow(x-x0, 2)+Math.pow(y-miny, 2));
			}
			else if(y>maxy){
				d = Math.sqrt(Math.pow(x-x0, 2)+Math.pow(y-maxy, 2));
			}
		}
		else if(Math.abs(y0-y1)<Math.ESPLON){
			// horizonal
			var minx = x0 < x1 ? x0 : x1;
			var maxx = x0 > x1 ? x0 : x1;
			if((x>minx)&&(x<maxx)){
				d = Math.abs(y-y0);
			}
			else if(x<minx){
				d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-minx, 2));
			}
			else if(y>maxy){
				d = Math.sqrt(Math.pow(y-y0, 2)+Math.pow(x-maxx, 2));
			}
		}
		else{
			var k_1  = -(x1-x0) / (y1-y0);
			var k_0 = -1 / k_1;
			var b_0 = y0 - k_0 * x0;
			var b_1 = y  - k_1 * x;

			var k_v = (k_1 - k_0);
			var xx  = (b_0 - b_1) / k_v;
			var yx  = k_1 * xx + b_1;

			var minx = x0 < x1 ? x0 : x1;
			var maxx = x0 > x1 ? x0 : x1;
			if(((xx>minx) && (xx<maxx)) || ((yx>miny) && (yx<maxy))){
				d = Math.sqrt(Math.pow(y-yx, 2)+Math.pow(x-xx, 2));
			}
			else{
				var d0 = Math.sqrt(Math.pow(y0-yx, 2)+Math.pow(x0-xx, 2));
				var d1 = Math.sqrt(Math.pow(y1-yx, 2)+Math.pow(x1-xx, 2));
				d = d0 < d1 ? d0 : d1;
			}		
		}
		return d;
	},


	// 随机数
	getRandom : function(min,max){
		var range = max - min;
		var rand = Math.random();

		return min + Math.round(rand * range);
	},

	// 读取wkt
	createGeometryFromWKT : function(wkt){
		if(wkt == null){
			return null;
		}
		wkt = wkt.trimLeft();
		var type = this._getWKTType(wkt);
		var geometry = this._getWKT(wkt,type);
		return geometry;
	},

	_getWKTType : function(wkt){
		if(wkt == null){
			return null;
		}

		var type = null;
		if(wkt.slice(0,5) == "POINT"){
			type = GeoBeans.Geometry.Type.POINT;
		}else if(wkt.slice(0,10) == "LINESTRING"){
			type = GeoBeans.Geometry.Type.LINESTRING;
		}else if(wkt.slice(0,7) == "POLYGON"){
			type = GeoBeans.Geometry.Type.POLYGON;
		}else if(wkt.slice(0,10) == "MULTIPOINT"){
			type = GeoBeans.Geometry.Type.MULTIPOINT;
		}else if(wkt.slice(0,15) == "MULTILINESTRING"){
			type = GeoBeans.Geometry.Type.MULTILINESTRING;
		}else if(wkt.slice(0,12) == "MULTIPOLYGON"){
			type = GeoBeans.Geometry.Type.MULTIPOLYGON;
		}
		return type;
	},


	_getWKT : function(wkt,type){
		var geometry = null;
		switch(type){
			case GeoBeans.Geometry.Type.POINT:{
				geometry = this._getWKTPoint(wkt);
				break;
			}
			case GeoBeans.Geometry.Type.LINESTRING:{
				geometry = this._getWKTLineString(wkt);
				break;
			}
			case GeoBeans.Geometry.Type.POLYGON:{
				geometry = this._getWKTPolygon(wkt);
				break;
			}
			case GeoBeans.Geometry.Type.MULTIPOINT:{
				geometry = this._getWKTMultiPoint(wkt);
				break;
			}
			case GeoBeans.Geometry.Type.MULTILINESTRING:{
				geometry = this._getWKTMultiLineString(wkt);
				break;
			}
			case GeoBeans.Geometry.Type.MULTIPOLYGON:{
				geometry = this._getWKTMultiPolygon(wkt);
				break;
			}
			default:
				break;
		}
		return geometry;
	},

	_getWKTPoint : function(wkt){
		if(wkt == null){
			return;
		}
		var head = wkt.indexOf("(");
		var tail = wkt.lastIndexOf(")");

		var coordinate = wkt.slice(head + 1,tail);
		
		return this._prasePointByCoordinate(coordinate);
	},

	_getWKTLineString : function(wkt){
		if(wkt == null){
			return;
		}

		var head = wkt.indexOf("(");
		var tail = wkt.lastIndexOf(")");

		var coordinates = wkt.slice(head + 1,tail);
		var points = this._prasePointByCoordinates(coordinates);
		if(points == null){
			return null;
		}
		var lineString = new GeoBeans.Geometry.LineString(points);
		return lineString;
	},

	_prasePointByCoordinate : function(string){
		var array = string.trim().split(/[ ]+/);
		if(array.length != 2){
			return null;
		}
		var point = new GeoBeans.Geometry.Point(array[0],array[1]);
		return point;
	},

	_prasePointByCoordinates : function(string){
		var coordinatesArray = string.split(/[,]+/);
		var points = [];
		for(var i = 0; i < coordinatesArray.length;++i){
			var point = this._prasePointByCoordinate(coordinatesArray[i]);
			if(point != null){
				points.push(point);
			}
		}
		if(points.length == 0){
			return null;
		}
		return points;
	},


	_getWKTPolygon : function(wkt){
		if(wkt == null){
			return null;
		}
		var head = wkt.indexOf("(");
		var tail = wkt.lastIndexOf(")");

		var ringsStr = wkt.slice(head + 1,tail);

		var ringHead = ringsStr.indexOf("(");
		var ringTail = ringsStr.indexOf(")");
		var rings = [];
		while(ringHead != -1){

			var ringStr = ringsStr.slice(ringHead+1,ringTail);
			var points = this._prasePointByCoordinates(ringStr);
			if(points != null){
				var ring = new GeoBeans.Geometry.LineString(points);
				rings.push(ring);
			}
			ringsStr = ringsStr.slice(ringTail+1);
			ringHead = ringsStr.indexOf("(");
			ringTail = ringsStr.indexOf(")");
		}
		if(rings.length == 0){
			return null;
		}
		var polygon = new GeoBeans.Geometry.Polygon(rings);
		return polygon;
	},

	_getWKTMultiPoint : function(wkt){
		if(wkt == null){
			return null;
		}

		var head = wkt.indexOf("(");
		var tail = wkt.lastIndexOf(")");

		var coordinates = wkt.slice(head + 1,tail);
		var points = this._prasePointByCoordinates(coordinates);
		if(points == null){
			return null;
		}	
		
		var multiPoint = new GeoBeans.Geometry.MultiPoint(points);
		return multiPoint;
	},

	_getWKTMultiLineString : function(wkt){
		if(wkt == null){
			return null;
		}
		var head = wkt.indexOf("(");
		var tail = wkt.lastIndexOf(")");

		var linesStr = wkt.slice(head + 1,tail);

		var lineHead = linesStr.indexOf("(");
		var lineTail = linesStr.indexOf(")");
		var lines = [];

		while(lineHead != -1){
			var lineStr = linesStr.slice(lineHead + 1,lineTail);
			var points = this._prasePointByCoordinates(lineStr);
			if(points != null){
				var line = new GeoBeans.Geometry.LineString(points);
				lines.push(line);
			}
			linesStr = linesStr.slice(lineTail +1);
			lineHead = linesStr.indexOf("(");
			lineTail = linesStr.indexOf(")");
		}	

		if(lines.length == 0){
			return null;
		}
		var multiLineString = new GeoBeans.Geometry.MultiLineString(lines);
		return multiLineString;
	},


	_getWKTMultiPolygon : function(wkt){
		if(wkt == null){
			return null;
		}


		var head = wkt.indexOf("(((");
		var tail = wkt.indexOf(")))");

		var polygonsStr = wkt.slice(head + 1,tail + 2);

		var polygonHead = polygonsStr.indexOf("((");
		var polygonTail = polygonsStr.indexOf("))");
		var polygons = [];

		while(polygonHead != -1){
			var polygonStr = polygonsStr.slice(polygonHead+1,polygonTail+1);
			// 解析polygon
			var ringHead = polygonStr.indexOf("(");
			var ringTail = polygonStr.indexOf(")");
			var rings = [];

			while(ringHead != -1){
				var ringStr = polygonStr.slice(ringHead + 1, ringTail);
				var points = this._prasePointByCoordinates(ringStr);
				if(points != null){
					var ring = new GeoBeans.Geometry.LineString(points);
					rings.push(ring);
				}
				polygonStr = polygonStr.slice(ringTail+1);
				ringHead = polygonStr.indexOf("(");
				ringTail = polygonStr.indexOf(")");
			}
			if(rings.length != 0){
				var polygon = new GeoBeans.Geometry.Polygon(rings);
				polygons.push(polygon);
			}
			polygonsStr = polygonsStr.slice(polygonTail + 1);

			polygonHead = polygonsStr.indexOf("((");
			polygonTail = polygonsStr.indexOf("))");
			// polygonsStr = wkt.slice(tail + 1);
			// head = polygonsStr.indexOf("(");
			// tail = polygonsStr.indexOf("))");

			// polygonHead = polygonsStr.indexOf("(");
			// polygonTail = polygonsStr.indexOf(")");
		}

		if(polygons.length == 0){
			return  null;
		}

		var multiPolygon = new GeoBeans.Geometry.MultiPolygon(polygons);
		return multiPolygon;
	},


};


String.prototype.like = function(search) {
    if (typeof search !== 'string' || this === null) {return false; }
    // Remove special chars
    search = search.replace(new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g"), "\\$1");
    // Replace % and _ with equivalent regex
    search = search.replace(/%/g, '.*').replace(/_/g, '.');
    // Check matches
    return RegExp('^' + search + '$', 'gi').test(this);
};