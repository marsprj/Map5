/**
 * 查询类
 * @class
 */
GeoBeans.Query = GeoBeans.Class({
	//_typeName		: null,
	_fields			: [],
	_maxFeatures	: 20,
	_offset			: 0,
	_orderby		: null,		//Orderby Object
	_filter			: null,

	initialize : function(options){
		// if(isValid(options.typeName)){
		// 	this._typeName = options.typeName;
		// }
		if(isValid(options.fields)){
			this._fields = options.fields;
		}
		// if(isValid(options.maxFeatures)){
		// 	this._maxFeatures = options.maxFeatures;
		// }
		this._maxFeatures = options.maxFeatures;
		if(isValid(options.offset)){
			this._offset = options.offset;
		}
		if(isValid(options.orderby)){
			this._orderby = options.orderby;
		}
		if(isValid(options.filter)){
			this._filter = options.filter;
		}
	}
});

/**
 * 获得查询返回字段名称集合
 * @public
 * @return {Array.<String>} 字段名称集合
 */
GeoBeans.Query.prototype.getFields = function(){
	return this._fields;
}

/**
 * 获得查询返回的最大要素个数
 * @public
 * @return {integer} 最大要素个数
 */
GeoBeans.Query.prototype.getMaxFeatures = function(){
	return this._maxFeatures;
}

/**
 * 获得查询结果的偏移量
 * @public
 * @return {integer} 偏移量
 */
GeoBeans.Query.prototype.getOffset = function(){
	return this._offset;
}

/**
 * 获得查询结果排序
 * @public
 * @return {GeoBeans.Query.OrderBy} 排序
 */
GeoBeans.Query.prototype.getOrderby = function(){
	return this._orderby;
}

/**
 * 获得查询结果过滤器对象
 * @public
 * @return {GeoBeans.Filter} 过滤器对象
 */
GeoBeans.Query.prototype.getFilter = function(){
	return this._filter;
}

