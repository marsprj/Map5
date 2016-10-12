/**
 * @classdesc
 * Map5的要素类。
 * @class
 */
GeoBeans.Feature = GeoBeans.Class({
	
	featureType : null,
	
	fid 	 : -1,
	geometry : null,
	_values	 : {},
	symbolizer: null,
	
	initialize : function(featureType, fid, geometry, values){
		this.featureType = featureType;
		this.fid = fid;
		this.geometry = geometry;	
		this._values = values;
	},
	
	destroy : function(){
		this.featureType = null;
		this.geometry = null;
		this._values = null;
	},
});

/**
 * 获得FeatureType
 * @public
 * @return {GeoBeans.FeatureType} FeatureType对象
 */
GeoBeans.Feature.prototype.getFeatureType = function(){
	return this.featureType;
}

/**
 * 设置属性值
 * @public
 * @param {string} field 字段名称
 * @param {object} value  属性值
 */
GeoBeans.Feature.prototype.setValue = function(field,value){
	if(isValid(field) && (isValid(value))){
		this._values[field] = value;
	}
}

// GeoBeans.Feature.prototype.setValue = function(field,value){
// 	var fields = this.featureType.getFields();
// 	for(var i = 0; i < fields.length; ++i){
// 		var f = fields[i];
// 		if(f.name == field){
// 			this._values[i] = value;
// 			return;
// 		}
// 	}
// }

/**
 * 根据字段名称获得属性值
 * @public
 * @param  {string} field 字段名称
 * @return {object}       属性值
 */
GeoBeans.Feature.prototype.getValue = function(field){
	return this._values[field];
}
// GeoBeans.Feature.prototype.getValue = function(field){
// 	var fields = this.featureType.getFields();
// 	for(var i = 0; i < fields.length; ++i){
// 		var f = fields[i];
// 		if(f.name == field){
// 			return this._values[i];
// 		}
// 	}
// }

/**
 * 根据字段名称获得属性值
 * @param  {string} index 字段名称
 * @return {object}       属性值
 */
GeoBeans.Feature.prototype.getValueByIndex = function(index){
	var fields = this.featureType.getFields();
	if(index>=0 && index<fields.length){
		return this._values[index];
	}
	return null;
}