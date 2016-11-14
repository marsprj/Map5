/**
 * @classdesc
 * Map5的几何类
 * @class
 */
GeoBeans.Geometry = GeoBeans.Class({
	id : null,
	
	extent : null,
	
	initialize : function(){
	},
	
	destroy : function(){
		this.id = null;
		this.extent = null;
	},

	getCentroid : function(){

	},
	
	/**
	 * Method:
	 *	weather the point (x, y) locates in the Geometry
	 */
	hit : null,
});

/**
 * 返回Geometr空间范围
 * @return {GeoBeans.Envelope} Geometr空间范围
 */
GeoBeans.Geometry.prototype.getExtent = function(){
	return this.extent;
}

/**
 * 计算Buffer
 * @param  {float} radius 缓冲区半径
 * @return {GeoBeans.Geometry.Polygon|GeoBeans.Geometry.MultiPolygon} Geometry的缓冲区
 * @public
 */
GeoBeans.Geometry.prototype.buffer = function(radius){
	return null;
}

GeoBeans.Geometry.Type = {

	POINT: 'Point',
	LINESTRING: 'LineString',
	POLYGON: 'Polygon',
	MULTIPOINT: 'MultiPoint',
	MULTILINESTRING: 'MultiLineString',
	MULTIPOLYGON: 'MultiPolygon',
	CIRCLE : 'Circle',
	COLLECTION : "GeometryCollection"
};

// /**
//  * Method: 
//  * Create Geometry from WKT
//  */ 
// GeoBeans.Geometry.fromWKT = function(wkt){
	
// }
