/**
 * @class Feature Soure查询类
 * @param  {[type]}   ){	} [description]
 * @param  {GeoBeans} clone  :             function(){		var clone [description]
 * @return {[type]}          [description]
 */
GeoBeans.Query = GeoBeans.Class({
	_typeName		: null,
	_fields			: [],
	_maxFeatures	: 20,
	_offset			: 0,
	_orderby		: null,		//Orderby Object
	_filter			: null,

	/**
	 * 初始化Query对象
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	initialize : function(options){
		if(isValid(options.typeName)){
			this._typeName = options.typeName;
		}
		if(isValid(options.fields)){
			this._fields = options.fields;
		}
		if(isValid(options.maxFeatures)){
			this._maxFeatures = options.maxFeatures;
		}
		if(isValid(options.offset)){
			this._offset = options.offset;
		}
		if(isValid(options.orderby)){
			this._orderby = options.orderby;
		}
		if(isValid(options.filter)){
			this._filter = options.filter;
		}
	},

	getTypeName : function(){
		return this._typeName;
	},

	getFields : function(){
		return this._fields;
	},

	getMaxFeatures : function(){
		return this._maxFeatures;
	},

	getOffset : function(){
		return this._offset;
	},

	getOrderby : function(){
		return this._orderby;
	},

	getFilter : function(){
		return this._filter;
	}
});



