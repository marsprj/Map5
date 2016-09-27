
GeoBeans.Field.Type = {
	DOUBLE 	: "double",
	STRING	: "string",
	GEOMETRY: "geometry"
};

/**
 * @classdesc
 * Map5的Feature对象的字段类。
 * @class
 */
GeoBeans.Field = GeoBeans.Class({
	
	featureType : null,
	name	: null,
	type	: null,
	geomType: null,
	length 	: null,
	
	initialize : function(name, type, featureType,length){
		this.name = name;
		this.type = type;
		this.featureType = featureType;
		this.length = length;
	},
	
	destroy : function(){
		this.name = null;
		this.type = null;
		this.featureType = null;
	},
	
	setGeomType : function(type){
		this.geomType = type;
	}
});

/**
 * 获得字段名称
 * @return {string} 字段名称
 */
GeoBeans.Field.prototype.getName = function(){
	return this.name;
}

/**
 * 获得字段类型
 * @return {GeoBeans.Field.Type} 字段类型
 */
GeoBeans.Field.prototype.getType = function(){
	return this.type;
}

/**
 * 获得字段长度
 * @return {integer} 字段长度
 */
GeoBeans.Field.prototype.getLength = function(){
	return this.length;
}

/**
 * 获得字段几何类型
 * @return {GeoBeans.Geometry.Type} 几何类型
 */
GeoBeans.Field.prototype.getGeometryType = function(){
	return this.geomType;
}