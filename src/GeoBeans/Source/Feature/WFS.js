/**
 * @classdesc
 * WFS类型的数据源类。
 * @class
 */
GeoBeans.Source.Feature.WFS = GeoBeans.Class(GeoBeans.Source.Feature, {
	
	initialize : function(options){
		GeoBeans.Source.Feature.prototype.initialize.apply(this, arguments);
	},

	destroy : function(){
		GeoBeans.Source.Feature.prototype.destory.apply(this, arguments);
	},
});
