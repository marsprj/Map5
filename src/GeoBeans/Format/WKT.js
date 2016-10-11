/**
 * @classdesc
 * WKT数据格式类
 * @class
 */
GeoBeans.Format.WKT = GeoBeans.Class(GeoBeans.Format,{

	initialize : function(){
	},

	read : null,

	write : null,
});

/**
 * 将WKT字符串转换为Geometry对象
 * @public
 * @return {GeoBeans.Geometry} geometry对象
 */
GeoBeans.Format.WKT.prototype.read = function(wkt){
	if(wkt == null){
		return null;
	}

	wkt = wkt.trimLeft();

	var geometry = null;
	if(wkt.slice(0,5) == "POINT"){
		geometry = this.parseWKTPoint(wkt);
	}else if(wkt.slice(0,10) == "LINESTRING"){
		geometry = this.parseWKTLineString(wkt);
	}else if(wkt.slice(0,7) == "POLYGON"){
		geometry = this.parseWKTPolygon(wkt);
	}else if(wkt.slice(0,10) == "MULTIPOINT"){
		geometry = this.parseWKTMultiPoint(wkt);		
	}else if(wkt.slice(0,15) == "MULTILINESTRING"){
		geometry = this.parseWKTMultiLineString(wkt);
	}else if(wkt.slice(0,12) == "MULTIPOLYGON"){
		geometry = this.parseWKTMultiPolygon(wkt);
	}
	return geometry;
}

/**
 * 将Geometry对象转换为WKT字符串
 * @public
 * @param  {GeoBeans.Geometry} geometry geometry对象
 * @return {string}          wkt字符串
 */
GeoBeans.Format.WKT.prototype.write = function(geometry){
	if(geometry == null){
		return null;
	}

	var type = geometry.type;
	var wkt = null;
	switch(type){
		case GeoBeans.Geometry.Type.POINT:{
			wkt = this.writePoint(geometry);
			break;
		}
		case GeoBeans.Geometry.Type.LINESTRING:{
			wkt = this.writeLineString(geometry);
			break;
		}

		case GeoBeans.Geometry.Type.POLYGON:{
			wkt = this.writePolygon(geometry);
			break;
		}

		case GeoBeans.Geometry.Type.MULTIPOINT:{
			wkt = this.writeMultiPoint(geometry);
			break;
		}
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
			wkt = this.writeMultiLineString(geometry);
			break;
		}
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
			wkt = this.writeMultiPolygon(geometry);
			break;
		}
		default:
			break;
	}
	return wkt;
}

/**
 * 将wkt字符串转换为点对象
 * @private
 * @param  {string} wkt 字符串
 * @return {Geometry}     
 */
GeoBeans.Format.WKT.prototype.parseWKTPoint = function(wkt){
	if(wkt == null){
		return null;
	}
	var head = wkt.indexOf("(");
	var tail = wkt.lastIndexOf(")");
	var coordinate = wkt.slice(head + 1,tail);
	return this.prasePointByCoordinate(coordinate);
};


/**
 * 将wkt字符串转换为线对象
 * @private
 * @param  {string} wkt 字符串
 * @return {Geometry}     [description]
 */
GeoBeans.Format.WKT.prototype.parseWKTLineString = function(wkt){
	if(wkt == null){
		return null;
	}

	var head = wkt.indexOf("(");
	var tail = wkt.lastIndexOf(")");

	var coordinates = wkt.slice(head + 1,tail);
	var points = this.prasePointsByCoordinates(coordinates);
	if(points == null){
		return null;
	}
	var lineString = new GeoBeans.Geometry.LineString(points);
	return lineString;
}


/**
 * 将wkt字符串转换为面对象
 * @private
 * @param  {string} wkt 字符串
 * @return {Geometry}     
 */
GeoBeans.Format.WKT.prototype.parseWKTPolygon = function(wkt){
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
		var points = this.prasePointsByCoordinates(ringStr);
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
}

/**
 * 将wkt字符串转换为多点对象
 * @private
 * @param  {string} wkt 字符串
 * @return {Geometry}     
 */
GeoBeans.Format.WKT.prototype.parseWKTMultiPoint = function(wkt){
	if(wkt == null){
		return null;
	}
	var head = wkt.indexOf("(");
	var tail = wkt.lastIndexOf(")");

	var coordinates = wkt.slice(head + 1,tail);
	var points = this.prasePointsByCoordinates(coordinates);
	if(points == null){
		return null;
	}	
	
	var multiPoint = new GeoBeans.Geometry.MultiPoint(points);
	return multiPoint;
}


/**
 * 将wkt字符串转换为多线对象
 * @private
 * @param  {type} wkt [description]
 * @return {type}     [description]
 */
GeoBeans.Format.WKT.prototype.parseWKTMultiLineString = function(wkt){
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
		var points = this.prasePointsByCoordinates(lineStr);
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
}


/**
 * 将wkt字符串转换为多面对象
 * @private
 * @param  {type} wkt [description]
 * @return {type}     [description]
 */
GeoBeans.Format.WKT.prototype.parseWKTMultiPolygon = function(wkt){
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
				var points = this.prasePointsByCoordinates(ringStr);
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
}


/**
 * 字符串转换为点对象
 * @private
 * @param  {type} string [description]
 * @return {type}        [description]
 */
