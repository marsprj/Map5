/**
 * @classdesc
 * 投影类。
 * @class
 */
GeoBeans.Proj = GeoBeans.Class({

	EARTH_RADIUS : 6378136,	//unit: meter
	PROJ_CONSTANT : 1,

	initialize : function(options){

		this.PROJ_CONSTANT =  this.EARTH_RADIUS * Math.PI / 180.0;
	},

	destroy : function(){
	}
});

var EARTH_RADIUS = 6378136;	//unit: meter
var PROJ_CONSTANT= EARTH_RADIUS * Math.PI / 180.0;

/**
 * 经纬度(WGS84)转平面坐标(Web Mercator)
 * @param  {float} lon 经度
 * @param  {float} lat 纬度
 * @return {GeoBeans.Geometry.Point}     平面坐标点
 * @public
 */
GeoBeans.Proj.fromLonLat = function(lon, lat){

	var x = lon * PROJ_CONSTANT;
	var y = Math.log(Math.tan((90+lat)*Math.PI/360))/(Math.PI/180);  
	//y = y * 20037508.34 / 180;
	y = y * PROJ_CONSTANT;
	return (new GeoBeans.Geometry.Point(x, y));
}

/**
 * 平面坐标(Web Mercator)转经纬度(WGS84)
 * @param  {float} x x坐标
 * @param  {float} y y坐标
 * @returns {GeoBeans.Geometry.Point}     经纬度坐标点
 * @public
 */
GeoBeans.Proj.toLonLat = function(x, y){

	var lon = x / PROJ_CONSTANT;
	var lat = y / PROJ_CONSTANT;
	lat = 180 / Math.PI * (2 * Math.atan( Math.exp(lat * Math.PI / 180)) - Math.PI / 2); 

	return (new GeoBeans.Geometry.Point(lon, lat));
}

/**
 * @classdesc
 * WGS84投影类
 * @class 
 */
GeoBeans.Proj.WGS84 = {
	SRID : "EPSG:4326",
	EXTENT : new GeoBeans.Envelope(
		-180.0, -90.0,
		 180.0,  90.0
	),
	UNIT : "degree"
}

/**
 * 计算两点之间的距离。
 * @param  {float} lon1 pt1的经度
 * @param  {float} lat1 pt1的纬度
 * @param  {float} lon2 pt2的经度
 * @param  {float} lat2 pt2的纬度
 * @param  {GeoBeans.Unit} unit 距离单位
 * @return {float}      两点之间的距离两点间的距离 
 * @public
 */
GeoBeans.Proj.WGS84.distance = function(lon1, lat1, lon2, lat2, unit){
	return GeoBeans.Earth.distance(lon1, lat1, lon2, lat2, unit);
}

/**
 * 计算线段长度
 * @param  {GeoBeans.Geometry.LineString|GeoBeans.Geometry.MultiLineString} line 线段
 * @param  {GeoBeans.Unit} unit 距离单位
 * @return {float}      线段长度 
 * @public
 */
GeoBeans.Proj.WGS84.computeLength = function(line, unit){
	if(!isValid(line)){
		return 0;
	}

	var len = 0;
	switch(line.type){
		case GeoBeans.Geometry.Type.LINESTRING:{
			var pt1=null,pt2=null;
			var pts = line.getPoints();
			var count = pts.length - 1;
			for(var j=0; j<count; j++){
				pt1 = pts[j];
				pt2 = pts[j+1];
				len += this.distance(pt1.x, pt1,y, pt2.x, pt2.y, unit);
			}

		}
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
			var lines = line.getLines();
			lines.forEach(function(l){
				var pt1=null,pt2=null;
				var pts = l.getPoints();
				var count = pts.length - 1;
				for(var j=0; j<count; j++){
					pt1 = pts[j];
					pt2 = pts[j+1];
					len += this.distance(pt1.x, pt1,y, pt2.x, pt2.y, unit);
				}
			});
		}
	}

	return len;
}

/**
 * @classdesc
 * WebMercator投影类
 * @class
 */
GeoBeans.Proj.WebMercator = {
	/** 
	 * SRID
	 * @type {String}
	 */
	SRID : "EPSG:3857",
	/** 
	 * WebMercator投影下的空间范围
	 * @type {Object}
	 */
	EXTENT : new GeoBeans.Envelope(
		-20037508.3427892,		
		-20037508.3427892,
		 20037508.3427892,
		 20037508.3427892
	),
	/** 
	 * 单位
	 * @type {String}
	 */
	UNIT : "meter"
}

/**
 * 计算两点之间的距离。
 * @param  {float} x1	pt1的x坐标
 * @param  {float} y1 	pt1的y坐标
 * @param  {float} x2	pt2的x坐标
 * @param  {float} y2 	pt2的y坐标
 * @param  {GeoBeans.Unit} unit 距离单位
 * @return {float}      两点之间的距离两点间的距离 
 * @public
 */
GeoBeans.Proj.WebMercator.distance = function(x1, y1, x2, y2, unit){

	var pt1 = GeoBeans.Proj.toLonLat(x1,y1);
	var pt2 = GeoBeans.Proj.toLonLat(x2,y2);

	return GeoBeans.Earth.distance(pt1.x, pt1.y, pt2.x, pt2.y, unit);
}