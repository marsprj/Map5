/**
 * @classdesc
 * Map5的要素类。
 * @class
 */
GeoBeans.Feature = GeoBeans.Class({
	
	fid 	 : -1,
	geometry : null,
	featureType : null,
	_fields  : [],
	_properties	 : {},
	symbolizer: null,
	textSymbolizer : null,
	

	/**
	 * new GeoBeans.Feature({
	 * 	"fid" : fid,
	 * 	"featureType": featureType,
	 * 	"fields"	 : fields,
	 * 	"geometry"   : geometry,
	 * 	"propertis"  : {
	 * 			"name"   : name,
	 *    	  	"value1" : value1,
	 *    	  	"value2" : value2
	 * 	}
	 * })
	 */
	initialize : function(options){
		this.geometry = options.geometry;
		this.fid = isValid(options.fid) ? options.fid : GeoBeans.Utility.uuid();	
		this._properties = isValid(options.properties) ? options.properties : {};

		this.featureType = options.featureType;
		if(isValid(this.featureType)){
			this._fields = this.featureType.getFields();
		}else{
			this._fields = isValid(options.fields) ? options.fields : [];
		}
	},

	destroy : function(){
		this.featureType = null;
		this.geometry = null;
		this._properties = null;
		this._fields = null;
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
 * 获取Feature的geometry对象
 * @return {GeoBeans.Geometry} geometry对象
 */
GeoBeans.Feature.prototype.getGeometry = function(){
	return this.geometry;
}

/**
 * 设置属性值
 * @public
 * @param {string} field 字段名称
 * @param {object} value  属性值
 */
GeoBeans.Feature.prototype.setValue = function(field,value){
	if(isValid(field) && (isValid(value))){
		this._properties[field] = value;
	}
}

// GeoBeans.Feature.prototype.setValue = function(field,value){
// 	var fields = this.featureType.getFields();
// 	for(var i = 0; i < fields.length; ++i){
// 		var f = fields[i];
// 		if(f.name == field){
// 			this._properties[i] = value;
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
	return this._properties[field];
}
// GeoBeans.Feature.prototype.getValue = function(field){
// 	var fields = this.featureType.getFields();
// 	for(var i = 0; i < fields.length; ++i){
// 		var f = fields[i];
// 		if(f.name == field){
// 			return this._properties[i];
// 		}
// 	}
// }

/**
 * 根据字段名称获得属性值
 * @param  {string} index 字段名称
 * @return {object}       属性值
 */
// GeoBeans.Feature.prototype.getValueByIndex = function(index){
// 	var fields = ;
// 	if(index>=0 && index<this._fields.length){
// 		return this._properties[index];
// 	}
// 	return null;
// }