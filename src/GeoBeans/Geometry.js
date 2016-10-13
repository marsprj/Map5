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
