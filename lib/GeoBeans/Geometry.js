// JavaScript Document

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

GeoBeans.Geometry.Type = {

	POINT: 'Point',
	LINESTRING: 'LineString',
	POLYGON: 'Polygon',
	MULTIPOINT: 'MultiPoint',
	MULTILINESTRING: 'MultiLineString',
	MULTIPOLYGON: 'MultiPolygon',
	CIRCLE : 'Circle'
};


/**
 * Method: 
 * Create Geometry from WKT
 */ 
GeoBeans.Geometry.fromWKT = function(wkt){
	
}
