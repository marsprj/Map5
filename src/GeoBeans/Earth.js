/**
 * @classdesc
 * Map5的Earth类,实现Earth相关的各类算法。
 * @class
 */
GeoBeans.Earth = {

	RADIUS : 6378136,	//unit: meter

}

/**
 * 计算球面上两点之间的距离。
 * @param  {float} lon1 pt1的经度
 * @param  {float} lat1 pt1的纬度
 * @param  {float} lon2 pt2的经度
 * @param  {float} lat2 pt2的纬度
 * @param  {GeoBeans.Unit} unit 距离单位
 * @return {float}      球面上两点之间的距离两点间的距离 
 * @description 计算球面上两点之间的距离。<br>点坐标为WGS84坐标系下的经纬度坐标，单位为度。<br>距离的默认单位为米。。<br>球面上两点之间的距离是通过两点的大圆的小弧的长度。
 * @public
 */
GeoBeans.Earth.distance = function(lon1, lat1, lon2, lat2, unit){

	var c = Math.PI / 180.0;
	var x1 = lon1 * c;
	var y1 = lat1 * c;
	var x2 = lon2 * c;
	var y2 = lat2 * c;
	
	var d = this.RADIUS * Math.acos(Math.sin(y1)*Math.sin(y2) + Math.cos(y1)*Math.cos(y2)*Math.cos(x1-x2));

	switch(unit){
		case GeoBeans.Unit.meter: //meter
		break;
		case GeoBeans.Unit.kilometer: //kilometer
			d = d / 1000.0;
		break;
	}

	return d;
}

/**
 * 计算多边形面积
 * @param  {GeoBeans.Geometry.Polygon|GeoBeans.Geometry.MultiPolygon} polygon 多边形
 * @param  {GeoBeans.Unit} unit 距离单位
 * @return {float}         多边形面积(默认为米)
 * @public
 */
GeoBeans.Earth.area = function(polygon, unit){
	if(!isValid(polygon)){
		return 0.0;
	}

	var area = 0.0;
	switch(polygon.type){
		case GeoBeans.Geometry.Type.POLYGON:{
			area = GeoBeans.Earth.computePolyonArea(polygon, unit);
		}
		break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{			
			var polygons = polygon.getPolygons();
			polygons.forEach(function(p){
				area += GeoBeans.Earth.computePolyonArea(p, unit);
			});
		}
		break;
	}

	return area;
}

/**
 * 计算多边形面积
 * @param  {GeoBeans.Geometry.Polygon} polygon 多边形
 * @param  {GeoBeans.Unit} unit 单位(默认为米)
 * @return {float}      多边形面积
 * @private
 */
GeoBeans.Earth.computePolyonArea = function(polygon, unit){

	var area = 0.0;

	if(polygon.type == GeoBeans.Geometry.Type.POLYGON){
		var rings = polygon.getRings();
		rings.forEach(function(r){
			area += GeoBeans.Earth.computeRingArea(r,unit);
		});
	}
	return area;
}

/**
 * 计算多边形面积
 * @param  {GeoBeans.Geometry.LinearRing} ring 环
 * @param  {GeoBeans.Unit} unit 单位(默认为米)
 * @return {float}     环面积
 * @private
 */
GeoBeans.Earth.computeRingArea = function(ring, unit){

	var area = 0.0;
	var pts = ring.getPoints();
	var len = pts.length;
	var pt1 = pts[len-1];
	var pt2 = null;

	for(var i=0; i<len; i++){
		pt2 = pts[i];
		area += GeoBeans.Math.toRadian(pt2.x-pt1.x)　* 
				(2 + Math.sin(GeoBeans.Math.toRadian(pt1.y)) + Math.sin(GeoBeans.Math.toRadian(pt2.y)));

		pt1 = pt2;	
	}
	this.RADIUS = 6378136;

	area = area * this.RADIUS * this.RADIUS / 2.0;

	switch(unit){
		case GeoBeans.Unit.Meter: //meter
		break;
		case GeoBeans.Unit.Kilometer: //kilometer
			area = area / 1000.0 / 1000.0;
		break;
	}

	return area;
}
