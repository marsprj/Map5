/**
 * @classdesc
 * Map5的数据类。
 * @class
 */
GeoBeans.Source = GeoBeans.Class({
	
	_srs : GeoBeans.Proj.WGS84,

	initialize : function(options){
		
	},

	destroy : function(){
		
	},
});

GeoBeans.Source.prototype.getSRS = function(){
	return this._srs;
}