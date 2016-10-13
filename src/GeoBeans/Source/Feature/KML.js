/**
 * @classdesc
 * KML类型的数据源类。
 * @class
 */
GeoBeans.Source.Feature.KML = GeoBeans.Class(GeoBeans.Source.Feature, {
	_url : "",
	_format : null,

	_loaded : false,
	
	initialize : function(options){

		this._url = isValid(options.url) ? options.url : "";		
		this._format = new GeoBeans.Format.KML(options.geometryName);

		GeoBeans.Source.Feature.prototype.initialize.apply(this, arguments);
	},

	destroy : function(){
		GeoBeans.Source.Feature.prototype.destory.apply(this, arguments);
	},
});
