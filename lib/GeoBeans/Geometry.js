// JavaScript Document

GeoBeans.Geometry = GeoBeans.Class({
	id : null,
	
	extent : null,
	
	initialize : function(){
	},
	
	destory : function(){
		this.id = null;
		this.extent = null;
	},
	
	/**
	 * Method:
	 *	weather the point (x, y) locates in the Geometry
	 */
	hit : function(x, y){
	}
});

GeoBeans.Geometry.Type = {

	POINT: 'Point',
	LINESTRING: 'LineString',
	POLYGON: 'Polygon',
	MULTIPOINT: 'MultiPoint',
	MULTILINESTRING: 'MultiLineString',
	MULTIPOLYGON: 'MultiPolygon'
};


/**
 * Method: 
 * Create Geometry from WKT
 */ 
GeoBeans.Geometry.fromWKT = function(wkt){
	
}
