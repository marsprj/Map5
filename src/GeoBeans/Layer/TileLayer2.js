
/**
 * @classdesc
 * 瓦片图层
 * @class
 * @extends {GeoBeans.Layer}
 */
GeoBeans.Layer.TileLayer = GeoBeans.Class(GeoBeans.Layer,{
	
	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.name = options.name;
		this._source = options.source;
	},
});

GeoBeans.Layer.TileLayer.prototype.draw = function(){

};


GeoBeans.Layer.TileLayer.prototype.getMaxZoom = function(){
	
};