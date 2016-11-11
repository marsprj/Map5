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
 * WGS84投影类
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
 * WebMercator投影类
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