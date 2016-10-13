/**
 * @classdesc
 * Feature数据源类。
 * @class
 * @extends {GeoBeans.Source}
 */
GeoBeans.Source.Feature = GeoBeans.Class(GeoBeans.Source, {

	initialize : function(options){
	},

	destroy : function(){
	},
});

/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.prototype.getFeatures = function(filter, success, failure){
	
}

/**
 * 获得指定范围的的Feature
 * @param  {GeoBeans.Envelope} extent 空间范围
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.prototype.getFeaturesByExtent = function(extent, success, failure){
	
}