GeoBeans.Format.WKT.prototype.prasePointByCoordinate = function(string){
	var array = string.trim().split(/[ ]+/);
	if(array.length != 2){
		return null;
	}
	var point = new GeoBeans.Geometry.Point(array[0],array[1]);
	return point;
}

/**
 * 字符串转换为点数组
 * @private
 * @param  {string} string [字符串]
 * @return {Array}        [点数组]
 */
GeoBeans.Format.WKT.prototype.prasePointsByCoordinates = function(string){
	var coordinatesArray = string.split(/[,]+/);
	var points = [];
	for(var i = 0; i < coordinatesArray.length;++i){
		var point = this.prasePointByCoordinate(coordinatesArray[i]);
		if(point != null){
			points.push(point);
		}
	}
	if(points.length == 0){
		return null;
	}
	return points;
}



/**
 * 将点对象转换为WKT对象
 * @private
 * @param  {Geometry} geometry [点对象]
 * @return {string}          [wkt]
 */
GeoBeans.Format.WKT.prototype.writePoint = function(geometry){
	if(geometry == null){
		return null;
	}

	var wkt = "POINT(" + geometry.x + " " + geometry.y + ")";
	return wkt;

}

/**
 * 将线对象转换为WKT对象
 * @private
 * @param  {Geometry} geometry [线对象]
 * @return {string}            [wkt]
 */
GeoBeans.Format.WKT.prototype.writeLineString = function(geometry){
	if(geometry == null){
		return null;
	}
	var points = geometry.points;
	if(!isValid(points)){
		return null;
	}

	var str = this.writePoints(points);
	if(points == null){
		return null;
	}

	var wkt = "LINESTRING(" + str + ")";
	return wkt;
}

/**
 * 将面对象转换为WKT对象
 * @private
 * @param  {Geometry} geometry [面对象]
 * @return {string}            [wkt]
 */
GeoBeans.Format.WKT.prototype.writePolygon = function(geometry){
	if(geometry == null){
		return null;
	}

	var rings = geometry.rings;
	if(!isValid(rings)){
		return null;
	}

	var wkt = "POLYGON(";
	for(var i = 0; i < rings.length;++i){
		var ring = rings[i];
		if(ring != null){
			var points = ring.points;
			var pointsStr = this.writePoints(points);
			if(pointsStr != null){
				wkt += "(" + pointsStr + ")";
			}
			if(i != rings.length - 1){
				wkt += ",";
			}
		}
	}

	wkt += ")";
	return wkt;
}


/**
 * 将多点对象转换为WKT对象
 * @private
 * @param  {Geometry} geometry [多点对象]
 * @return {string}            [wkt]
 */
GeoBeans.Format.WKT.prototype.writeMultiPoint = function(geometry){
	if(geometry == null){
		return null;
	}

	var wkt = "MULTIPOINT(";

	var points = geometry.points;
	var pointsStr = this.writePoints(points);

	wkt += pointsStr + ")";
	return wkt;
}


/**
 * 将多线对象转换为WKT对象
 * @private
 * @param  {Geometry} geometry [多线对象]
 * @return {string}            [wkt]
 */
GeoBeans.Format.WKT.prototype.writeMultiLineString = function(geometry){
	if(geometry == null){
		return null;
	}	

	var wkt = "MULTILINESTRING(";

	var lines = geometry.lines;
	for(var i = 0; i < lines.length;++i){
		var line = lines[i];
		if(lines != null){
			var points = line.points;
			var pointsStr = this.writePoints(points);
			if(pointsStr != null){
				wkt += "(" + pointsStr + ")";

				if(i != lines.length - 1){
					wkt += " , ";
				}
			}
		}
	}

	wkt += ")";
	return wkt;
}


/**
 * 将多面对象转换为WKT对象
 * @private
 * @param  {Geometry} geometry [多面对象]
 * @return {string}            [wkt]
 */
GeoBeans.Format.WKT.prototype.writeMultiPolygon = function(geometry){
	if(geometry == null){
		return null;
	}

	var wkt = "MULTIPOLYGON(";
	var polygons = geometry.polygons;
	for(var i = 0; i < polygons.length;++i){
		var polygon = polygons[i];
		if(polygon == null){
			continue;
		}
		var rings = polygon.rings;
		if(rings == null){
			continue;
		}

		wkt += "(";
		for(var j = 0; j < rings.length;++j){
			var ring = rings[j];
			if(rings == null){
				continue;
			}
			var points = ring.points;
			var pointsStr = this.writePoints(points);
			wkt += "(" + pointsStr + ")";

			if(j != rings.length -1){
				wkt += ",";
			}
		}

		wkt += ")";

		if(i != polygons.length - 1){
			wkt += ",";
		}

	}
	wkt += ")";
	return wkt;
}


/**
 * 将点数组对象转换为string
 * @private
 * @param  {Array} geometry 	[点数组]
 * @return {string}           [字符串]
 */
GeoBeans.Format.WKT.prototype.writePoints = function(points){
	if(points == null){
		return null;
	}
	var str = "";
	for(var i = 0; i < points.length;++i){
		var point = points[i];
		str += point.x + " " + point.y;
		if(i != points.length - 1){
			str += ","
		}
	}
	return str;
}
